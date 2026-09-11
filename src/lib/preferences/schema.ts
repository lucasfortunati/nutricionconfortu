import { z } from "zod";

export const preferenceStatusSchema = z.enum(["FAVORITE", "EXCLUDED"]);

export const upsertPreferenceSchema = z.object({
  foodItemId: z.string().min(1),
  status: preferenceStatusSchema,
  reason: z.string().trim().min(1).nullable().optional(),
});

export type UpsertPreferenceInput = z.infer<typeof upsertPreferenceSchema>;
