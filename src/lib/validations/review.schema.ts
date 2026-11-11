import { z } from "zod";

export const RandomTagsQuerySchema = z.object({
  cafeId: z.string().min(1, "cafeId is required").max(100),
  stars: z.coerce.number().int().min(1).max(5),
});

export const EnhanceReviewSchema = z.object({
  sessionId: z.string().uuid(),
  cafeName: z.string().min(1).max(120),
  starRating: z.number().int().min(1).max(5),
  selectedTags: z.array(z.string().max(60)).min(1).max(5),
  rawUserInput: z.string().max(300).optional().default(""),
  languageHint: z.enum(["en", "hinglish", "hi", "mr"]).default("en"),
});

export const SubmitReviewSchema = z.object({
  sessionId: z.string().min(1).max(100),
  cafeId: z.string().min(1, "cafeId is required").max(100),
  staffCode: z.string().max(40).optional(),
  starRating: z.number().int().min(1).max(5),
  selectedTags: z.array(z.string().max(60)),
  finalReviewText: z.string().max(2000).optional().default(""),
  routedTo: z.enum(["GOOGLE_PUBLIC", "INTERNAL_MANAGER"]),
  customerContact: z.string().max(100).optional(),
});

export type RandomTagsQueryInput = z.infer<typeof RandomTagsQuerySchema>;
export type EnhanceReviewInput = z.infer<typeof EnhanceReviewSchema>;
export type SubmitReviewInput = z.infer<typeof SubmitReviewSchema>;

