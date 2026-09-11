import { z } from "zod";
import { AGE_RANGE, HEIGHT_CM_RANGE, WEIGHT_KG_RANGE } from "@/lib/validation/ranges";

export const profileInputSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres."),
  sex: z.enum(["MALE", "FEMALE"]),
  ageYears: z.number().int().min(AGE_RANGE.min).max(AGE_RANGE.max),
  heightCm: z.number().min(HEIGHT_CM_RANGE.min).max(HEIGHT_CM_RANGE.max),
  weightKg: z.number().min(WEIGHT_KG_RANGE.min).max(WEIGHT_KG_RANGE.max),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;
