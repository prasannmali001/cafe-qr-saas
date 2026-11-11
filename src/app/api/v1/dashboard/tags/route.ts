import { NextRequest, NextResponse } from "next/server";
import { TagSentiment } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface DashboardTag {
  id: string;
  tagText: string;
  sentiment: TagSentiment;
  isActive: boolean;
  isCustom: boolean;
}

const MEMORY_TAGS: DashboardTag[] = [
  {
    id: "tag-1",
    tagText: "☕ Best Hazelnut Coffee",
    sentiment: TagSentiment.POSITIVE,
    isActive: true,
    isCustom: false,
  },
  {
    id: "tag-2",
    tagText: "🎵 Chill Vibe",
    sentiment: TagSentiment.POSITIVE,
    isActive: true,
    isCustom: false,
  },
  {
    id: "tag-3",
    tagText: "⚡ Fast Table Service",
    sentiment: TagSentiment.POSITIVE,
    isActive: true,
    isCustom: false,
  },
  {
    id: "tag-4",
    tagText: "🥐 Fresh Croissants",
    sentiment: TagSentiment.POSITIVE,
    isActive: true,
    isCustom: false,
  },
  {
    id: "tag-5",
    tagText: "🔌 Good Work Wi-Fi",
    sentiment: TagSentiment.POSITIVE,
    isActive: true,
    isCustom: false,
  },
  {
    id: "tag-6",
    tagText: "🍰 Blueberry Cheesecake",
    sentiment: TagSentiment.POSITIVE,
    isActive: true,
    isCustom: false,
  },
  {
    id: "tag-7",
    tagText: "🥪 Crispy Grilled Panini",
    sentiment: TagSentiment.POSITIVE,
    isActive: true,
    isCustom: false,
  },
  {
    id: "tag-8",
    tagText: "❄️ AC Too Cold",
    sentiment: TagSentiment.NEGATIVE,
    isActive: true,
    isCustom: false,
  },
  {
    id: "tag-9",
    tagText: "⏳ Long Wait Time",
    sentiment: TagSentiment.NEGATIVE,
    isActive: true,
    isCustom: false,
  },
  {
    id: "tag-10",
    tagText: "📶 Wi-Fi Disconnected",
    sentiment: TagSentiment.NEGATIVE,
    isActive: true,
    isCustom: false,
  },
  {
    id: "tag-11",
    tagText: "🔊 Music Too Loud",
    sentiment: TagSentiment.NEGATIVE,
    isActive: true,
    isCustom: false,
  },
];

export async function GET(): Promise<NextResponse> {
  try {
    const dbTags = await prisma.reviewTag.findMany({
      orderBy: [{ sentiment: "asc" }, { tagText: "asc" }],
      take: 60,
    });

    if (dbTags.length > 0) {
      const formatted: DashboardTag[] = dbTags.map((t) => ({
        id: t.id,
        tagText: t.tagText,
        sentiment: t.sentiment,
        isActive: t.isActive,
        isCustom: t.cafeId !== null,
      }));
      return NextResponse.json({ tags: formatted }, { status: 200 });
    }
  } catch (error: unknown) {
    console.warn("ReviewTag DB query failed, returning in-memory:", error);
  }

  return NextResponse.json({ tags: MEMORY_TAGS }, { status: 200 });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as {
    tagText?: string;
    sentiment?: "POSITIVE" | "NEGATIVE";
  };

  if (!payload.tagText || !payload.tagText.trim()) {
    return NextResponse.json(
      { error: "Tag text is required" },
      { status: 400 }
    );
  }

  const cleanText = payload.tagText.trim();
  const sentiment =
    payload.sentiment === "NEGATIVE"
      ? TagSentiment.NEGATIVE
      : TagSentiment.POSITIVE;

  try {
    const cafe = await prisma.cafe.findFirst({
      where: { slug: "roast-pune" },
      select: { id: true },
    });

    const newTag = await prisma.reviewTag.create({
      data: {
        tagText: cleanText,
        sentiment,
        cafeId: cafe?.id ?? null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, tag: newTag }, { status: 201 });
  } catch (err: unknown) {
    console.warn("DB tag creation failed, using memory fallback:", err);

    const memTag: DashboardTag = {
      id: `custom-tag-${Date.now()}`,
      tagText: cleanText,
      sentiment,
      isActive: true,
      isCustom: true,
    };
    MEMORY_TAGS.unshift(memTag);

    return NextResponse.json({ success: true, tag: memTag }, { status: 201 });
  }
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
    return NextResponse.json({ error: "Tag ID is required" }, { status: 400 });
  }

  try {
    const updated = await prisma.reviewTag.update({
      where: { id: payload.id },
      data: { isActive: payload.isActive ?? true },
    });
    return NextResponse.json({ success: true, tag: updated });
  } catch {
    const item = MEMORY_TAGS.find((t) => t.id === payload.id);
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
    return NextResponse.json({ error: "Tag ID is required" }, { status: 400 });
  }

  try {
    await prisma.reviewTag.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch {
    const idx = MEMORY_TAGS.findIndex((t) => t.id === id);
    if (idx !== -1) {
      MEMORY_TAGS.splice(idx, 1);
    }
    return NextResponse.json({ success: true });
  }
}

