// Motor de Soporte Nutricional Clínico, Calculadora de Fórmulas Enterales y
// Detección de Riesgo de Síndrome de Realimentación (Guías NICE / ASPEN)

export interface SupplementProfile {
  id: string;
  name: string;
  presentation: "LIQUIDO" | "POLVO";
  kcalPer100gOrMl: number;
  proteinGPer100: number;
  carbsGPer100: number;
  fatGPer100: number;
  osmolarityMOsmL?: number;
  sodiumMgPer100?: number;
  potassiumMgPer100?: number;
  phosphorusMgPer100?: number;
  calciumMgPer100?: number;
}

export interface EnteralPrescriptionCalculation {
  volumeMlOrG: number;
  totalKcal: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalSodiumMg: number;
  totalPotassiumMg: number;
  totalPhosphorusMg: number;
  osmolarityMOsmL: number;
  infusionRateContinuous24hMlH: number; // ml/hora para bomba de infusión en 24h
  infusionRateContinuous20hMlH: number; // ml/hora con descanso de 4h
  safetyAlerts: string[];
}

export function calculateEnteralPrescription(
  supplement: SupplementProfile,
  input: {
    mode: "BY_VOLUME" | "BY_KCAL" | "BY_PROTEIN";
    targetValue: number;
    hasRenalImpairment?: boolean;
    hasOsmoticDiarrheaRisk?: boolean;
  }
): EnteralPrescriptionCalculation {
  const { mode, targetValue, hasRenalImpairment, hasOsmoticDiarrheaRisk } = input;
  let volume = 0;

  if (mode === "BY_VOLUME") {
    volume = targetValue;
  } else if (mode === "BY_KCAL") {
    volume = (targetValue / supplement.kcalPer100gOrMl) * 100;
  } else if (mode === "BY_PROTEIN") {
    volume = (targetValue / supplement.proteinGPer100) * 100;
  }

  volume = parseFloat(volume.toFixed(0));

  const factor = volume / 100;
  const totalKcal = parseFloat((supplement.kcalPer100gOrMl * factor).toFixed(0));
  const totalProteinG = parseFloat((supplement.proteinGPer100 * factor).toFixed(1));
  const totalCarbsG = parseFloat((supplement.carbsGPer100 * factor).toFixed(1));
  const totalFatG = parseFloat((supplement.fatGPer100 * factor).toFixed(1));

  const totalSodiumMg = parseFloat(((supplement.sodiumMgPer100 || 0) * factor).toFixed(0));
  const totalPotassiumMg = parseFloat(((supplement.potassiumMgPer100 || 0) * factor).toFixed(0));
  const totalPhosphorusMg = parseFloat(((supplement.phosphorusMgPer100 || 0) * factor).toFixed(0));
  const osmolarity = supplement.osmolarityMOsmL || 300;

  const infusionRateContinuous24hMlH = parseFloat((volume / 24).toFixed(1));
  const infusionRateContinuous20hMlH = parseFloat((volume / 20).toFixed(1));

  const safetyAlerts: string[] = [];

  // Alerta de Osmolaridad
  if (osmolarity > 450) {
    safetyAlerts.push(
      `Fórmula hiperosmolar (${osmolarity} mOsm/L). Riesgo de diarrea osmótica y vaciamiento gástrico retardado. Se sugiere inicio a menor velocidad o dilución inicial.`
    );
  } else if (hasOsmoticDiarrheaRisk && osmolarity > 350) {
    safetyAlerts.push(
      `Paciente con antecedente o riesgo de diarrea. Monitorizar tolerancia con osmolaridad de ${osmolarity} mOsm/L.`
    );
  }

  // Alerta Renal (Potasio / Fósforo)
  if (hasRenalImpairment) {
    if (totalPotassiumMg > 1500) {
      safetyAlerts.push(
        `Alerta Renal: Aporte de Potasio (${totalPotassiumMg} mg/día) supera el umbral conservador para ERC. Considerar fórmula especializada renal baja en electrolitos.`
      );
    }
    if (totalPhosphorusMg > 800) {
      safetyAlerts.push(
        `Alerta Renal: Aporte de Fósforo (${totalPhosphorusMg} mg/día) elevado para paciente nefropata. Verificar quelantes de fósforo.`
      );
    }
  }

  return {
    volumeMlOrG: volume,
    totalKcal,
    totalProteinG,
    totalCarbsG,
    totalFatG,
    totalSodiumMg,
    totalPotassiumMg,
    totalPhosphorusMg,
    osmolarityMOsmL: osmolarity,
    infusionRateContinuous24hMlH,
    infusionRateContinuous20hMlH,
    safetyAlerts,
  };
}

// Algoritmo de Evaluación de Riesgo de Síndrome de Realimentación (ASPEN / NICE)
export interface RefeedingRiskInput {
  currentBmi: number;
  unintentionalWeightLossPercentage: number; // en los últimos 3-6 meses
  fastingOrLittleIntakeDays: number;
  lowBaselineElectrolytes: boolean; // P, K o Mg bajo previo al soporte
  historyOfAlcoholMisuseOrChemo: boolean;
}

