// Ecuaciones de Composición Corporal, Índices Antropométricos y Peso Ideal

import { Gender } from "@/types/clinical";

export interface AnthropometricInput {
  gender: Gender;
  ageYears: number;
  weightKg: number;
  heightCm: number;
  waistCm?: number;
  hipCm?: number;
  // Pliegues cutáneos en mm
  tricepsMm?: number;
  subscapularMm?: number;
  bicepsMm?: number;
  suprailiacMm?: number;
  abdominalMm?: number;
  thighMm?: number;
}

/**
 * Índice de Masa Corporal (IMC / BMI) y clasificación según la OMS
 */
export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  classification: string;
  category: "BAJO_PESO" | "NORMAL" | "SOBREPESO" | "OBESIDAD_I" | "OBESIDAD_II" | "OBESIDAD_III";
} {
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  if (bmi < 18.5) {
    return { bmi, classification: "Bajo peso (< 18.5)", category: "BAJO_PESO" };
  } else if (bmi < 25.0) {
    return { bmi, classification: "Normopeso (18.5 - 24.9)", category: "NORMAL" };
  } else if (bmi < 30.0) {
    return { bmi, classification: "Sobrepeso (25.0 - 29.9)", category: "SOBREPESO" };
  } else if (bmi < 35.0) {
    return { bmi, classification: "Obesidad Grado I (30.0 - 34.9)", category: "OBESIDAD_I" };
  } else if (bmi < 40.0) {
    return { bmi, classification: "Obesidad Grado II (35.0 - 39.9)", category: "OBESIDAD_II" };
  } else {
    return { bmi, classification: "Obesidad Grado III / Mórbida (≥ 40.0)", category: "OBESIDAD_III" };
  }
}

/**
 * Fórmulas de Peso Ideal / Teórico
 */
export function calculateIdealWeights(gender: Gender, heightCm: number): {
  devineKg: number;
  hamwiKg: number;
  lorentzKg: number;
  metropolitanRange: { minKg: number; maxKg: number };
} {
  const inchesOver5Feet = Math.max(0, (heightCm / 2.54) - 60);

  // Devine (1974)
  const devineKg = gender === "MALE"
    ? 50.0 + 2.3 * inchesOver5Feet
    : 45.5 + 2.3 * inchesOver5Feet;

  // Hamwi (1964)
  const hamwiKg = gender === "MALE"
    ? 48.0 + 2.7 * inchesOver5Feet
    : 45.5 + 2.2 * inchesOver5Feet;

  // Lorentz
  const lorentzKg = gender === "MALE"
    ? (heightCm - 100) - ((heightCm - 150) / 4)
    : (heightCm - 100) - ((heightCm - 150) / 2.5);

  // Rango saludable basado en IMC (18.5 a 24.9 kg/m²)
  const heightM = heightCm / 100;
  const minKg = parseFloat((18.5 * heightM * heightM).toFixed(1));
  const maxKg = parseFloat((24.9 * heightM * heightM).toFixed(1));

  return {
    devineKg: parseFloat(devineKg.toFixed(1)),
    hamwiKg: parseFloat(hamwiKg.toFixed(1)),
    lorentzKg: parseFloat(lorentzKg.toFixed(1)),
    metropolitanRange: { minKg, maxKg },
  };
}

/**
 * Índice Cintura-Cadera (ICC) y Riesgo Cardiovascular
 */
