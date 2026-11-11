import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface HealthCheckResponse {
  status: "healthy" | "degraded";
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  database: {
    status: "connected" | "demo_fallback_active";
    latencyMs: number;
    error?: string;
  };
  aiEngine: {
    status: "configured" | "local_persona_fallback";
    model: string;
    personaEngineActive: boolean;
  };
  system: {
    nodeVersion: string;
    nextPublicAppUrl: string;
    sddSpecVersion: string;
  };
}

const startTime = Date.now();

export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  const checkStart = Date.now();
  let dbStatus: "connected" | "demo_fallback_active" = "demo_fallback_active";
  let dbError: string | undefined = undefined;

  try {
    // Quick test query against PostgreSQL
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (err: unknown) {
    dbError = err instanceof Error ? err.message : "Database unreachable";
    dbStatus = "demo_fallback_active";
  }

  const dbLatencyMs = Date.now() - checkStart;

  // Gemini API Key validation
  const apiKey = process.env.GEMINI_API_KEY;
  const isGeminiConfigured = Boolean(
    apiKey &&
      !apiKey.includes("your-gemini-api-key") &&
      apiKey.trim().length > 10
  );

  const response: HealthCheckResponse = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    environment: process.env.NODE_ENV || "development",
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      ...(dbError ? { error: dbError } : {}),
    },
    aiEngine: {
      status: isGeminiConfigured ? "configured" : "local_persona_fallback",
      model: isGeminiConfigured
        ? "gemini-1.5-flash"
        : "Local Anti-Footprint 6-Persona Engine",
      personaEngineActive: true,
    },
    system: {
      nodeVersion: process.version,
      nextPublicAppUrl:
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      sddSpecVersion: "1.0 (MVP)",
    },
  };

  return NextResponse.json(response, { status: 200 });
}