export interface RefeedingRiskResult {
  riskLevel: "BAJO" | "MODERADO" | "ALTO" | "MUY_ALTO";
  criteriaTriggered: string[];
  recommendedStartingKcalKgDay: number;
  recommendedMaxStartingKcal: (patientWeightKg: number) => number;
  clinicalGuidance: string[];
}

export function evaluateRefeedingRisk(input: RefeedingRiskInput): RefeedingRiskResult {
  const {
    currentBmi,
    unintentionalWeightLossPercentage,
    fastingOrLittleIntakeDays,
    lowBaselineElectrolytes,
    historyOfAlcoholMisuseOrChemo,
  } = input;

  const criteriaTriggered: string[] = [];
  let majorCriteriaCount = 0;
  let minorCriteriaCount = 0;

  // Criterios Mayores (NICE)
  if (currentBmi < 16) {
    criteriaTriggered.push("IMC severamente disminuido (< 16 kg/m²)");
    majorCriteriaCount++;
  }
  if (unintentionalWeightLossPercentage > 15) {
    criteriaTriggered.push("Pérdida de peso involuntaria > 15% en los últimos 3 a 6 meses");
    majorCriteriaCount++;
  }
  if (fastingOrLittleIntakeDays > 10) {
    criteriaTriggered.push("Ayuno o ingesta insignificante por más de 10 días continuos");
    majorCriteriaCount++;
  }
  if (lowBaselineElectrolytes) {
    criteriaTriggered.push("Niveles basales bajos de fosfato, potasio o magnesio sérico");
    majorCriteriaCount++;
  }

  // Criterios Menores
  if (currentBmi >= 16 && currentBmi < 18.5) {
    criteriaTriggered.push("IMC disminuido (16 - 18.5 kg/m²)");
    minorCriteriaCount++;
  }
  if (unintentionalWeightLossPercentage > 10 && unintentionalWeightLossPercentage <= 15) {
    criteriaTriggered.push("Pérdida de peso involuntaria de 10-15% en 3 a 6 meses");
    minorCriteriaCount++;
  }
  if (fastingOrLittleIntakeDays > 5 && fastingOrLittleIntakeDays <= 10) {
    criteriaTriggered.push("Ayuno o ingesta mínima de 5 a 10 días");
    minorCriteriaCount++;
  }
  if (historyOfAlcoholMisuseOrChemo) {
    criteriaTriggered.push("Historial de abuso de alcohol, diuréticos crónicos o quimioterapia");
    minorCriteriaCount++;
  }

  let riskLevel: "BAJO" | "MODERADO" | "ALTO" | "MUY_ALTO" = "BAJO";
  let recommendedStartingKcalKgDay = 25; // Normal

  if (majorCriteriaCount >= 2 || (majorCriteriaCount >= 1 && currentBmi < 14)) {
    riskLevel = "MUY_ALTO";
    recommendedStartingKcalKgDay = 5; // Extremadamente conservador (5-10 kcal/kg)
  } else if (majorCriteriaCount >= 1 || minorCriteriaCount >= 2) {
    riskLevel = "ALTO";
    recommendedStartingKcalKgDay = 10; // 10 kcal/kg/día
  } else if (minorCriteriaCount === 1) {
    riskLevel = "MODERADO";
    recommendedStartingKcalKgDay = 15; // 15-20 kcal/kg/día
  }

  const clinicalGuidance: string[] = [];
  if (riskLevel === "ALTO" || riskLevel === "MUY_ALTO") {
    clinicalGuidance.push(
      "Iniciar calorías de forma conservadora a " + recommendedStartingKcalKgDay + " kcal/kg/día las primeras 48-72 horas."
    );
    clinicalGuidance.push(
      "Administrar Tiamina (Vitamina B1) 200-300 mg diarios IV o VO antes y durante los primeros 3-5 días de alimentación."
    );
    clinicalGuidance.push(
      "Dosaje obligatorio diario de electrolitos séricos (Fósforo, Potasio, Magnesio) y reponer agresivamente antes de elevar calorías."
    );
    clinicalGuidance.push(
      "Restringir sodio y fluidos para evitar sobrecarga circulatoria e insuficiencia cardiaca congestiva aguda."
    );
  } else if (riskLevel === "MODERADO") {
    clinicalGuidance.push(
      "Iniciar a " + recommendedStartingKcalKgDay + " kcal/kg/día e incrementar progresivamente a meta en 4 a 5 días con vigilancia de electrolitos."
    );
  } else {
    clinicalGuidance.push("Riesgo bajo. Se puede iniciar a requerimiento habitual monitoreando tolerancia.");
  }

  return {
    riskLevel,
    criteriaTriggered,
    recommendedStartingKcalKgDay,
    recommendedMaxStartingKcal: (weightKg: number) =>
      parseFloat((weightKg * recommendedStartingKcalKgDay).toFixed(0)),
    clinicalGuidance,
  };
}
