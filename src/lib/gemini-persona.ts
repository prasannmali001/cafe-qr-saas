import { GoogleGenerativeAI } from "@google/generative-ai";

export interface HumanPersona {
  id: string;
  name: string;
  promptInstruction: string;
}

export const HUMAN_PERSONAS: readonly HumanPersona[] = [
  {
    id: "college_student",
    name: "Casual College Student",
    promptInstruction:
      "Write a casual 1-to-2 sentence review like a 22-year-old college student. Use simple everyday words, relaxed tone, zero corporate buzzwords.",
  },
  {
    id: "hinglish_regular",
    name: "Warm Hinglish Local",
    promptInstruction:
      "Write a short, warm Hinglish-flavored English review like a regular local customer praising the vibe and food with genuine warmth.",
  },
  {
    id: "busy_office_worker",
    name: "Busy Office Worker",
    promptInstruction:
      "Write a direct, punchy 1-sentence review like a busy office worker on a quick coffee break. Keep it super natural and concise.",
  },
  {
    id: "welcoming_hospitality",
    name: "Friendly Hospitality Seeker",
    promptInstruction:
      "Write a genuine 2-sentence review focusing on how welcoming the staff was and how fresh the items tasted.",
  },
  {
    id: "relaxed_commuter",
    name: "Relaxed Commuter",
    promptInstruction:
      "Write a relaxed, conversational review with slightly casual punctuation—like someone typing quickly on their phone while walking out of the cafe.",
  },
  {
    id: "practical_reviewer",
    name: "Practical Reviewer",
    promptInstruction:
      "Write a practical, clear review highlighting key highlights directly without fluff or overly poetic adjectives.",
  },
];

// Regex / Keyword Profanity & Toxicity Pre-Filter (Section 7 Trap #8)
const PROFANITY_PATTERN =
  /\b(fuck|shit|bitch|bastard|asshole|cunt|dick|chutiya|chutiye|bhosadi|bhosdike|bakwas|gandu|lauda|loda|saala|kamina|harami|madarchod|behenchod|bc|mc|scam|fraud|lootera)\b/i;

export function containsProfanityOrAbuse(text: string): boolean {
  if (!text) return false;
  return PROFANITY_PATTERN.test(text);
}

// Banned robotic AI Buzzwords (Section 7 Trap #2)
const BANNED_AI_WORDS = [
  "nestled",
  "exquisite",
  "culinary delight",
  "must-visit gem",
  "top-notch",
  "hidden gem",
  "symphony of flavors",
  "gastronomic",
  "haven",
  "epitome",
  "oasis",
  "tapestry",
];

function sanitizeBannedAiWords(text: string): string {
  let cleaned = text;
  for (const word of BANNED_AI_WORDS) {
    const reg = new RegExp(`\\b${word}\\b`, "gi");
    cleaned = cleaned.replace(reg, "great");
  }
  return cleaned;
}

/**
 * Local Fallback Generator: Creates authentic, human-style reviews matching
 * the 6 personas when Gemini API key is unset, rate-limited, or offline.
 */
