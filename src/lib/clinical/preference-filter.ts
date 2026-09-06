// Motor de Cruce Clínico y Filtrado de Preferencias y Alérgenos
// Permite evaluar minutas, recetas y alimentos antes de la prescripción

export type LikertRating = "LOVE" | "LIKE" | "NEUTRAL" | "DISLIKE" | "HATE";

export interface PatientFoodPreferenceItem {
  foodId?: string;
  foodName: string;
  group?: string;
  rating: LikertRating;
}

export interface PatientPreferencesProfile {
  allergies: string[]; // ej. ["Lácteos", "Maní", "Mariscos", "Gluten"]
  dislikedFoods: string[]; // Texto o lista
  likertPreferences?: PatientFoodPreferenceItem[];
}

export interface FoodEvaluationResult {
  foodName: string;
  status: "ALLOWED" | "EXCLUDED_BY_ALLERGY" | "EXCLUDED_BY_DISLIKE" | "HIGHLY_RECOMMENDED";
  reason?: string;
}

export function evaluateFoodAgainstPreferences(
  foodName: string,
  profile: PatientPreferencesProfile
): FoodEvaluationResult {
  const normalizedFood = foodName.toLowerCase().trim();

  // 1. Verificación de Alergias e Intolerancias Críticas
  for (const allergy of profile.allergies) {
    const normAllergy = allergy.toLowerCase().trim();
    if (normalizedFood.includes(normAllergy) || (normAllergy === "lácteos" && (normalizedFood.includes("leche") || normalizedFood.includes("queso") || normalizedFood.includes("yogur")))) {
      return {
        foodName,
        status: "EXCLUDED_BY_ALLERGY",
        reason: `Excluido por alérgeno/intolerancia registrada: ${allergy}`,
      };
    }
    if (normAllergy === "mariscos" && (normalizedFood.includes("choro") || normalizedFood.includes("camarón") || normalizedFood.includes("langostino") || normalizedFood.includes("pulpo") || normalizedFood.includes("cangrejo"))) {
      return {
        foodName,
        status: "EXCLUDED_BY_ALLERGY",
        reason: `Excluido por alergia a mariscos`,
      };
    }
    if (normAllergy === "maní" && (normalizedFood.includes("maní") || normalizedFood.includes("cacahuate"))) {
      return {
        foodName,
        status: "EXCLUDED_BY_ALLERGY",
        reason: `Excluido por alergia a frutos secos / maní`,
      };
    }
  }

  // 2. Verificación de Matriz Likert Estructurada
  if (profile.likertPreferences && profile.likertPreferences.length > 0) {
    const match = profile.likertPreferences.find(
      (p) => normalizedFood.includes(p.foodName.toLowerCase().trim()) || p.foodName.toLowerCase().trim().includes(normalizedFood)
    );
    if (match) {
      if (match.rating === "HATE") {
        return {
          foodName,
          status: "EXCLUDED_BY_DISLIKE",
          reason: `Alimento categorizado como 'Odiado / Rechazo absoluto' por el paciente`,
        };
      }
      if (match.rating === "DISLIKE") {
        return {
          foodName,
          status: "EXCLUDED_BY_DISLIKE",
          reason: `Alimento categorizado como 'No me gusta' por el paciente`,
        };
      }
      if (match.rating === "LOVE") {
        return {
          foodName,
          status: "HIGHLY_RECOMMENDED",
          reason: `Alimento favorito del paciente ('Me encanta')`,
        };
      }
    }
  }

  // 3. Verificación por texto libre de aversiones
  for (const disliked of profile.dislikedFoods) {
    if (disliked && disliked.trim().length > 2 && normalizedFood.includes(disliked.toLowerCase().trim())) {
      return {
        foodName,
        status: "EXCLUDED_BY_DISLIKE",
        reason: `Mencionado en aversiones generales del paciente`,
      };
    }
  }

  return {
    foodName,
    status: "ALLOWED",
  };
}
