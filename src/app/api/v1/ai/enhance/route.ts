import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { EnhanceReviewSchema } from "@/lib/validations/review.schema";
import {
  checkEnhanceRateLimit,
  recordEnhancementUsage,
} from "@/lib/rate-limit";
import { generateHumanLikeReview } from "@/lib/gemini-persona";

// In-memory template dictionary fallback for instant $0 tag cache responses
const IN_MEMORY_CACHE: Record<string, string[]> = {
  "☕ best hazelnut coffee|🎵 chill vibe": [
    "Hazelnut coffee here is so good! Loved the chilled-out background music, perfect place to catch up with friends.",
    "Really loved the hazelnut coffee. The vibe is super peaceful and relaxing.",
    "Top tier hazelnut cold coffee. Great music playing, definitely coming back on weekends.",
    "Best hazelnut brew in Pune hands down. Loved the calm ambience and quick service.",
    "Super chill spot. Their hazelnut coffee is genuinely one of the best around.",
  ],
  "🥐 fresh croissants|⚡ fast table service": [
    "Warm, buttery croissants served within minutes. Excellent prompt service by the staff!",
    "The croissants tasted straight out of the oven. Fast service and courteous team.",
    "Quick service and fresh flaky croissants. Perfect quick breakfast spot.",
    "Super crisp croissants and very attentive staff. 10/10 service.",
    "Ordered the butter croissant and it was served piping hot in 5 mins flat. Great service!",
  ],
  "💡 perfect for remote work|🔌 good work wi-fi": [
    "Great place to work remotely! Steady Wi-Fi, plenty of power points and zero distractions.",
    "Spent three hours working here today. Stable internet and peaceful seating. Highly recommended for work sessions.",
    "High-speed Wi-Fi and good table height for laptops. A dependable work-friendly cafe.",
    "Loved working out of here. Fast connection, quiet corners, and good coffee on tap.",
    "Solid Wi-Fi and work setup. Great atmosphere to get some laptop work done.",
  ],
  "🍰 blueberry cheesecake|✨ super friendly staff": [
    "The blueberry cheesecake was incredible! Huge shoutout to the staff for being so warm and welcoming.",
    "Cheesecake was so rich and fresh. The team here treats you like family, really lovely experience.",
    "Delicious blueberry cheesecake and very cheerful staff. Made our evening special.",
    "Friendly hospitality and heavenly cheesecake. Will visit again soon!",
    "Staff was very sweet and recommended the blueberry cheesecake—turned out to be fantastic.",
  ],
  "🥪 crispy grilled panini|🌿 cozy outdoor seating": [
    "Sitting outdoors in the cool breeze with a crispy grilled panini was pure bliss.",
    "Loved the garden seating area! Paninis were loaded and toasted to perfection.",
    "Outdoor ambience is lush and green. Crispy panini made it a great light lunch.",
    "Great open-air sitting space and the panini was fresh, crunchy and well-spiced.",
    "Cozy outdoor setup with great grilled sandwiches. Very pleasant evening vibe.",
  ],
};

function getNormalizedHashKeys(tags: string[]): {
  joinedPlus: string;
  sha256Hex: string;
} {
  const normalized = tags
    .map((t) => t.trim().toLowerCase())
    .sort();
  const joinedPlus = normalized.join("+");
  const joinedPipe = normalized.join("|");
  const sha256Hex = crypto
    .createHash("sha256")
    .update(joinedPipe)
    .digest("hex");
  return { joinedPlus, sha256Hex };
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

  // Contract validation via Zod (Section 6.2)
  const parsed = EnhanceReviewSchema.safeParse(body);
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
    cafeName,
    starRating,
    selectedTags,
    rawUserInput,
    languageHint,
  } = parsed.data;

  // Extract client IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  const rawIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

  // --- Step 1: Rate Limit Check (Section 7 Trap #5) ---
  const limitCheck = await checkEnhanceRateLimit(sessionId, rawIp);
  if (!limitCheck.allowed) {
    return NextResponse.json(
      {
        error: limitCheck.reason || "Max 3 AI enhancements reached",
        remainingUses: 0,
      },
      { status: 429 }
    );
  }

  const isRawEmpty = !rawUserInput || rawUserInput.trim().length === 0;

  // --- Step 2: Zero-Cost Tag Cache Lookup ($0 API billing shield) ---
  if (isRawEmpty && starRating >= 4 && selectedTags.length > 0) {
    const { joinedPlus, sha256Hex } = getNormalizedHashKeys(selectedTags);
    let cachedReview: string | null = null;

    try {
      // Check PostgreSQL ai_template_cache
      const cacheEntry = await prisma.aiTemplateCache.findFirst({
        where: {
          OR: [
            { tagsCombinationHash: sha256Hex },
            { tagsCombinationHash: joinedPlus },
          ],
        },
        select: { cachedReviews: true },
      });

      if (cacheEntry && cacheEntry.cachedReviews.length > 0) {
        const pool = cacheEntry.cachedReviews;
        cachedReview = pool[Math.floor(Math.random() * pool.length)];
      }
    } catch {
      // DB offline, fall through to in-memory dictionary
    }

    // In-memory dictionary fallback
    if (!cachedReview) {
      const key = selectedTags
        .map((t) => t.trim().toLowerCase())
        .sort()
        .join("|");

      for (const [pattern, reviews] of Object.entries(IN_MEMORY_CACHE)) {
        if (key.includes(pattern) || pattern.includes(key)) {
          cachedReview = reviews[Math.floor(Math.random() * reviews.length)];
          break;
        }
      }
    }

    if (cachedReview) {
      const remainingUses = await recordEnhancementUsage(sessionId, rawIp);
      return NextResponse.json(
        {
          enhancedText: cachedReview,
          remainingUses,
          source: "cache",
        },
        { status: 200 }
      );
    }
  }

  // --- Step 3: Live Gemini Persona Generation ---
  try {
    const enhancedText = await generateHumanLikeReview(
      cafeName,
      selectedTags,
      rawUserInput,
      starRating,
      languageHint
    );

    const remainingUses = await recordEnhancementUsage(sessionId, rawIp);

    return NextResponse.json(
      {
        enhancedText,
        remainingUses,
        source: "gemini",
      },
      { status: 200 }
    );
  } catch (genError: unknown) {
    console.error("Gemini enhancement failed unexpectedly:", genError);

    // Guaranteed graceful fallback
    const fallbackSentence = `Really enjoyed visiting ${cafeName}! Highlights: ${selectedTags.join(", ")}. Great service and fresh items.`;
    const remainingUses = await recordEnhancementUsage(sessionId, rawIp);

    return NextResponse.json(
      {
        enhancedText: fallbackSentence,
        remainingUses,
        source: "cache",
      },
      { status: 200 }
    );
  }
}
