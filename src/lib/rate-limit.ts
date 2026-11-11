import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const SESSION_MAX_ENHANCEMENTS = 3;
export const IP_DAILY_MAX_ENHANCEMENTS = 15;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export interface RateLimitResult {
  allowed: boolean;
  remainingUses: number;
  reason?: string;
}

// In-memory fallback maps for local dev & serverless process lifespan
const memorySessionCounts = new Map<string, number>();
const memoryIpCounts = new Map<string, { count: number; resetAt: number }>();

/**
 * Generates a privacy-preserving SHA-256 hash of the client IP address.
 */
export function hashIp(rawIp: string): string {
  const salt = process.env.IP_HASH_SALT || "cafe-qr-salt-2026";
  const cleanIp = (rawIp || "127.0.0.1").trim();
  return crypto
    .createHash("sha256")
    .update(`${cleanIp}-${salt}`)
    .digest("hex");
}

/**
 * 2-Tier Rate Limit Check:
 * Tier 1: Session Cap (Max 3 enhancements per session).
 * Tier 2: IP Daily Cap (Max 15 enhancements per IP per 24 hours).
 */
export async function checkEnhanceRateLimit(
  sessionId: string,
  rawIp: string
): Promise<RateLimitResult> {
  const ipHash = hashIp(rawIp);
  const now = Date.now();

  // --- Tier 1: Session Cap Check ---
  let sessionUses = memorySessionCounts.get(sessionId) ?? 0;

  try {
    const session = await prisma.reviewSession.findUnique({
      where: { id: sessionId },
      select: { aiEnhanceCount: true },
    });
    if (session) {
      sessionUses = Math.max(sessionUses, session.aiEnhanceCount);
    }
  } catch {
    // Database offline, use memory count
  }

  if (sessionUses >= SESSION_MAX_ENHANCEMENTS) {
    return {
      allowed: false,
      remainingUses: 0,
      reason: `Max ${SESSION_MAX_ENHANCEMENTS} AI enhancements reached for this review session`,
    };
  }

  // --- Tier 2: IP Daily Cap Check ---
  let ipRecord = memoryIpCounts.get(ipHash);
  if (!ipRecord || ipRecord.resetAt <= now) {
    ipRecord = { count: 0, resetAt: now + ONE_DAY_MS };
    memoryIpCounts.set(ipHash, ipRecord);
  }

  let totalIpUses = ipRecord.count;

  try {
    const oneDayAgo = new Date(now - ONE_DAY_MS);
    const dbIpAggregate = await prisma.reviewSession.aggregate({
      where: {
        ipHash,
        createdAt: { gte: oneDayAgo },
      },
      _sum: {
        aiEnhanceCount: true,
      },
    });
    const dbUses = dbIpAggregate._sum.aiEnhanceCount || 0;
    totalIpUses = Math.max(totalIpUses, dbUses);
  } catch {
    // Database offline, use memory count
  }

  if (totalIpUses >= IP_DAILY_MAX_ENHANCEMENTS) {
    return {
      allowed: false,
      remainingUses: 0,
      reason: `Daily AI enhancement limit reached (${IP_DAILY_MAX_ENHANCEMENTS}/day). Please post review directly.`,
    };
  }

  const remaining = Math.max(0, SESSION_MAX_ENHANCEMENTS - sessionUses);
  return {
    allowed: true,
    remainingUses: remaining,
  };
}

/**
 * Records an enhancement usage in both memory and database.
 * Returns the updated remaining uses count for this session.
 */
export async function recordEnhancementUsage(
  sessionId: string,
  rawIp: string
): Promise<number> {
  const ipHash = hashIp(rawIp);
  const now = Date.now();

  // 1. Update in-memory session count
  const currentSessionUses = (memorySessionCounts.get(sessionId) ?? 0) + 1;
  memorySessionCounts.set(sessionId, currentSessionUses);

  // 2. Update in-memory IP daily count
  let ipRecord = memoryIpCounts.get(ipHash);
  if (!ipRecord || ipRecord.resetAt <= now) {
    ipRecord = { count: 1, resetAt: now + ONE_DAY_MS };
  } else {
    ipRecord.count += 1;
  }
  memoryIpCounts.set(ipHash, ipRecord);

  // 3. Increment in PostgreSQL if session exists
  try {
    await prisma.reviewSession.updateMany({
      where: { id: sessionId },
      data: {
        aiEnhanceCount: { increment: 1 },
      },
    });
  } catch (err: unknown) {
    // Non-blocking if session is not yet saved in DB
    console.warn("Could not record aiEnhanceCount in DB:", err);
  }

  return Math.max(0, SESSION_MAX_ENHANCEMENTS - currentSessionUses);
}

