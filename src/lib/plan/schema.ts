import { z } from "zod";
import { AGE_RANGE, HEIGHT_CM_RANGE, WEIGHT_KG_RANGE } from "@/lib/validation/ranges";
import { isValidMealSplit } from "./mealSplit";

export const mealSplitEntrySchema = z.object({
  name: z.string().trim().min(1),
  pct: z.number().min(0).max(100),
});

export const createPlanSchema = z.object({
  label: z.string().trim().min(1).nullable().optional(),
  sex: z.enum(["MALE", "FEMALE"]),
  ageYears: z.number().int().min(AGE_RANGE.min).max(AGE_RANGE.max),
  heightCm: z.number().min(HEIGHT_CM_RANGE.min).max(HEIGHT_CM_RANGE.max),
  weightKg: z.number().min(WEIGHT_KG_RANGE.min).max(WEIGHT_KG_RANGE.max),
  formula: z.enum(["HARRIS_BENEDICT_REVISED", "MIFFLIN_ST_JEOR"]),
  activityLevel: z.enum(["SEDENTARY", "LIGHT", "MODERATE", "INTENSE", "VERY_INTENSE"]),
  goalType: z.enum(["LOSS", "MAINTENANCE", "GAIN"]),
  goalAdjustmentPct: z.number(),
  proteinGPerKg: z.number().positive(),
  fatGPerKg: z.number().positive(),
  mealSplit: z
    .array(mealSplitEntrySchema)
    .min(1)
    .refine(isValidMealSplit, "El reparto de comidas debe sumar 100%."),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
