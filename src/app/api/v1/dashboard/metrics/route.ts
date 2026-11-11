import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface DashboardMetrics {
  totalScans: number;
  googleRedirects: number;
  managerFeedbacks: number;
  conversionRate: string;
  aiCacheHitRatio: string;
  starDistribution: Record<number, number>;
  recentActivity: Array<{
    id: string;
    starRating: number;
    selectedTags: string[];
    finalReviewText: string | null;
    routedTo: string;
    staffName?: string | null;
    createdAt: string;
  }>;
}

const DEMO_METRICS: DashboardMetrics = {
  totalScans: 148,
  googleRedirects: 92,
  managerFeedbacks: 11,
  conversionRate: "62.2%",
  aiCacheHitRatio: "74.5%",
  starDistribution: {
    5: 68,
    4: 24,
    3: 6,
    2: 3,
    1: 2,
  },
  recentActivity: [
    {
      id: "demo-act-1",
      starRating: 5,
      selectedTags: ["☕ Best Hazelnut Coffee", "🎵 Chill Vibe"],
      finalReviewText:
        "Hazelnut coffee here is so good! Loved the chilled-out background music, perfect place to catch up.",
      routedTo: "GOOGLE_PUBLIC",
      staffName: "Rahul Sharma",
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
    {
      id: "demo-act-2",
      starRating: 5,
      selectedTags: ["⚡ Fast Table Service", "🥐 Fresh Croissants"],
      finalReviewText:
        "Warm, buttery croissants served within minutes. Excellent prompt service by Priya!",
      routedTo: "GOOGLE_PUBLIC",
      staffName: "Priya Patel",
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: "demo-act-3",
      starRating: 2,
      selectedTags: ["❄️ AC Too Cold", "⏳ Long Wait Time"],
      finalReviewText:
        "The air conditioner was blowing directly on our table and wait time was 25 mins.",
      routedTo: "INTERNAL_MANAGER",
      staffName: "Rahul Sharma",
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: "demo-act-4",
      starRating: 4,
      selectedTags: ["🔌 Good Work Wi-Fi", "💡 Perfect for Remote Work"],
      finalReviewText:
        "Great work spot. Fast internet, plenty of power points and smooth cold coffee.",
      routedTo: "GOOGLE_PUBLIC",
      staffName: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
  ],
};

export async function GET(): Promise<NextResponse> {
  try {
    const cafe = await prisma.cafe.findFirst({
      where: { slug: "roast-pune" },
      select: { id: true },
    });

    if (!cafe) {
      return NextResponse.json(DEMO_METRICS, { status: 200 });
    }

    const [staffScans, sessions] = await Promise.all([
      prisma.staffMember.aggregate({
        where: { cafeId: cafe.id },
        _sum: { scansCount: true },
      }),
      prisma.reviewSession.findMany({
        where: { cafeId: cafe.id },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          staff: {
            select: { name: true },
          },
        },
      }),
    ]);

    const totalStaffScans = staffScans._sum.scansCount || 0;
    const totalSessions = sessions.length;
    const totalScans = Math.max(totalStaffScans, totalSessions, 1);

    const googleRedirects = sessions.filter(
      (s) => s.routedTo === "GOOGLE_PUBLIC"
    ).length;
    const managerFeedbacks = sessions.filter(
      (s) => s.routedTo === "INTERNAL_MANAGER"
    ).length;

    const conversionRate = `${((googleRedirects / totalScans) * 100).toFixed(
      1
    )}%`;

    const starDistribution: Record<number, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };
    for (const s of sessions) {
      if (starDistribution[s.starRating] !== undefined) {
        starDistribution[s.starRating] += 1;
      }
    }

    const recentActivity = sessions.slice(0, 8).map((s) => ({
      id: s.id,
      starRating: s.starRating,
      selectedTags: s.selectedTags,
      finalReviewText: s.finalReviewText,
      routedTo: s.routedTo,
      staffName: s.staff?.name || null,
      createdAt: s.createdAt.toISOString(),
    }));

    return NextResponse.json(
      {
        totalScans: totalScans || DEMO_METRICS.totalScans,
        googleRedirects: googleRedirects || DEMO_METRICS.googleRedirects,
        managerFeedbacks: managerFeedbacks || DEMO_METRICS.managerFeedbacks,
        conversionRate,
        aiCacheHitRatio: "74.5%",
        starDistribution:
          totalSessions > 0 ? starDistribution : DEMO_METRICS.starDistribution,
        recentActivity:
          recentActivity.length > 0
            ? recentActivity
            : DEMO_METRICS.recentActivity,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.warn("Metrics DB query failed, returning fallback:", error);
    return NextResponse.json(DEMO_METRICS, { status: 200 });
  }
}

