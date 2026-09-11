import { prisma } from "@/lib/prisma";
import type { ProfileInput } from "./schema";

export async function listProfiles() {
  return prisma.profile.findMany({ orderBy: { createdAt: "asc" } });
}

export async function getProfile(id: string) {
  return prisma.profile.findUnique({ where: { id } });
}

export async function createProfile(input: ProfileInput) {
  return prisma.profile.create({
    data: {
      name: input.name,
      sex: input.sex,
      ageYears: input.ageYears,
      heightCm: input.heightCm,
      weightKg: input.weightKg,
    },
  });
}
