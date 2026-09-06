"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface MealIngredientItem {
  id: string;
  foodName: string;
  category: string;
  netWeightG: number;
  householdMeasure: string;
  energyKcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  ironMg?: number;
  peruvianFoodCode?: string;
}

const MEAL_TIMES = ["DESAYUNO", "MEDIA_MANANA", "ALMUERZO", "MEDIA_TARDE", "CENA"] as const;

export async function getWeeklyMealPlans(patientId?: string) {
  const where: any = {};
  if (patientId) where.patientId = patientId;

  return await db.weeklyMealPlan.findMany({
    where,
    include: {
      patient: {
        select: { id: true, firstName: true, lastName: true, recordNumber: true },
      },
      slots: {
        select: { id: true, totalKcal: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getWeeklyMealPlanById(id: string) {
  return await db.weeklyMealPlan.findUnique({
    where: { id },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          recordNumber: true,
          gender: true,
        },
      },
      slots: {
        include: {
          recipe: {
            select: {
              id: true,
              code: true,
              name: true,
              category: true,
              tags: true,
            },
          },
        },
        orderBy: [{ dayOfWeek: "asc" }],
      },
    },
  });
}

export async function createWeeklyMealPlan(data: {
  patientId?: string | null;
  title: string;
  targetKcal?: number;
  targetProteinG?: number;
  targetCarbsG?: number;
  targetFatG?: number;
  notes?: string;
}) {
  // 1. Crear el plan semanal
  const plan = await db.weeklyMealPlan.create({
    data: {
      patientId: data.patientId || null,
      title: data.title,
      targetKcal: data.targetKcal || 2000,
      targetProteinG: data.targetProteinG || 120,
      targetCarbsG: data.targetCarbsG || 200,
      targetFatG: data.targetFatG || 55,
      notes: data.notes || null,
    },
  });

  // 2. Inicializar los 35 slots (7 días x 5 tiempos de comida)
  const slotsToCreate: any[] = [];
  for (let day = 0; day < 7; day++) {
    for (const mealTime of MEAL_TIMES) {
      slotsToCreate.push({
        mealPlanId: plan.id,
        dayOfWeek: day,
        mealTime,
        customTitle: "",
        isExploded: false,
        ingredientsJson: null,
        totalKcal: 0,
        totalProteinG: 0,
        totalFatG: 0,
        totalCarbsG: 0,
        totalIronMg: 0,
      });
    }
  }

  await db.mealPlanSlot.createMany({
    data: slotsToCreate,
  });

  try {
    revalidatePath("/planificador");
  } catch (e) {}

  return plan;
}

export async function assignRecipeToSlot(slotId: string, recipeId: string) {
  const recipe = await db.recipe.findUnique({
    where: { id: recipeId },
    include: { ingredients: true },
  });

  if (!recipe) throw new Error("Receta no encontrada");

  const ingredientsList: MealIngredientItem[] = recipe.ingredients.map((ing) => ({
    id: ing.id,
    foodName: ing.foodName,
    category: ing.category,
    netWeightG: ing.netWeightG,
    householdMeasure: ing.householdMeasure,
    energyKcal: ing.energyKcal,
    proteinG: ing.proteinG,
    fatG: ing.fatG,
    carbsG: ing.carbsG,
    ironMg: ing.ironMg || 0,
    peruvianFoodCode: ing.peruvianFoodCode || undefined,
  }));

  const updatedSlot = await db.mealPlanSlot.update({
    where: { id: slotId },
    data: {
      recipeId: recipe.id,
      customTitle: recipe.name,
      isExploded: false,
      ingredientsJson: JSON.stringify(ingredientsList),
      totalKcal: recipe.totalKcal,
      totalProteinG: recipe.totalProteinG,
      totalFatG: recipe.totalFatG,
      totalCarbsG: recipe.totalCarbsG,
      totalIronMg: recipe.totalIronMg || 0,
    },
  });

  try {
    revalidatePath("/planificador");
  } catch (e) {}

  return updatedSlot;
}

export async function explodeSlotRecipe(slotId: string) {
  const slot = await db.mealPlanSlot.findUnique({
    where: { id: slotId },
    include: { recipe: { include: { ingredients: true } } },
  });

  if (!slot) throw new Error("Slot no encontrado");

  // Si no tiene JSON pero tiene receta, poblarlo
  let ingredientsJson = slot.ingredientsJson;
  if (!ingredientsJson && slot.recipe) {
    const list: MealIngredientItem[] = slot.recipe.ingredients.map((ing) => ({
      id: ing.id,
      foodName: ing.foodName,
      category: ing.category,
      netWeightG: ing.netWeightG,
      householdMeasure: ing.householdMeasure,
      energyKcal: ing.energyKcal,
      proteinG: ing.proteinG,
      fatG: ing.fatG,
      carbsG: ing.carbsG,
      ironMg: ing.ironMg || 0,
    }));
    ingredientsJson = JSON.stringify(list);
  }

  const updated = await db.mealPlanSlot.update({
    where: { id: slotId },
    data: {
      isExploded: true,
      ingredientsJson,
    },
  });

  try {
    revalidatePath("/planificador");
  } catch (e) {}

  return updated;
}

export async function updateSlotIngredients(
  slotId: string,
  ingredients: MealIngredientItem[],
  customTitle?: string
) {
  const totalKcal = ingredients.reduce((acc, i) => acc + (i.energyKcal || 0), 0);
  const totalProteinG = ingredients.reduce((acc, i) => acc + (i.proteinG || 0), 0);
  const totalFatG = ingredients.reduce((acc, i) => acc + (i.fatG || 0), 0);
  const totalCarbsG = ingredients.reduce((acc, i) => acc + (i.carbsG || 0), 0);
  const totalIronMg = ingredients.reduce((acc, i) => acc + (i.ironMg || 0), 0);

  const updated = await db.mealPlanSlot.update({
    where: { id: slotId },
    data: {
      customTitle: customTitle || undefined,
      isExploded: true,
      ingredientsJson: JSON.stringify(ingredients),
      totalKcal: Math.round(totalKcal * 10) / 10,
      totalProteinG: Math.round(totalProteinG * 10) / 10,
      totalFatG: Math.round(totalFatG * 10) / 10,
      totalCarbsG: Math.round(totalCarbsG * 10) / 10,
      totalIronMg: Math.round(totalIronMg * 10) / 10,
    },
  });

  try {
    revalidatePath("/planificador");
  } catch (e) {}

  return updated;
}

export async function clearSlot(slotId: string) {
  const updated = await db.mealPlanSlot.update({
    where: { id: slotId },
    data: {
      recipeId: null,
      customTitle: "",
      isExploded: false,
      ingredientsJson: null,
      totalKcal: 0,
      totalProteinG: 0,
      totalFatG: 0,
      totalCarbsG: 0,
      totalIronMg: 0,
    },
  });

  try {
    revalidatePath("/planificador");
  } catch (e) {}

  return updated;
}

export interface ConsolidatedGroceryCategory {
  categoryName: string;
  categoryKey: string;
  icon: string;
  items: Array<{
    foodName: string;
    totalNetWeightG: number;
    householdEstimate: string;
  }>;
}

export async function getConsolidatedGroceryList(
  mealPlanId: string
): Promise<ConsolidatedGroceryCategory[]> {
  const slots = await db.mealPlanSlot.findMany({
    where: {
      mealPlanId,
      ingredientsJson: { not: null },
    },
  });

  const ingredientMap: Record<
    string,
    { foodName: string; category: string; totalGrams: number }
  > = {};

  for (const slot of slots) {
    if (!slot.ingredientsJson) continue;
    try {
      const items: MealIngredientItem[] = JSON.parse(slot.ingredientsJson);
      for (const item of items) {
        const key = item.foodName.trim().toLowerCase();
        if (!ingredientMap[key]) {
          ingredientMap[key] = {
            foodName: item.foodName.trim(),
            category: item.category || "GENERAL",
            totalGrams: 0,
          };
        }
        ingredientMap[key].totalGrams += item.netWeightG || 0;
      }
    } catch (e) {}
  }

  // Agrupar en categorías
  const categoriesDef: Record<string, { name: string; icon: string }> = {
    PROTEINA: { name: "Carnes, Pescados, Huevos y Vísceras", icon: "🥩" },
    CEREAL: { name: "Cereales, Arroces y Granos Andinos", icon: "🌾" },
    LEGUMINOSA: { name: "Menestras y Legumbres", icon: "🫘" },
    TUBERCULO: { name: "Papas, Camotes y Tubérculos", icon: "🥔" },
    VERDURA: { name: "Verduras y Hortalizas Frescas", icon: "🥦" },
    FRUTA: { name: "Frutas Frescas", icon: "🍎" },
    LACTEO: { name: "Lácteos y Derivados", icon: "🥛" },
    GRASA: { name: "Aceites, Paltas y Semillas Saludables", icon: "🥑" },
    CONDIMENTO: { name: "Ajíes, Hierbas, Salsas y Condimentos", icon: "🌿" },
    AZUCAR: { name: "Endulzantes y Abarrotes Varios", icon: "🍯" },
    GENERAL: { name: "Otros Alimentos y Abarrotes", icon: "🛒" },
  };

  const grouped: Record<string, any[]> = {};
  for (const key of Object.keys(ingredientMap)) {
    const item = ingredientMap[key];
    const cat = item.category.toUpperCase();
    const targetCat = categoriesDef[cat] ? cat : "GENERAL";

    if (!grouped[targetCat]) grouped[targetCat] = [];

    // Calcular estimación casera (ej. gramos a kg)
    let estimate = `${Math.round(item.totalGrams)} g`;
    if (item.totalGrams >= 1000) {
      estimate = `${(item.totalGrams / 1000).toFixed(2)} kg (${Math.round(item.totalGrams)}g)`;
    }

    grouped[targetCat].push({
      foodName: item.foodName,
      totalNetWeightG: Math.round(item.totalGrams),
      householdEstimate: estimate,
    });
  }

  const result: ConsolidatedGroceryCategory[] = [];
  for (const catKey of Object.keys(categoriesDef)) {
    if (grouped[catKey] && grouped[catKey].length > 0) {
      result.push({
        categoryKey: catKey,
        categoryName: categoriesDef[catKey].name,
        icon: categoriesDef[catKey].icon,
        items: grouped[catKey].sort((a, b) => b.totalNetWeightG - a.totalNetWeightG),
      });
    }
  }

  return result;
}
