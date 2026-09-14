import { prisma } from "@/lib/prisma";
import { DEFAULT_FAVORITE_FOOD_NAMES } from "@/lib/foods/defaultFavorites";
import type { UpsertPreferenceInput } from "./schema";

export async function listPreferences(profileId: string) {
  return prisma.profileFoodPreference.findMany({
    where: { profileId },
    include: { foodItem: true },
  });
}

export async function upsertPreference(profileId: string, input: UpsertPreferenceInput) {
  return prisma.profileFoodPreference.upsert({
    where: { profileId_foodItemId: { profileId, foodItemId: input.foodItemId } },
    create: {
      profileId,
      foodItemId: input.foodItemId,
      status: input.status,
      reason: input.reason ?? null,
    },
    update: {
      status: input.status,
      reason: input.reason ?? null,
    },
  });
}

export async function removePreference(profileId: string, foodItemId: string) {
  await prisma.profileFoodPreference.deleteMany({
    where: { profileId, foodItemId },
  });
}

/**
 * Agrega como favoritos los alimentos de la selección recomendada
 * (DEFAULT_FAVORITE_FOOD_NAMES) que el perfil todavía no tenga marcados de
 * ninguna forma. No pisa favoritos ni exclusiones ya elegidos.
 */
export async function applyDefaultFavorites(profileId: string) {
  const [existing, foods] = await Promise.all([
    prisma.profileFoodPreference.findMany({ where: { profileId }, select: { foodItemId: true } }),
    prisma.foodItem.findMany({ where: { name: { in: DEFAULT_FAVORITE_FOOD_NAMES }, status: "ACTIVE" } }),
  ]);

  const existingIds = new Set(existing.map((p) => p.foodItemId));
  const toCreate = foods.filter((f) => !existingIds.has(f.id));

  if (toCreate.length > 0) {
    await prisma.profileFoodPreference.createMany({
      data: toCreate.map((f) => ({ profileId, foodItemId: f.id, status: "FAVORITE" as const })),
    });
  }

  return { added: toCreate.length };
}
