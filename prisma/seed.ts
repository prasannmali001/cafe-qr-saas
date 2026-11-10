import { PrismaClient, TagSentiment, SubscriptionStatus } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function generateTagHash(tags: string[]): string {
  const normalized = tags
    .map((t) => t.trim().toLowerCase())
    .sort()
    .join("|");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

async function main(): Promise<void> {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Demo Cafe
  const cafe = await prisma.cafe.upsert({
    where: { slug: "roast-pune" },
    update: {},
    create: {
      ownerId: "owner_demo_pune_001",
      name: "The Roast Cafe",
      slug: "roast-pune",
      googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
      logoUrl:
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=120&h=120&fit=crop",
      rewardText: "10% OFF your next artisan brew",
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      isActive: true,
    },
  });

  console.log(`✅ Upserted Cafe: ${cafe.name} (${cafe.slug})`);

  // 2. Seed 2 Staff Members
  const staffRahul = await prisma.staffMember.upsert({
    where: {
      cafeId_staffCode: {
        cafeId: cafe.id,
        staffCode: "rahul01",
      },
    },
    update: {},
    create: {
      cafeId: cafe.id,
      name: "Rahul Sharma",
      staffCode: "rahul01",
      scansCount: 48,
      reviewsGenerated: 21,
      isActive: true,
    },
  });

  const staffPriya = await prisma.staffMember.upsert({
    where: {
      cafeId_staffCode: {
        cafeId: cafe.id,
        staffCode: "priya02",
      },
    },
    update: {},
    create: {
      cafeId: cafe.id,
      name: "Priya Patel",
      staffCode: "priya02",
      scansCount: 39,
      reviewsGenerated: 17,
      isActive: true,
    },
  });

  console.log(
    `✅ Upserted Staff: ${staffRahul.name} (${staffRahul.staffCode}), ${staffPriya.name} (${staffPriya.staffCode})`
  );

  // 3. Seed 30 Positive & Negative Tags
  const tagList: Array<{
    tagText: string;
    sentiment: TagSentiment;
    cafeId?: string;
  }> = [
    // 15 Positive
    { tagText: "☕ Best Hazelnut Coffee", sentiment: TagSentiment.POSITIVE },
    { tagText: "🎵 Chill Vibe", sentiment: TagSentiment.POSITIVE },
    { tagText: "⚡ Fast Table Service", sentiment: TagSentiment.POSITIVE },
    { tagText: "🥐 Fresh Croissants", sentiment: TagSentiment.POSITIVE },
    { tagText: "🔌 Good Work Wi-Fi", sentiment: TagSentiment.POSITIVE },
    { tagText: "🌿 Cozy Outdoor Seating", sentiment: TagSentiment.POSITIVE },
    { tagText: "🍰 Blueberry Cheesecake", sentiment: TagSentiment.POSITIVE },
    { tagText: "✨ Super Friendly Staff", sentiment: TagSentiment.POSITIVE },
    { tagText: "🥪 Crispy Grilled Panini", sentiment: TagSentiment.POSITIVE },
    { tagText: "🥑 Fresh Avocado Toast", sentiment: TagSentiment.POSITIVE },
    { tagText: "🍵 Iced Matcha Latte", sentiment: TagSentiment.POSITIVE },
    { tagText: "🛋️ Comfortable Seating", sentiment: TagSentiment.POSITIVE },
    { tagText: "📸 Aesthetic Photo Spots", sentiment: TagSentiment.POSITIVE },
    { tagText: "🚗 Easy Parking Available", sentiment: TagSentiment.POSITIVE },
    { tagText: "💡 Perfect for Remote Work", sentiment: TagSentiment.POSITIVE },

    // 15 Negative (Constructive private feedback)
    { tagText: "❄️ AC Too Cold", sentiment: TagSentiment.NEGATIVE },
    { tagText: "⏳ Long Wait Time", sentiment: TagSentiment.NEGATIVE },
    { tagText: "📶 Wi-Fi Disconnected", sentiment: TagSentiment.NEGATIVE },
    { tagText: "🔊 Music Too Loud", sentiment: TagSentiment.NEGATIVE },
    { tagText: "☕ Coffee Was Luke-warm", sentiment: TagSentiment.NEGATIVE },
    { tagText: "🧂 Food Needed Seasoning", sentiment: TagSentiment.NEGATIVE },
    { tagText: "🧹 Table Was Not Clean", sentiment: TagSentiment.NEGATIVE },
    { tagText: "💸 Portions Seemed Small", sentiment: TagSentiment.NEGATIVE },
    { tagText: "🪑 Uncomfortable Chairs", sentiment: TagSentiment.NEGATIVE },
    { tagText: "🔌 No Sockets Near Table", sentiment: TagSentiment.NEGATIVE },
    { tagText: "📋 Limited Vegan Options", sentiment: TagSentiment.NEGATIVE },
    { tagText: "🧾 Billing Delay", sentiment: TagSentiment.NEGATIVE },
    { tagText: "🚗 Parking Was Crowded", sentiment: TagSentiment.NEGATIVE },
    { tagText: "🚶 Slow Waiter Response", sentiment: TagSentiment.NEGATIVE },
    { tagText: "📦 Order Was Incomplete", sentiment: TagSentiment.NEGATIVE },
  ];

  for (const tag of tagList) {
    const existing = await prisma.reviewTag.findFirst({
      where: {
        cafeId: null,
        tagText: tag.tagText,
      },
    });

    if (!existing) {
      await prisma.reviewTag.create({
        data: {
          cafeId: null, // Global default pool
          tagText: tag.tagText,
          sentiment: tag.sentiment,
          isActive: true,
        },
      });
    }
  }

  console.log(`✅ Seeded ${tagList.length} global sentiment review tags`);

  // 4. Seed 20 Cached Human-Style Reviews in AiTemplateCache
  const templateCombinations: Array<{ tags: string[]; reviews: string[] }> = [
    {
      tags: ["☕ Best Hazelnut Coffee", "🎵 Chill Vibe"],
      reviews: [
        "Hazelnut coffee here is so good! Loved the chilled-out background music, perfect place to catch up with friends.",
        "Really loved the hazelnut coffee. The vibe is super peaceful and relaxing.",
        "Top tier hazelnut cold coffee. Great music playing, definitely coming back on weekends.",
        "Best hazelnut brew in Pune hands down. Loved the calm ambience and quick service.",
        "Super chill spot. Their hazelnut coffee is genuinely one of the best around.",
      ],
    },
    {
      tags: ["⚡ Fast Table Service", "🥐 Fresh Croissants"],
      reviews: [
        "Warm, buttery croissants served within minutes. Excellent prompt service by the staff!",
        "The croissants tasted straight out of the oven. Fast service and courteous team.",
        "Quick service and fresh flaky croissants. Perfect quick breakfast spot.",
        "Super crisp croissants and very attentive staff. 10/10 service.",
        "Ordered the butter croissant and it was served piping hot in 5 mins flat. Great service!",
      ],
    },
    {
      tags: ["🔌 Good Work Wi-Fi", "💡 Perfect for Remote Work"],
      reviews: [
        "Great place to work remotely! Steady Wi-Fi, plenty of power points and zero distractions.",
        "Spent three hours working here today. Stable internet and peaceful seating. Highly recommended for work sessions.",
        "High-speed Wi-Fi and good table height for laptops. A dependable work-friendly cafe.",
        "Loved working out of here. Fast connection, quiet corners, and good coffee on tap.",
        "Solid Wi-Fi and work setup. Great atmosphere to get some laptop work done.",
      ],
    },
    {
      tags: ["🍰 Blueberry Cheesecake", "✨ Super Friendly Staff"],
      reviews: [
        "The blueberry cheesecake was incredible! Huge shoutout to the staff for being so warm and welcoming.",
        "Cheesecake was so rich and fresh. The team here treats you like family, really lovely experience.",
        "Delicious blueberry cheesecake and very cheerful staff. Made our evening special.",
        "Friendly hospitality and heavenly cheesecake. Will visit again soon!",
        "Staff was very sweet and recommended the blueberry cheesecake—turned out to be fantastic.",
      ],
    },
    {
      tags: ["🌿 Cozy Outdoor Seating", "🥪 Crispy Grilled Panini"],
      reviews: [
        "Sitting outdoors in the cool breeze with a crispy grilled panini was pure bliss.",
        "Loved the garden seating area! Paninis were loaded and toasted to perfection.",
        "Outdoor ambience is lush and green. Crispy panini made it a great light lunch.",
        "Great open-air sitting space and the panini was fresh, crunchy and well-spiced.",
        "Cozy outdoor setup with great grilled sandwiches. Very pleasant evening vibe.",
      ],
    },
    {
      tags: ["☕ Best Hazelnut Coffee", "🔌 Good Work Wi-Fi"],
      reviews: [
        "My go-to work spot now. Delicious hazelnut coffee and reliable high-speed internet.",
        "Strong Wi-Fi and killer hazelnut coffee. Managed all my Zoom calls without a hitch.",
        "Great coffee to power through work. Fast internet and plenty of charging sockets.",
        "Hazelnut brew was on point and the internet was blazing fast.",
        "Productive afternoon here. Good coffee, fast Wi-Fi, and comfortable desk chairs.",
      ],
    },
    {
      tags: ["🎵 Chill Vibe", "✨ Super Friendly Staff"],
      reviews: [
        "Such positive energy in this cafe! Great playlist and the staff is genuinely kind.",
        "Warm hospitality and a very mellow vibe. Spent a peaceful hour reading here.",
        "Staff always welcomes you with a warm smile. Music volume is just right.",
        "Relaxing ambience with polite staff. One of the friendliest cafes in the neighborhood.",
        "Super cozy vibe and super helpful staff. Felt right at home immediately.",
      ],
    },
    {
      tags: ["🥑 Fresh Avocado Toast", "🍵 Iced Matcha Latte"],
      reviews: [
        "Healthiest and tastiest breakfast in town! Fresh sourdough avocado toast and great iced matcha.",
        "Matcha latte was whisked nicely, and the avocado toast had just the right seasoning.",
        "Loved the iced matcha! Fresh ingredients on the toast, clean and well-balanced flavors.",
        "Perfect brunch combo. Creamy avocado toast paired with smooth iced matcha.",
        "Quality matcha and generous avocado portion. Clean, aesthetic food presentation.",
      ],
    },
    {
      tags: ["🛋️ Comfortable Seating", "📸 Aesthetic Photo Spots"],
      reviews: [
        "The decor is stunning! Plush sofas and tons of cute photo angles. Love the aesthetic.",
        "Super aesthetic cafe with comfortable deep sofas. Great lighting for pictures.",
        "Every corner is Instagram-worthy. Cozy seats where you can lounge for hours.",
        "Very thoughtful interior design with cozy seating. Perfect weekend hangout spot.",
        "Loved the pastel aesthetic and comfortable armchairs. Great photo spot.",
      ],
    },
    {
      tags: ["⚡ Fast Table Service", "🚗 Easy Parking Available"],
      reviews: [
        "Parking right outside was a relief, and the food was on the table within 7 minutes.",
        "Convenient parking space and swift table service. Very smooth overall experience.",
        "Zero parking hassle and quick turnaround on orders. Ideal when you're in a hurry.",
        "Easy parking spot and fast, courteous service. Makes frequent visits effortless.",
        "Smooth parking and fast service. Staff was sharp and coordinated.",
      ],
    },
    {
      tags: ["☕ Best Hazelnut Coffee", "🥐 Fresh Croissants"],
      reviews: [
        "Buttery croissant paired with hot hazelnut coffee is heavenly. Must try combination!",
        "Flaky croissants and rich hazelnut coffee. The perfect mid-morning treat.",
        "Croissants are fresh and crisp, hazelnut coffee is aromatic and smooth.",
        "Amazing bakery items and top notch hazelnut brew. A delightful breakfast.",
        "Fresh baked pastries and strong hazelnut coffee. Starting my weekend right here.",
      ],
    },
    {
      tags: ["🥪 Crispy Grilled Panini", "🍰 Blueberry Cheesecake"],
      reviews: [
        "Had a savory panini followed by the blueberry cheesecake. Both were sensational!",
        "Crunchy grilled sandwich followed by a melt-in-mouth cheesecake. Satisfying meal.",
        "Crispy paneer panini was well seasoned and the cheesecake was fresh and light.",
        "Loved the food quality. Crispy sandwich and authentic New York style cheesecake.",
        "Portions are generous and flavors spot on. Great sandwich and dessert combo.",
      ],
    },
    {
      tags: ["🌿 Cozy Outdoor Seating", "🎵 Chill Vibe"],
      reviews: [
        "Loved sitting outside with good lo-fi tunes playing. Very calm and relaxing ambiance.",
        "Green outdoor corner with a lovely breeze and pleasant music. Highly relaxing.",
        "Such a peaceful outdoor vibe. Perfect place to unwind with a book.",
        "Quiet outdoor seating under fairy lights with nice background music.",
        "Vibes are immaculate in the outdoor patio area. Great ambience overall.",
      ],
    },
    {
      tags: ["✨ Super Friendly Staff", "⚡ Fast Table Service"],
      reviews: [
        "Staff was very welcoming and brought our order in no time. Great hospitality!",
        "Attentive servers and swift order delivery. Felt very well taken care of.",
        "Impressed by how quickly they served us despite a packed cafe. Lovely staff.",
        "Friendly greetings and prompt attention throughout our visit. Great job!",
        "Quick service with warm smiles. Always a pleasure visiting this place.",
      ],
    },
    {
      tags: ["💡 Perfect for Remote Work", "☕ Best Hazelnut Coffee"],
      reviews: [
        "Got so much work done here. Hazelnut coffee kept me going for hours.",
        "Ideal remote work spot with rich coffee and quiet seating corners.",
        "Great coffee, calm work atmosphere, and respectful staff. Will be a regular here.",
        "Perfect work setup. Good desk height, zero interruptions, and delicious coffee.",
        "Worked here all afternoon. Excellent hazelnut latte and great productivity vibe.",
      ],
    },
    {
      tags: ["🍵 Iced Matcha Latte", "🥐 Fresh Croissants"],
      reviews: [
        "Refreshing iced matcha and crisp butter croissant. Delightful combination!",
        "Quality matcha without any bitter aftertaste, paired with a flaky croissant.",
        "Loved this pairing for tea time. Matcha was smooth and croissant was warm.",
        "Great artisanal bakery experience. Fresh pastries and high grade matcha.",
        "Authentic matcha taste and warm croissants. Really enjoyed my visit.",
      ],
    },
    {
      tags: ["🚗 Easy Parking Available", "🛋️ Comfortable Seating"],
      reviews: [
        "Rare to find ample parking along with such spacious, comfortable seating.",
        "Easy parking outside and comfortable couches inside. Hassle-free experience.",
        "Great place to meet up with friends. Plentiful parking and relaxing seats.",
        "Spacious layout, plush seating, and convenient parking right in front.",
        "No parking stress and very comfortable seating arrangement. Recommended!",
      ],
    },
    {
      tags: ["📸 Aesthetic Photo Spots", "🌿 Cozy Outdoor Seating"],
      reviews: [
        "The garden patio has so many pretty spots for photos. Super aesthetic!",
        "Loved the outdoor greenery and photo-worthy corners. Very stylish space.",
        "Cozy outdoor tables surrounded by plants. Great natural light for pictures.",
        "Beautiful bohemian aesthetic outside. Perfect spot for weekend photos and coffee.",
        "Stunning outdoor corner with cozy patio furniture. Great aesthetic vibes.",
      ],
    },
    {
      tags: ["🥪 Crispy Grilled Panini", "☕ Best Hazelnut Coffee"],
      reviews: [
        "Grilled panini was toasted to perfection and hazelnut coffee was delicious.",
        "Hearty lunch combo! Crunchy sandwich and flavorful hazelnut iced coffee.",
        "Best panini in the area, accompanied by a rich hazelnut brew. Very satisfying.",
        "Tasty, filling panini and authentic coffee taste. Good value for money.",
        "Hot grilled panini and chilled hazelnut brew made for a great lunch break.",
      ],
    },
    {
      tags: ["🍰 Blueberry Cheesecake", "🎵 Chill Vibe"],
      reviews: [
        "Indulged in their blueberry cheesecake while enjoying the chilled music. Lovely afternoon.",
        "Cheesecake was creamy and not overly sweet. Lovely music and peaceful vibe.",
        "Great dessert experience. Fresh cheesecake and very relaxing cafe atmosphere.",
        "Loved the dessert and music. Perfect spot for a quiet evening dessert date.",
        "The blueberry cheesecake was divine. Combined with the calm vibe, it made my day.",
      ],
    },
  ];

  for (const item of templateCombinations) {
    const hash = generateTagHash(item.tags);
    await prisma.aiTemplateCache.upsert({
      where: { tagsCombinationHash: hash },
      update: {
        cachedReviews: item.reviews,
      },
      create: {
        tagsCombinationHash: hash,
        cachedReviews: item.reviews,
      },
    });
  }

  console.log(
    `✅ Seeded ${templateCombinations.length} AI template cache combinations in AiTemplateCache`
  );
  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e: unknown) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

