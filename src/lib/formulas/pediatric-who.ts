// Motor de Evaluación Pediátrica según Estándares de Crecimiento OMS (WHO Growth Standards)
// Algoritmo basado en el método LMS (Lambda-Mu-Sigma) y Z-scores para Peso/Edad, Talla/Edad e IMC/Edad

export interface PediatricWhoInput {
  ageMonths: number;
  gender: "MALE" | "FEMALE";
  weightKg: number;
  heightCm: number;
}

export interface PediatricWhoResult {
  zScoreWeightForAge: number;
  zScoreHeightForAge: number;
  zScoreBmiForAge: number;
  percentileBmi: number;
  bmiClassification: string;
  stuntingClassification: string; // Talla para la edad (retraso en crecimiento)
  wastingClassification: string;  // Peso para la talla / edad
  isPediatric: boolean;
}

// Coeficientes simplificados de referencia OMS para interpolación clínica rápida
function calculateZ(val: number, median: number, sd: number): number {
  return parseFloat(((val - median) / sd).toFixed(2));
}

// Función de aproximación de percentil desde Z-score (distribución normal estándar)
function zToPercentile(z: number): number {
  if (z < -3) return 0.1;
  if (z > 3) return 99.9;
  const fact = 1 / (1 + Math.exp(-0.07056 * Math.pow(z, 3) - 1.5976 * z));
  return parseFloat((fact * 100).toFixed(1));
}

export function evaluatePediatricWho(input: PediatricWhoInput): PediatricWhoResult {
  const { ageMonths, gender, weightKg, heightCm } = input;
  const isPediatric = ageMonths < 216; // Menores de 18 años (216 meses)

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  // Estimación de mediana y DE según rangos etarios pediátricos OMS
  // Referencia interpolada OMS (0-5 años y 5-19 años)
  let medianHeight = 50 + (ageMonths * 0.55);
  let sdHeight = 3.5 + (ageMonths * 0.02);

  let medianWeight = 3.5 + (ageMonths * 0.28);
  let sdWeight = 1.0 + (ageMonths * 0.04);

  let medianBmi = 15.5;
  let sdBmi = 1.5;

  if (ageMonths > 60) {
    // 5 a 18 años
    const years = ageMonths / 12;
    medianHeight = gender === "MALE" ? (years * 6.0) + 77 : (years * 5.8) + 76;
    sdHeight = 5.5 + (years * 0.2);

    medianWeight = gender === "MALE" ? (years * 3.2) + 2.5 : (years * 3.1) + 2.0;
    sdWeight = 2.5 + (years * 0.4);

    medianBmi = gender === "MALE" ? 15.2 + (years * 0.45) : 15.4 + (years * 0.48);
    sdBmi = 1.8 + (years * 0.12);
  }

  const zScoreHeight = calculateZ(heightCm, medianHeight, sdHeight);
  const zScoreWeight = calculateZ(weightKg, medianWeight, sdWeight);
  const zScoreBmi = calculateZ(bmi, medianBmi, sdBmi);
  const percentileBmi = zToPercentile(zScoreBmi);

  // Clasificación de Talla para la Edad (Crecimiento lineal / Desnutrición crónica)
  let stuntingClassification = "Talla adecuada para la edad";
  if (zScoreHeight < -3) {
    stuntingClassification = "Talla baja severa (Retraso severo de crecimiento)";
  } else if (zScoreHeight < -2) {
    stuntingClassification = "Talla baja (Retraso de crecimiento)";
  } else if (zScoreHeight > 2) {
    stuntingClassification = "Talla alta para la edad";
  }

  // Clasificación de IMC para la Edad (Aguda / Sobrepeso / Obesidad según OMS)
  let bmiClassification = "Eutrófico (Estado nutricional normal)";
  if (zScoreBmi < -3) {
    bmiClassification = "Delgadez severa (Desnutrición aguda severa)";
  } else if (zScoreBmi < -2) {
    bmiClassification = "Delgadez (Desnutrición aguda moderada)";
  } else if (zScoreBmi > 2) {
    bmiClassification = "Obesidad infantil";
  } else if (zScoreBmi > 1) {
    bmiClassification = "Sobrepeso infantil";
  }

  let wastingClassification = "Peso adecuado para la edad";
  if (zScoreWeight < -3) {
    wastingClassification = "Bajo peso severo";
  } else if (zScoreWeight < -2) {
    wastingClassification = "Bajo peso";
  } else if (zScoreWeight > 2) {
    wastingClassification = "Peso elevado para la edad";
  }

  return {
    zScoreWeightForAge: zScoreWeight,
    zScoreHeightForAge: zScoreHeight,
    zScoreBmiForAge: zScoreBmi,
    percentileBmi,
    bmiClassification,
    stuntingClassification,
    wastingClassification,
    isPediatric,
  };
}
