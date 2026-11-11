import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await context.params;
  const searchParams = request.nextUrl.searchParams;
  const staffCode = searchParams.get("s");

  const normalizedSlug = (slug || "").trim().toLowerCase();
  const staffQuery = staffCode ? `?s=${encodeURIComponent(staffCode)}` : "";

  try {
    const cafe = await prisma.cafe.findFirst({
      where: {
        slug: normalizedSlug,
        isActive: true,
      },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!cafe) {
      // Local dev fallback for roast-pune if DB has not been seeded or cafe not found
      if (normalizedSlug === "roast-pune") {
        return NextResponse.redirect(
          new URL(`/r/demo-roast-pune-id${staffQuery}`, request.url),
          307
        );
      }

      return NextResponse.json(
        { error: `Cafe '${slug}' was not found or is currently inactive.` },
        { status: 404 }
      );
    }

    // Asynchronously increment scansCount for staff member if staffCode is present
    if (staffCode) {
      prisma.staffMember
        .updateMany({
          where: {
            cafeId: cafe.id,
            staffCode: staffCode,
            isActive: true,
          },
          data: {
            scansCount: { increment: 1 },
          },
        })
        .catch((err: unknown) => {
          // Non-blocking background update
          console.warn("Could not increment staff scan count:", err);
        });
    }

    // 307 Temporary Redirect to customer review experience
    return NextResponse.redirect(
      new URL(`/r/${cafe.id}${staffQuery}`, request.url),
      307
    );
  } catch (error: unknown) {
    console.warn("Database lookup failed in /q/[slug], checking fallback:", error);

    // Dev Fallback when DB is unreachable
    if (normalizedSlug === "roast-pune") {
      return NextResponse.redirect(
        new URL(`/r/demo-roast-pune-id${staffQuery}`, request.url),
        307
      );
    }

    return NextResponse.json(
      { error: "Service temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  }
}

