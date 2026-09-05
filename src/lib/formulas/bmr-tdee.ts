// Ecuaciones de Gasto Energético Basal (GEB/BMR) y Requerimiento Energético Total (GET/TDEE)

import { Gender, EnergyRequirement } from "@/types/clinical";

export interface BMRParams {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  ageYears: number;
  leanMassKg?: number; // Para fórmulas basadas en masa magra (Katch-McArdle, Cunningham)
}

/**
 * Ecuación de Mifflin-St Jeor (1990)
 * Considerada el estándar actual de precisión clínica en población general y con sobrepeso/obesidad.
 */
export function calculateMifflinStJeor(params: BMRParams): number {
  const { gender, weightKg, heightCm, ageYears } = params;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return gender === "MALE" ? Math.round(base + 5) : Math.round(base - 161);
}

/**
 * Ecuación de Harris-Benedict revisada por Roza y Shizgal (1984)
 * Clásica y ampliamente utilizada en pacientes clínicos.
 */
export function calculateHarrisBenedict(params: BMRParams): number {
  const { gender, weightKg, heightCm, ageYears } = params;
  if (gender === "MALE") {
    return Math.round(88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * ageYears);
  } else {
    return Math.round(447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * ageYears);
  }
}

/**
 * Ecuación de Katch-McArdle (1996)
 * Basada directamente en la Masa Libre de Grasa (MLG / Lean Body Mass). Ideal para deportistas.
 */
export function calculateKatchMcArdle(leanMassKg: number): number {
  return Math.round(370 + 21.6 * leanMassKg);
}

/**
 * Ecuación de FAO / OMS / UNU (2004) por grupos de edad
 */
export function calculateFaoWho(params: BMRParams): number {
  const { gender, weightKg, ageYears } = params;

  if (gender === "MALE") {
    if (ageYears < 3) return Math.round(61.0 * weightKg - 51);
    if (ageYears <= 10) return Math.round(22.7 * weightKg + 495);
    if (ageYears <= 18) return Math.round(17.5 * weightKg + 651);
    if (ageYears <= 30) return Math.round(15.3 * weightKg + 679);
    if (ageYears <= 60) return Math.round(11.6 * weightKg + 879);
    return Math.round(13.5 * weightKg + 487);
  } else {
    if (ageYears < 3) return Math.round(61.0 * weightKg - 51);
    if (ageYears <= 10) return Math.round(22.5 * weightKg + 499);
    if (ageYears <= 18) return Math.round(12.2 * weightKg + 746);
    if (ageYears <= 30) return Math.round(14.7 * weightKg + 496);
    if (ageYears <= 60) return Math.round(8.7 * weightKg + 829);
    return Math.round(10.5 * weightKg + 596);
  }
}

export type ActivityLevel = "SEDENTARIO" | "LIGERO" | "MODERADO" | "ACTIVO" | "MUY_ACTIVO";

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  SEDENTARIO: 1.2,    // Poco o ningún ejercicio, trabajo de escritorio
  LIGERO: 1.375,      // Ejercicio suave 1-3 días/semana
  MODERADO: 1.55,     // Ejercicio moderado 3-5 días/semana
  ACTIVO: 1.725,      // Ejercicio fuerte 6-7 días/semana
  MUY_ACTIVO: 1.9,    // Ejercicio muy fuerte, dos entrenamientos diarios o labor física pesada
};

export interface CalculateTDEEInput {
  params: BMRParams;
  formula: "MIFFLIN_ST_JEOR" | "HARRIS_BENEDICT" | "KATCH_MCARDLE" | "FAO_WHO";
  activityLevel: ActivityLevel;
  customActivityFactor?: number;
  includeTEF?: boolean; // Efecto Térmico de los Alimentos (10% por defecto)
  injuryFactor?: number; // Factor de estrés clínico (1.0 a 1.5)
  goal: "PERDIDA_GRASA" | "MANTENIMIENTO" | "HIPERTROFIA" | "RECOMPOSICION" | "CLINICO_ESPECIAL";
  calorieAdjustmentKcal?: number; // ej. -400 o +300
  proteinGramsPerKg?: number; // ej. 2.0 g/kg
  fatPercentage?: number; // ej. 25%
}

