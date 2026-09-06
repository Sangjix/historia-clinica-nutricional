"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface SearchTpcaFoodItem {
  id: string;
  code: string;
  groupName: string;
  name: string;
  energyKcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  fiberG?: number | null;
  ironMg?: number | null;
  sodiumMg?: number | null;
}

export async function getRecipes(filters?: {
  category?: string;
  tag?: string;
  query?: string;
}) {
  const where: any = {};

  if (filters?.category && filters.category !== "ALL") {
    where.category = filters.category;
  }

  if (filters?.query) {
    where.OR = [
      { name: { contains: filters.query } },
      { description: { contains: filters.query } },
      { tags: { contains: filters.query } },
    ];
  }

  if (filters?.tag && filters.tag !== "ALL") {
    where.tags = { contains: filters.tag };
  }

  return await db.recipe.findMany({
    where,
    include: {
      ingredients: {
        orderBy: { netWeightG: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecipeById(id: string) {
  return await db.recipe.findUnique({
    where: { id },
    include: {
      ingredients: true,
    },
  });
}

export async function searchTpcaFoods(query: string): Promise<SearchTpcaFoodItem[]> {
  if (!query || query.trim().length < 2) return [];

  const foods = await db.peruvianFood.findMany({
    where: {
      name: { contains: query.trim() },
    },
    select: {
      id: true,
      code: true,
      groupName: true,
      name: true,
      energyKcal: true,
      proteinG: true,
      fatG: true,
      carbsG: true,
      fiberG: true,
      ironMg: true,
      sodiumMg: true,
    },
    take: 20,
    orderBy: { name: "asc" },
  });

  return foods;
}

export async function createRecipe(data: {
  code?: string;
  name: string;
  category: string;
  description?: string;
  prepTimeMinutes?: number;
  servings?: number;
  difficulty?: string;
  tags?: string;
  instructions?: string[];
  ingredients: Array<{
    foodName: string;
    category: string;
    netWeightG: number;
    householdMeasure: string;
    energyKcal: number;
    proteinG: number;
    fatG: number;
    carbsG: number;
    fiberG?: number;
    ironMg?: number;
    sodiumMg?: number;
  }>;
}) {
  const code = data.code?.trim() || `REC-${Date.now().toString().slice(-6)}`;

  // Recalcular totales sumando los ingredientes
  const totalKcal = data.ingredients.reduce((acc, ing) => acc + (ing.energyKcal || 0), 0);
  const totalProteinG = data.ingredients.reduce((acc, ing) => acc + (ing.proteinG || 0), 0);
  const totalFatG = data.ingredients.reduce((acc, ing) => acc + (ing.fatG || 0), 0);
  const totalCarbsG = data.ingredients.reduce((acc, ing) => acc + (ing.carbsG || 0), 0);
  const totalFiberG = data.ingredients.reduce((acc, ing) => acc + (ing.fiberG || 0), 0);
  const totalIronMg = data.ingredients.reduce((acc, ing) => acc + (ing.ironMg || 0), 0);
  const totalSodiumMg = data.ingredients.reduce((acc, ing) => acc + (ing.sodiumMg || 0), 0);

  const recipe = await db.recipe.create({
    data: {
      code,
      name: data.name,
      category: data.category,
      description: data.description || null,
      prepTimeMinutes: data.prepTimeMinutes || 25,
      servings: data.servings || 1,
      difficulty: data.difficulty || "FACIL",
      tags: data.tags || null,
      instructionsJson: data.instructions ? JSON.stringify(data.instructions) : null,
      totalKcal: Math.round(totalKcal * 10) / 10,
      totalProteinG: Math.round(totalProteinG * 10) / 10,
      totalFatG: Math.round(totalFatG * 10) / 10,
      totalCarbsG: Math.round(totalCarbsG * 10) / 10,
      totalFiberG: Math.round(totalFiberG * 10) / 10,
      totalIronMg: Math.round(totalIronMg * 10) / 10,
      totalSodiumMg: Math.round(totalSodiumMg * 10) / 10,
      ingredients: {
        create: data.ingredients.map((ing) => ({
          foodName: ing.foodName,
          category: ing.category || "GENERAL",
          netWeightG: ing.netWeightG,
          householdMeasure: ing.householdMeasure || `${ing.netWeightG}g`,
          energyKcal: ing.energyKcal,
          proteinG: ing.proteinG,
          fatG: ing.fatG,
          carbsG: ing.carbsG,
          fiberG: ing.fiberG || 0,
          ironMg: ing.ironMg || 0,
          sodiumMg: ing.sodiumMg || 0,
        })),
      },
    },
    include: {
      ingredients: true,
    },
  });

  try {
    revalidatePath("/recetas");
    revalidatePath("/planificador");
  } catch (e) {
    // Ignorar si se ejecuta fuera de contexto de solicitud
  }

  return recipe;
}

export async function deleteRecipe(id: string) {
  await db.recipe.delete({ where: { id } });
  try {
    revalidatePath("/recetas");
    revalidatePath("/planificador");
  } catch (e) {
    // Ignorar
  }
}
