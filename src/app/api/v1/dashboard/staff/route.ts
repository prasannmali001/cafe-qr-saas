import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface DashboardStaff {
  id: string;
  name: string;
  staffCode: string;
  scansCount: number;
  reviewsGenerated: number;
  conversionRate: string;
  isActive: boolean;
  createdAt: string;
}

const MEMORY_STAFF: DashboardStaff[] = [
  {
    id: "staff-demo-1",
    name: "Rahul Sharma",
    staffCode: "rahul01",
    scansCount: 48,
    reviewsGenerated: 21,
    conversionRate: "43.8%",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "staff-demo-2",
    name: "Priya Patel",
    staffCode: "priya02",
    scansCount: 39,
    reviewsGenerated: 17,
    conversionRate: "43.6%",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "staff-demo-3",
    name: "Amit Deshmukh",
    staffCode: "amit03",
    scansCount: 22,
    reviewsGenerated: 8,
    conversionRate: "36.4%",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export async function GET(): Promise<NextResponse> {
  try {
    const cafe = await prisma.cafe.findFirst({
      where: { slug: "roast-pune" },
      select: { id: true },
    });

    if (cafe) {
      const dbStaff = await prisma.staffMember.findMany({
        where: { cafeId: cafe.id },
        orderBy: { reviewsGenerated: "desc" },
      });

      if (dbStaff.length > 0) {
        const formatted: DashboardStaff[] = dbStaff.map((s) => ({
          id: s.id,
          name: s.name,
          staffCode: s.staffCode,
          scansCount: s.scansCount,
          reviewsGenerated: s.reviewsGenerated,
          conversionRate:
            s.scansCount > 0
              ? `${((s.reviewsGenerated / s.scansCount) * 100).toFixed(1)}%`
              : "0.0%",
          isActive: s.isActive,
          createdAt: s.createdAt.toISOString(),
        }));

        return NextResponse.json({ staff: formatted }, { status: 200 });
      }
    }
  } catch (err: unknown) {
    console.warn("Staff DB query failed, returning in-memory:", err);
  }

  return NextResponse.json({ staff: MEMORY_STAFF }, { status: 200 });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as { name?: string; staffCode?: string };
  if (!payload.name || !payload.staffCode) {
    return NextResponse.json(
      { error: "Staff name and code are required" },
      { status: 400 }
    );
  }

  const cleanName = payload.name.trim();
  const cleanCode = payload.staffCode.trim().toLowerCase();

  try {
    const cafe = await prisma.cafe.findFirst({
      where: { slug: "roast-pune" },
      select: { id: true },
    });

    if (cafe) {
      const created = await prisma.staffMember.create({
        data: {
          cafeId: cafe.id,
          name: cleanName,
          staffCode: cleanCode,
          scansCount: 0,
          reviewsGenerated: 0,
          isActive: true,
        },
      });

      return NextResponse.json(
        { success: true, staff: created },
        { status: 201 }
      );
    }
  } catch (err: unknown) {
    console.warn("DB staff creation failed, using memory:", err);
  }

  const memItem: DashboardStaff = {
    id: `staff-${Date.now()}`,
    name: cleanName,
    staffCode: cleanCode,
    scansCount: 0,
    reviewsGenerated: 0,
    conversionRate: "0.0%",
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  MEMORY_STAFF.push(memItem);

  return NextResponse.json({ success: true, staff: memItem }, { status: 201 });
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as { id?: string; isActive?: boolean };
  if (!payload.id) {
    return NextResponse.json({ error: "Staff ID is required" }, { status: 400 });
  }

  try {
    await prisma.staffMember.update({
      where: { id: payload.id },
      data: { isActive: payload.isActive ?? true },
    });
    return NextResponse.json({ success: true });
  } catch {
    const item = MEMORY_STAFF.find((s) => s.id === payload.id);
    if (item && payload.isActive !== undefined) {
      item.isActive = payload.isActive;
    }
    return NextResponse.json({ success: true });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Staff ID is required" }, { status: 400 });
  }

  try {
    await prisma.staffMember.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch {
    const idx = MEMORY_STAFF.findIndex((s) => s.id === id);
    if (idx !== -1) {
      MEMORY_STAFF.splice(idx, 1);
    }
    return NextResponse.json({ success: true });
  }
}