/**
 * Calcula el Requerimiento Energético Integral y desglose de macronutrientes
 */
export function calculateNutritionalPlan(input: CalculateTDEEInput): EnergyRequirement {
  const {
    params,
    formula,
    activityLevel,
    customActivityFactor,
    includeTEF = true,
    injuryFactor = 1.0,
    goal,
    calorieAdjustmentKcal = 0,
    proteinGramsPerKg = 1.8,
    fatPercentage = 25,
  } = input;

  // 1. Calcular GEB / BMR
  let bmrKcal = 0;
  switch (formula) {
    case "MIFFLIN_ST_JEOR":
      bmrKcal = calculateMifflinStJeor(params);
      break;
    case "HARRIS_BENEDICT":
      bmrKcal = calculateHarrisBenedict(params);
      break;
    case "KATCH_MCARDLE":
      bmrKcal = params.leanMassKg
        ? calculateKatchMcArdle(params.leanMassKg)
        : calculateMifflinStJeor(params);
      break;
    case "FAO_WHO":
      bmrKcal = calculateFaoWho(params);
      break;
    default:
      bmrKcal = calculateMifflinStJeor(params);
  }

  // 2. Factores de Actividad y Estrés
  const actFactor = customActivityFactor || ACTIVITY_FACTORS[activityLevel] || 1.2;
  const activityKcal = Math.round(bmrKcal * (actFactor - 1));
  const tefKcal = includeTEF ? Math.round(bmrKcal * 0.1) : 0;
  const totalDailyEnergyExpenditureKcal = Math.round(
    bmrKcal * actFactor * injuryFactor + tefKcal
  );

  // 3. Ajuste según Objetivo
  let autoAdjustment = calorieAdjustmentKcal;
  if (autoAdjustment === 0) {
    if (goal === "PERDIDA_GRASA") autoAdjustment = -400;
    else if (goal === "HIPERTROFIA") autoAdjustment = 300;
    else if (goal === "RECOMPOSICION") autoAdjustment = -150;
  }
  const targetCaloriesKcal = Math.max(1000, totalDailyEnergyExpenditureKcal + autoAdjustment);

  // 4. Distribución de Macronutrientes
  // Proteína por g/kg (4 kcal/g)
  const proteinGrams = Math.round(params.weightKg * proteinGramsPerKg);
  const proteinKcal = proteinGrams * 4;
  const proteinPercentage = Math.round((proteinKcal / targetCaloriesKcal) * 100);

  // Grasa por % de calorías totales (9 kcal/g)
  const fatKcal = Math.round(targetCaloriesKcal * (fatPercentage / 100));
  const fatGrams = Math.round(fatKcal / 9);
  const fatGramsPerKg = parseFloat((fatGrams / params.weightKg).toFixed(2));

  // Carbohidratos por diferencia restante (4 kcal/g)
  const carbsKcal = Math.max(0, targetCaloriesKcal - proteinKcal - fatKcal);
  const carbsGrams = Math.round(carbsKcal / 4);
  const carbsPercentage = Math.round((carbsKcal / targetCaloriesKcal) * 100);
  const carbsGramsPerKg = parseFloat((carbsGrams / params.weightKg).toFixed(2));

  return {
    formulaUsed: formula,
    bmrKcal,
    activityFactor: actFactor,
    activityKcal,
    thermicEffectFoodKcal: tefKcal,
    injuryStressFactor: injuryFactor,
    totalDailyEnergyExpenditureKcal,
    targetCaloriesKcal,
    goal,
    macros: {
      protein: {
        grams: proteinGrams,
        percentage: proteinPercentage,
        gramsPerKg: proteinGramsPerKg,
        kcal: proteinKcal,
      },
      carbs: {
        grams: carbsGrams,
        percentage: carbsPercentage,
        gramsPerKg: carbsGramsPerKg,
        kcal: carbsKcal,
      },
      fat: {
        grams: fatGrams,
        percentage: fatPercentage,
        gramsPerKg: fatGramsPerKg,
        kcal: fatKcal,
      },
    },
  };
}
