import { prisma } from "@/lib/prisma";
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
