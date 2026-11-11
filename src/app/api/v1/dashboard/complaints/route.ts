import { NextRequest, NextResponse } from "next/server";
import { RouteDestination } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface DashboardComplaint {
  id: string;
  starRating: number;
  selectedTags: string[];
  finalReviewText: string | null;
  customerContact: string | null;
  staffName: string | null;
  staffCode: string | null;
  isResolved: boolean;
  createdAt: string;
}

const MEMORY_COMPLAINTS: DashboardComplaint[] = [
  {
    id: "comp-demo-1",
    starRating: 2,
    selectedTags: ["❄️ AC Too Cold", "⏳ Long Wait Time"],
    finalReviewText:
      "We sat near table 4 and the AC was directly blowing on our faces. Took 25 mins to get our cold brew.",
    customerContact: "+91 98220 12345",
    staffName: "Rahul Sharma",
    staffCode: "rahul01",
    isResolved: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "comp-demo-2",
    starRating: 1,
    selectedTags: ["☕ Coffee Was Luke-warm", "🧂 Food Needed Seasoning"],
    finalReviewText:
      "The latte was barely warm and the avocado toast had no salt or lemon. Need to speak with manager.",
    customerContact: "customer.feedback@gmail.com",
    staffName: "Priya Patel",
    staffCode: "priya02",
    isResolved: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: "comp-demo-3",
    starRating: 3,
    selectedTags: ["🔊 Music Too Loud", "📶 Wi-Fi Disconnected"],
    finalReviewText:
      "Good coffee, but music was too loud to take a client call. Wi-Fi kept dropping every 10 mins.",
    customerContact: "+91 97654 32100",
    staffName: null,
    staffCode: null,
    isResolved: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
];

export async function GET(): Promise<NextResponse> {
  try {
    const cafe = await prisma.cafe.findFirst({
      where: { slug: "roast-pune" },
      select: { id: true },
    });

    if (cafe) {
      const dbComplaints = await prisma.reviewSession.findMany({
        where: {
          cafeId: cafe.id,
          routedTo: RouteDestination.INTERNAL_MANAGER,
        },
        orderBy: { createdAt: "desc" },
        include: {
          staff: {
            select: { name: true, staffCode: true },
          },
        },
      });

      if (dbComplaints.length > 0) {
        const formatted: DashboardComplaint[] = dbComplaints.map((c) => ({
          id: c.id,
          starRating: c.starRating,
          selectedTags: c.selectedTags,
          finalReviewText: c.finalReviewText,
          customerContact: c.customerContact,
          staffName: c.staff?.name || null,
          staffCode: c.staff?.staffCode || null,
          isResolved: false,
          createdAt: c.createdAt.toISOString(),
        }));

        return NextResponse.json({ complaints: formatted }, { status: 200 });
      }
    }
  } catch (err: unknown) {
    console.warn("Complaints DB query failed, returning in-memory:", err);
  }

  return NextResponse.json(
    { complaints: MEMORY_COMPLAINTS },
    { status: 200 }
  );
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as { id?: string; isResolved?: boolean };
  if (!payload.id) {
    return NextResponse.json(
      { error: "Complaint ID is required" },
      { status: 400 }
    );
  }

  const item = MEMORY_COMPLAINTS.find((c) => c.id === payload.id);
  if (item && payload.isResolved !== undefined) {
    item.isResolved = payload.isResolved;
  }

  return NextResponse.json({ success: true, isResolved: payload.isResolved });
}

