import { prisma } from "@/lib/prisma";
import { applyDefaultFavorites } from "@/lib/preferences/service";
import type { ProfileInput } from "./schema";

export async function listProfiles() {
  return prisma.profile.findMany({ orderBy: { createdAt: "asc" } });
}

export async function getProfile(id: string) {
  return prisma.profile.findUnique({ where: { id } });
}

export async function createProfile(input: ProfileInput) {
  const profile = await prisma.profile.create({
    data: {
      name: input.name,
      sex: input.sex,
      ageYears: input.ageYears,
      heightCm: input.heightCm,
      weightKg: input.weightKg,
    },
  });
  // Arranca con una selección de alimentos reales y variados como favoritos
  // para que se puedan generar planes sin tener que marcarlos uno por uno.
  await applyDefaultFavorites(profile.id);
  return profile;
}
