import { prisma } from "@/lib/prisma";
import type { FoodStatus } from "@prisma/client";
import { computeChangedFields } from "./diff";
import type { FoodInput, FoodUpdateInput } from "./schema";

function toStoredValues(input: FoodInput) {
  return {
    name: input.name,
    category: input.category,
    state: input.state,
    kcalPer100g: input.kcalPer100g,
    proteinPer100g: input.proteinPer100g,
    fatPer100g: input.fatPer100g,
    carbPer100g: input.carbPer100g,
    sodiumMgPer100g: input.sodiumMgPer100g ?? null,
    householdUnitName: input.householdUnitName ?? null,
    householdUnitGrams: input.householdUnitGrams ?? null,
    source: input.source,
    sourceDetail: input.sourceDetail ?? null,
    suitableBreakfast: input.suitableBreakfast,
    suitableMainMeal: input.suitableMainMeal,
  };
}

export async function listFoodItems(filters?: { category?: string; status?: FoodStatus }) {
  return prisma.foodItem.findMany({
    where: {
      category: filters?.category || undefined,
      status: filters?.status || undefined,
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}

export async function getFoodItem(id: string) {
  return prisma.foodItem.findUnique({ where: { id } });
}

export async function getFoodItemHistory(id: string) {
  return prisma.foodItemVersion.findMany({
    where: { foodItemId: id },
    orderBy: { versionNumber: "desc" },
  });
}

export async function createFoodItem(input: FoodInput, changeNote?: string | null) {
  const values = toStoredValues(input);

  return prisma.$transaction(async (tx) => {
    const food = await tx.foodItem.create({ data: { ...values, currentVersion: 1 } });

    await tx.foodItemVersion.create({
      data: {
        foodItemId: food.id,
        versionNumber: 1,
        ...values,
        status: food.status,
        reason: "CREATE",
        changedFields: null,
        changeNote: changeNote ?? null,
      },
    });

    return food;
  });
}

export async function updateFoodItem(id: string, input: FoodUpdateInput) {
  const values = toStoredValues(input);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.foodItem.findUniqueOrThrow({ where: { id } });
    // El status no se toca desde el formulario de edición (se maneja aparte
    // vía setFoodStatus), así que lo pasamos sin cambios para que no aparezca
    // como "modificado" solo por no venir en el payload.
    const changedFields = computeChangedFields(existing, { ...values, status: existing.status });

    if (changedFields.length === 0) {
      return { food: existing, changed: false as const };
    }

    const versionNumber = existing.currentVersion + 1;

    const food = await tx.foodItem.update({
      where: { id },
      data: { ...values, currentVersion: versionNumber },
    });

    await tx.foodItemVersion.create({
      data: {
        foodItemId: id,
        versionNumber,
        ...values,
        status: food.status,
        reason: "EDIT",
        changedFields: JSON.stringify(changedFields),
        changeNote: input.changeNote ?? null,
      },
    });

    return { food, changed: true as const };
  });
}

export async function setFoodStatus(id: string, status: FoodStatus, changeNote?: string | null) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.foodItem.findUniqueOrThrow({ where: { id } });

    if (existing.status === status) {
      return { food: existing, changed: false as const };
    }

    const versionNumber = existing.currentVersion + 1;

    const food = await tx.foodItem.update({
      where: { id },
      data: { status, currentVersion: versionNumber },
    });

    await tx.foodItemVersion.create({
      data: {
        foodItemId: id,
        versionNumber,
        name: existing.name,
        category: existing.category,
        state: existing.state,
        kcalPer100g: existing.kcalPer100g,
        proteinPer100g: existing.proteinPer100g,
        fatPer100g: existing.fatPer100g,
        carbPer100g: existing.carbPer100g,
        sodiumMgPer100g: existing.sodiumMgPer100g,
        householdUnitName: existing.householdUnitName,
        householdUnitGrams: existing.householdUnitGrams,
        source: existing.source,
        sourceDetail: existing.sourceDetail,
        suitableBreakfast: existing.suitableBreakfast,
        suitableMainMeal: existing.suitableMainMeal,
        status,
        reason: "MARK_REVIEW",
        changedFields: JSON.stringify(["status"]),
        changeNote: changeNote ?? null,
      },
    });

    return { food, changed: true as const };
  });
}

export async function restoreFoodVersion(id: string, versionId: string, changeNote?: string | null) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.foodItem.findUniqueOrThrow({ where: { id } });
    const target = await tx.foodItemVersion.findUniqueOrThrow({ where: { id: versionId } });

    if (target.foodItemId !== id) {
      throw new Error("La versión indicada no pertenece a este alimento.");
    }

    const values = {
      name: target.name,
      category: target.category,
      state: target.state,
      kcalPer100g: target.kcalPer100g,
      proteinPer100g: target.proteinPer100g,
      fatPer100g: target.fatPer100g,
      carbPer100g: target.carbPer100g,
      sodiumMgPer100g: target.sodiumMgPer100g,
      householdUnitName: target.householdUnitName,
      householdUnitGrams: target.householdUnitGrams,
      source: target.source,
      sourceDetail: target.sourceDetail,
      suitableBreakfast: target.suitableBreakfast,
      suitableMainMeal: target.suitableMainMeal,
    };

    const changedFields = computeChangedFields(existing, { ...values, status: target.status });
    const versionNumber = existing.currentVersion + 1;

    const food = await tx.foodItem.update({
      where: { id },
      data: { ...values, status: target.status, currentVersion: versionNumber },
    });

    await tx.foodItemVersion.create({
      data: {
        foodItemId: id,
        versionNumber,
        ...values,
        status: target.status,
        reason: "RESTORE",
        changedFields: JSON.stringify(changedFields),
        changeNote: changeNote ?? `Restaurado desde la versión ${target.versionNumber}.`,
      },
    });

    return food;
  });
}
