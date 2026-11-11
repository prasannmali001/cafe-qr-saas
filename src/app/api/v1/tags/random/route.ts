import { NextRequest, NextResponse } from "next/server";
import { TagSentiment } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { RandomTagsQuerySchema } from "@/lib/validations/review.schema";

export const DEFAULT_POSITIVE_TAGS: readonly string[] = [
  "☕ Best Hazelnut Coffee",
  "🎵 Chill Vibe",
  "⚡ Fast Table Service",
  "🥐 Fresh Croissants",
  "🔌 Good Work Wi-Fi",
];

export const DEFAULT_NEGATIVE_TAGS: readonly string[] = [
  "⏳ Long Wait Time",
  "❄️ AC Too Cold",
  "📶 Wi-Fi Disconnected",
  "🔊 Music Too Loud",
  "☕ Coffee Was Luke-warm",
];

function ensureFiveTags(
  fetched: string[],
  defaults: readonly string[]
): string[] {
  const result = [...fetched];
  for (const tag of defaults) {
    if (result.length >= 5) break;
    if (!result.includes(tag)) {
      result.push(tag);
    }
  }
  return result.slice(0, 5);
}

async function fetchRandomTags(
  cafeId: string,
  sentiment: TagSentiment
): Promise<string[]> {
  try {
    // 1. Primary path: PostgreSQL raw query with ORDER BY RANDOM()
    const rawResult = await prisma.$queryRaw<Array<{ tag_text: string }>>`
      SELECT tag_text
      FROM review_tags
      WHERE is_active = true
        AND sentiment = ${sentiment}::"TagSentiment"
        AND (cafe_id = ${cafeId} OR cafe_id IS NULL)
      ORDER BY RANDOM()
      LIMIT 5
    `;

    if (rawResult && rawResult.length > 0) {
      return rawResult.map((row) => row.tag_text);
    }
  } catch (rawError: unknown) {
    console.warn("Raw SQL ORDER BY RANDOM() query failed, falling back to Prisma query:", rawError);
  }

  // 2. Secondary path: Prisma findMany with in-memory shuffle
  const tags = await prisma.reviewTag.findMany({
    where: {
      isActive: true,
      sentiment: sentiment,
      OR: [{ cafeId: cafeId }, { cafeId: null }],
    },
    select: {
      tagText: true,
    },
    take: 30,
  });

  if (tags.length === 0) {
    return [];
  }

  const shuffled = [...tags].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5).map((t) => t.tagText);
}

async function fetchWithTimeout(
  cafeId: string,
  sentiment: TagSentiment,
  timeoutMs = 1500
): Promise<string[]> {
  let timeoutId: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Database query timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const tags = await Promise.race([
      fetchRandomTags(cafeId, sentiment),
      timeoutPromise,
    ]);
    return tags;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const parsed = RandomTagsQuerySchema.safeParse({
    cafeId: searchParams.get("cafeId"),
    stars: searchParams.get("stars"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid query parameters",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const { cafeId, stars } = parsed.data;
  const sentiment: TagSentiment =
    stars >= 4 ? TagSentiment.POSITIVE : TagSentiment.NEGATIVE;
  const defaultTags =
    sentiment === TagSentiment.POSITIVE
      ? DEFAULT_POSITIVE_TAGS
      : DEFAULT_NEGATIVE_TAGS;

  try {
    const rawTags = await fetchWithTimeout(cafeId, sentiment, 1500);
    const tags = ensureFiveTags(rawTags, defaultTags);

    return NextResponse.json({ tags }, { status: 200 });
  } catch (error: unknown) {
    console.warn(
      "DB query failed or timed out (>1500ms), serving hardcoded fallback tags:",
      error
    );
    return NextResponse.json({ tags: [...defaultTags] }, { status: 200 });
  }
}

