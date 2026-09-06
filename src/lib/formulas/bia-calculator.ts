// Motor de Análisis de Bioimpedancia Eléctrica Avanzada (BIA)
// Estandarizado para evaluación de masa muscular, agua corporal, masa ósea y ángulo de fase

export interface BiaMeasurementInput {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  gender: "MALE" | "FEMALE";
  fatPercentage?: number;
  skeletalMuscleMassKg?: number;
  totalBodyWaterLiters?: number;
  intracellularWaterLiters?: number;
  extracellularWaterLiters?: number;
  boneMineralContentKg?: number;
  visceralFatLevel?: number;
  phaseAngleDegrees?: number; // Ángulo de fase a 50 kHz
}

export interface BiaAnalysisResult {
  skeletalMuscleMassKg: number;
  skeletalMuscleIndex: number; // SMI = SMM / (altura en metros)^2 (Criterio EWGSOP2 para sarcopenia)
  sarcopeniaRisk: "NORMAL" | "RIESGO_MODERADO" | "SARCOPENIA_PROBABLE";
  totalBodyWaterLiters: number;
  waterPercentage: number;
  hydrationStatus: "DESHIDRATACION" | "NORMOHIDRATADO" | "SOBREHIDRATADO_EDEMA";
  ecwTbwRatio: number; // Relación Agua Extracelular / Agua Corporal Total (Normal < 0.39)
  edemaRisk: "NORMAL" | "EDEMA_LEVE" | "EDEMA_MODERADO_SEVERO";
  boneMineralContentKg: number;
  phaseAngleDegrees: number;
  cellularHealthClassification: string; // Interpretación de integridad de membrana celular
  visceralFatClassification: string;
}

export function analyzeBia(input: BiaMeasurementInput): BiaAnalysisResult {
  const {
    weightKg,
    heightCm,
    gender,
    fatPercentage = 20,
    skeletalMuscleMassKg: inputSmm,
    totalBodyWaterLiters: inputTbw,
    intracellularWaterLiters: inputIcw,
    extracellularWaterLiters: inputEcw,
    boneMineralContentKg: inputBmc,
    visceralFatLevel = 5,
    phaseAngleDegrees = 6.2,
  } = input;

  const heightM = heightCm / 100;
  const heightM2 = heightM * heightM;

  // Si no se proveyó SMM directamente por el equipo, se estima con Janssen et al.
  const smm = inputSmm && inputSmm > 0
    ? inputSmm
    : parseFloat(((weightKg * (1 - (fatPercentage / 100))) * 0.52).toFixed(1));

  // Índice de Masa Muscular Esquelética (SMI) en kg/m2 (EWGSOP2)
  const smi = parseFloat((smm / heightM2).toFixed(2));
  let sarcopeniaRisk: "NORMAL" | "RIESGO_MODERADO" | "SARCOPENIA_PROBABLE" = "NORMAL";

  if (gender === "MALE") {
    if (smi < 7.0) sarcopeniaRisk = "SARCOPENIA_PROBABLE";
    else if (smi < 8.5) sarcopeniaRisk = "RIESGO_MODERADO";
  } else {
    if (smi < 5.5) sarcopeniaRisk = "SARCOPENIA_PROBABLE";
    else if (smi < 6.5) sarcopeniaRisk = "RIESGO_MODERADO";
  }

  // Agua Corporal Total (TBW)
  const tbw = inputTbw && inputTbw > 0
    ? inputTbw
    : parseFloat((weightKg * (gender === "MALE" ? 0.60 : 0.50)).toFixed(1));

  const waterPercentage = parseFloat(((tbw / weightKg) * 100).toFixed(1));

  // Agua Intra y Extracelular
  const icw = inputIcw && inputIcw > 0 ? inputIcw : parseFloat((tbw * 0.62).toFixed(1));
  const ecw = inputEcw && inputEcw > 0 ? inputEcw : parseFloat((tbw * 0.38).toFixed(1));

  const ecwTbwRatio = parseFloat((ecw / tbw).toFixed(3));
  let edemaRisk: "NORMAL" | "EDEMA_LEVE" | "EDEMA_MODERADO_SEVERO" = "NORMAL";
  if (ecwTbwRatio > 0.40) {
    edemaRisk = "EDEMA_MODERADO_SEVERO";
  } else if (ecwTbwRatio >= 0.39) {
    edemaRisk = "EDEMA_LEVE";
  }

  let hydrationStatus: "DESHIDRATACION" | "NORMOHIDRATADO" | "SOBREHIDRATADO_EDEMA" = "NORMOHIDRATADO";
  if (waterPercentage < (gender === "MALE" ? 50 : 45)) {
    hydrationStatus = "DESHIDRATACION";
  } else if (waterPercentage > (gender === "MALE" ? 65 : 60) || edemaRisk !== "NORMAL") {
    hydrationStatus = "SOBREHIDRATADO_EDEMA";
  }

  // Masa Ósea / Contenido Mineral Óseo (BMC)
  const bmc = inputBmc && inputBmc > 0
    ? inputBmc
    : parseFloat((weightKg * 0.045).toFixed(2));

  // Ángulo de Fase (Phase Angle a 50 kHz)
  let cellularHealthClassification = "Excelente integridad de membrana celular y vitalidad";
  if (phaseAngleDegrees < 4.5) {
    cellularHealthClassification = "Ángulo de fase crítico (<4.5°): Daño o pérdida severa de masa celular corporal, desnutrición catabólica";
  } else if (phaseAngleDegrees < 5.5) {
    cellularHealthClassification = "Ángulo de fase bajo (4.5° - 5.5°): Fragilidad o deterioro celular moderado";
  } else if (phaseAngleDegrees <= 7.5) {
    cellularHealthClassification = "Ángulo de fase óptimo (5.5° - 7.5°): Buen estado nutricional y permeabilidad de membrana";
  } else {
    cellularHealthClassification = "Ángulo de fase muy elevado (>7.5°): Alta celularidad muscular, típico de atletas";
  }

  // Grasa Visceral
  let visceralFatClassification = "Rango saludable (Nivel 1 - 9)";
  if (visceralFatLevel >= 15) {
    visceralFatClassification = "Nivel muy alto (>=15): Riesgo cardiovascular y metabólico muy severo";
  } else if (visceralFatLevel >= 10) {
    visceralFatClassification = "Nivel excesivo (10 - 14): Riesgo aterogénico y esteatosis hepática";
  }

  return {
    skeletalMuscleMassKg: smm,
    skeletalMuscleIndex: smi,
    sarcopeniaRisk,
    totalBodyWaterLiters: tbw,
    waterPercentage,
    hydrationStatus,
    ecwTbwRatio,
    edemaRisk,
    boneMineralContentKg: bmc,
    phaseAngleDegrees,
    cellularHealthClassification,
    visceralFatClassification,
  };
}