export function calculateWaistToHipRatio(waistCm: number, hipCm: number, gender: Gender): {
  ratio: number;
  riskLevel: "BAJO" | "MODERADO" | "ALTO";
  description: string;
} {
  const ratio = parseFloat((waistCm / hipCm).toFixed(2));
  if (gender === "MALE") {
    if (ratio < 0.90) return { ratio, riskLevel: "BAJO", description: "Bajo riesgo cardiovascular (< 0.90)" };
    if (ratio <= 0.99) return { ratio, riskLevel: "MODERADO", description: "Riesgo cardiovascular moderado (0.90 - 0.99)" };
    return { ratio, riskLevel: "ALTO", description: "Alto riesgo cardiovascular / Obesidad androide (≥ 1.00)" };
  } else {
    if (ratio < 0.80) return { ratio, riskLevel: "BAJO", description: "Bajo riesgo cardiovascular (< 0.80)" };
    if (ratio <= 0.85) return { riskLevel: "MODERADO", ratio, description: "Riesgo cardiovascular moderado (0.80 - 0.85)" };
    return { ratio, riskLevel: "ALTO", description: "Alto riesgo cardiovascular / Obesidad androide (≥ 0.86)" };
  }
}

/**
 * Índice Cintura-Estatura (ICE)
 */
export function calculateWaistToHeightRatio(waistCm: number, heightCm: number): {
  ratio: number;
  healthy: boolean;
  message: string;
} {
  const ratio = parseFloat((waistCm / heightCm).toFixed(2));
  const healthy = ratio < 0.50;
  return {
    ratio,
    healthy,
    message: healthy ? "Distribución saludable de grasa abdominal (< 0.5)" : "Riesgo cardiometabólico incrementado (≥ 0.5)",
  };
}

/**
 * Porcentaje de Grasa Corporal por Ecuación de Faulkner (4 pliegues)
 * Pliegues: Tríceps, Subescapular, Suprailíaco, Abdominal (en mm)
 */
export function calculateFaulkner(triceps: number, subscapular: number, suprailiac: number, abdominal: number): number {
  const sum4 = triceps + subscapular + suprailiac + abdominal;
  // % Grasa = (Suma 4 pliegues * 0.153) + 5.783
  const fatPercentage = (sum4 * 0.153) + 5.783;
  return parseFloat(fatPercentage.toFixed(1));
}

/**
 * Porcentaje de Grasa Corporal por Jackson-Pollock 3 Pliegues
 * Hombres: Pectoral, Abdominal, Muslo anterior
 * Mujeres: Tríceps, Suprailíaco, Muslo anterior
 */
export function calculateJacksonPollock3(
  gender: Gender,
  ageYears: number,
  fold1: number,
  fold2: number,
  fold3: number
): { density: number; fatPercentage: number } {
  const sum3 = fold1 + fold2 + fold3;
  let density = 0;

  if (gender === "MALE") {
    // Pectoral, Abdomen, Muslo
    density = 1.10938 - (0.0008267 * sum3) + (0.0000016 * sum3 * sum3) - (0.0002574 * ageYears);
  } else {
    // Tríceps, Suprailíaco, Muslo
    density = 1.0994921 - (0.0009929 * sum3) + (0.0000023 * sum3 * sum3) - (0.0001392 * ageYears);
  }

  // Ecuación de Siri: % Grasa = ((4.95 / Densidad) - 4.50) * 100
  const fatPercentage = ((4.95 / density) - 4.50) * 100;
  return {
    density: parseFloat(density.toFixed(4)),
    fatPercentage: parseFloat(Math.max(3, Math.min(60, fatPercentage)).toFixed(1)),
  };
}

/**
 * Desglose Completo de Composición Corporal a partir de % de Grasa
 */
export function calculateCompartments(weightKg: number, fatPercentage: number): {
  fatMassKg: number;
  leanMassKg: number;
  muscleMassKg: number;
  residualKg: number;
} {
  const fatMassKg = parseFloat(((weightKg * fatPercentage) / 100).toFixed(1));
  const leanMassKg = parseFloat((weightKg - fatMassKg).toFixed(1));
  // Estimación aproximada de masa muscular (alrededor del 70-75% de la masa magra)
  const muscleMassKg = parseFloat((leanMassKg * 0.72).toFixed(1));
  const residualKg = parseFloat((leanMassKg - muscleMassKg).toFixed(1));

  return {
    fatMassKg,
    leanMassKg,
    muscleMassKg,
    residualKg,
  };
}