function generateLocalPersonaFallback(
  persona: HumanPersona,
  cafeName: string,
  tags: string[],
  cleanInput: string,
  starRating: number
): string {
  const highlights =
    tags.length > 0 ? tags.join(" and ") : "the coffee and vibe";
  const userThought = cleanInput.trim() ? `${cleanInput.trim()}. ` : "";

  if (starRating >= 4) {
    switch (persona.id) {
      case "college_student":
        return `honestly loved ${highlights} at ${cafeName}! ${userThought}super chill place to hang out with friends.`;
      case "hinglish_regular":
        return `Gazab ${highlights}! ${userThought}The vibe is totally sorted and food was fresh. A regular spot in the making.`;
      case "busy_office_worker":
        return `Quick coffee break at ${cafeName}—${highlights} was on point and service was super fast.`;
      case "welcoming_hospitality":
        return `Staff was genuinely welcoming and courteous. ${userThought}Really enjoyed ${highlights}. Will definitely be back!`;
      case "relaxed_commuter":
        return `Dropped in for a quick bite... ${highlights} was delicious. ${userThought}A very pleasant stop.`;
      case "practical_reviewer":
      default:
        return `Great experience at ${cafeName}. Highlights: ${highlights}. ${userThought}Clean space and quick service.`;
    }
  } else {
    // 1-3 Stars constructive feedback
    switch (persona.id) {
      case "college_student":
        return `stopped by ${cafeName} today, but ${highlights} was kinda disappointing. ${userThought}hope they fix this soon.`;
      case "hinglish_regular":
        return `Had high expectations from ${cafeName} but ${highlights} needs serious work. ${userThought}Hope management takes note.`;
      case "busy_office_worker":
        return `Disappointed with ${highlights} today. ${userThought}Service turnaround needs to improve.`;
      case "welcoming_hospitality":
        return `Staff tried their best, but ${highlights} really fell short during our visit. ${userThought}Needs attention.`;
      case "relaxed_commuter":
        return `Visited ${cafeName} today... was let down by ${highlights}. ${userThought}Hoping for better next time.`;
      case "practical_reviewer":
      default:
        return `Feedback for ${cafeName}: ${highlights} requires improvement. ${userThought}Sharing so management can address it.`;
    }
  }
}

/**
 * Generates an authentic human-like review using Gemini 1.5 Flash Persona Engine
 * with strict 4000ms timeout and automatic local fallback.
 */
export async function generateHumanLikeReview(
  cafeName: string,
  tags: string[],
  rawInput = "",
  starRating = 5,
  languageHint = "en"
): Promise<string> {
  // 1. Profanity / Toxicity Pre-Filter: Discard abusive raw note completely
  let cleanInput = rawInput.trim();
  if (containsProfanityOrAbuse(cleanInput)) {
    console.warn("Profanity detected in user raw input, bypassing custom text");
    cleanInput = "";
  }

  // 2. Randomly pick 1 of 6 human personas
  const persona =
    HUMAN_PERSONAS[Math.floor(Math.random() * HUMAN_PERSONAS.length)];

  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyConfigured =
    apiKey &&
    !apiKey.includes("your-gemini-api-key") &&
    apiKey.trim().length > 10;

  // If no API key configured, use high-quality local persona generator
  if (!isKeyConfigured) {
    return generateLocalPersonaFallback(
      persona,
      cafeName,
      tags,
      cleanInput,
      starRating
    );
  }

  // 3. Construct Anti-Footprint Prompt for Gemini 1.5 Flash
  const prompt = `
You are helping a real cafe customer write an authentic Google review for "${cafeName}".
Selected highlights: ${tags.join(", ") || "Great service"}.
Customer's raw note (may be broken English, Hindi, or Marathi): "${cleanInput || "None"}".
Rating: ${starRating} out of 5 stars.
Language hint: ${languageHint}.

STRICT RULES:
1. Persona instruction: ${persona.promptInstruction}
2. BANNED WORDS: NEVER use robotic AI buzzwords like "Nestled", "Exquisite", "Culinary delight", "Must-visit gem", "Top-notch", "Hidden gem", "Symphony of flavors", or "Epitome".
3. If the customer's raw note contains profanity or insults, IGNORE the raw note completely and write only from selected highlights.
4. Output ONLY the final review text in natural English (or casual Hinglish if requested), under 35 words, with NO quotation marks.
`;

  let timeoutId: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Gemini API call timed out (>4000ms)"));
    }, 4000);
  });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise,
    ]);

    const generated = result.response.text().trim();
    // Strip surrounding quotes & sanitize banned AI words
    const stripped = generated.replace(/^["']|["']$/g, "").trim();
    const finalReview = sanitizeBannedAiWords(stripped);

    return (
      finalReview ||
      generateLocalPersonaFallback(
        persona,
        cafeName,
        tags,
        cleanInput,
        starRating
      )
    );
  } catch (apiError: unknown) {
    console.warn("Gemini API call failed or timed out, using persona fallback:", apiError);
    return generateLocalPersonaFallback(
      persona,
      cafeName,
      tags,
      cleanInput,
      starRating
    );
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
