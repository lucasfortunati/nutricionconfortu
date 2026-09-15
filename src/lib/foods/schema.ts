import { z } from "zod";
import { FOOD_CATEGORIES } from "./categories";

export const foodStateSchema = z.enum(["RAW", "COOKED", "NA"]);
export const foodSourceSchema = z.enum(["SARA2", "ANMAT", "MANUAL"]);
export const foodStatusSchema = z.enum(["ACTIVE", "NEEDS_REVIEW"]);

export const foodInputSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres."),
  category: z.enum(FOOD_CATEGORIES),
  state: foodStateSchema,
  kcalPer100g: z.number().nonnegative(),
  proteinPer100g: z.number().nonnegative(),
  fatPer100g: z.number().nonnegative(),
  carbPer100g: z.number().nonnegative(),
  sodiumMgPer100g: z.number().nonnegative().nullable().optional(),
  householdUnitName: z.string().trim().min(1).nullable().optional(),
  householdUnitGrams: z.number().positive().nullable().optional(),
  source: foodSourceSchema,
  sourceDetail: z.string().trim().min(1).nullable().optional(),
  /** ¿Tiene sentido en desayuno/merienda? (pan, huevo, yogur, fruta, queso, nueces...) */
  suitableBreakfast: z.boolean(),
  /** ¿Tiene sentido en almuerzo/cena? (carnes, arroz, legumbres, verduras...) */
  suitableMainMeal: z.boolean(),
  /** Cuánto pesa cocido por cada gramo crudo (ej. arroz 3, fideos 2.5, papa hervida 1, carnes 0.7). Solo aplica con state="RAW". */
  cookedYieldFactor: z.number().positive().nullable().optional(),
  /** Para categoría "Verduras": "A" (uso libre) o "B" (con moderación, más carbohidrato). */
  vegetableGroup: z.enum(["A", "B"]).nullable().optional(),
});

export const foodUpdateSchema = foodInputSchema.extend({
  changeNote: z.string().trim().min(1).nullable().optional(),
});

export type FoodInput = z.infer<typeof foodInputSchema>;
export type FoodUpdateInput = z.infer<typeof foodUpdateSchema>;

export const markReviewSchema = z.object({
  status: foodStatusSchema,
});

export const restoreVersionSchema = z.object({
  versionId: z.string().min(1),
});
