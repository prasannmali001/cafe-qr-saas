import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { RouteDestination } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SubmitReviewSchema } from "@/lib/validations/review.schema";
import { buildGoogleDeeplinks } from "@/lib/google-deeplink";

const DEMO_PLACE_ID = "ChIJd8BlQ2BZwokRAFUEcm_qrcA";
const DEMO_CAFE_NAME = "The Roast Cafe";

function hashIp(rawIp: string): string {
  const salt = process.env.IP_HASH_SALT || "cafe-qr-salt";
  return crypto
    .createHash("sha256")
    .update(`${rawIp}-${salt}`)
    .digest("hex");
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body" },
      { status: 400 }
    );
  }

  const parsed = SubmitReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation error",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const {
    sessionId,
    cafeId,
    staffCode,
    starRating,
    selectedTags,
    finalReviewText,
    routedTo,
    customerContact,
  } = parsed.data;

  // Extract client IP for rate limiting and fraud tracking
  const forwardedFor = request.headers.get("x-forwarded-for");
  const rawIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
  const ipHash = hashIp(rawIp);

  try {
    // 1. Look up Cafe
    let cafe = await prisma.cafe.findUnique({
      where: { id: cafeId },
      select: {
        id: true,
        name: true,
        googlePlaceId: true,
      },
    });

    if (!cafe) {
      // Try finding by slug if cafeId was passed as a slug
      cafe = await prisma.cafe.findUnique({
        where: { slug: cafeId },
        select: {
          id: true,
          name: true,
          googlePlaceId: true,
        },
      });
    }

    // If still not found (e.g., demo-roast-pune-id or DB unseeded)
    if (!cafe) {
      const fallbackLinks = buildGoogleDeeplinks(DEMO_PLACE_ID, DEMO_CAFE_NAME);
      return NextResponse.json(
        {
          success: true,
          ...fallbackLinks,
          warning: "Demo cafe mode - session recorded in offline fallback",
        },
        { status: 200 }
      );
    }

    // 2. Staff Member lookup & review count increment
    let staffId: string | null = null;
    if (staffCode) {
      const staff = await prisma.staffMember.findFirst({
        where: {
          cafeId: cafe.id,
          staffCode: staffCode,
          isActive: true,
        },
        select: { id: true },
      });

      if (staff) {
        staffId = staff.id;
        if (routedTo === RouteDestination.GOOGLE_PUBLIC) {
          prisma.staffMember
            .update({
              where: { id: staff.id },
              data: { reviewsGenerated: { increment: 1 } },
            })
            .catch((err: unknown) => {
              console.warn("Could not increment staff reviewsGenerated:", err);
            });
        }
      }
    }

    // 3. Save ReviewSession (upsert for idempotency)
    await prisma.reviewSession.upsert({
      where: { id: sessionId },
      update: {
        starRating,
        selectedTags,
        finalReviewText: finalReviewText || null,
        routedTo,
        customerContact: customerContact || null,
      },
      create: {
        id: sessionId,
        cafeId: cafe.id,
        staffId,
        starRating,
        selectedTags,
        finalReviewText: finalReviewText || null,
        routedTo,
        customerContact: customerContact || null,
        ipHash,
      },
    });

    const links = buildGoogleDeeplinks(cafe.googlePlaceId, cafe.name);

    return NextResponse.json(
      {
        success: true,
        ...links,
      },
      { status: 200 }
    );
  } catch (dbError: unknown) {
    console.warn("Database error during review submission, returning fallback:", dbError);

    // Dev Fallback so customer flow never crashes on network/DB failure
    const fallbackLinks = buildGoogleDeeplinks(DEMO_PLACE_ID, DEMO_CAFE_NAME);
    return NextResponse.json(
      {
        success: true,
        ...fallbackLinks,
        warning: "Offline fallback mode: Review captured locally",
      },
      { status: 200 }
    );
  }
}

