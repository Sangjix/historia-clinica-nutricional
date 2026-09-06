import { describe, it, expect } from "vitest";
import { evaluatePediatricWho } from "../pediatric-who";
import { analyzeBia } from "../bia-calculator";
import {
  calculateEnteralPrescription,
  evaluateRefeedingRisk,
  SupplementProfile,
} from "../supplement-calculator";

describe("Evaluación Pediátrica OMS (Z-scores)", () => {
  it("debe evaluar correctamente a un niño de 8 años con peso y talla adecuados", () => {
    const result = evaluatePediatricWho({
      ageMonths: 96, // 8 años
      gender: "MALE",
      weightKg: 26,
      heightCm: 128,
    });

    expect(result.isPediatric).toBe(true);
    expect(result.zScoreHeightForAge).toBeGreaterThan(-1);
    expect(result.zScoreHeightForAge).toBeLessThan(1);
    expect(result.bmiClassification).toContain("Eutrófico");
  });

  it("debe detectar desnutrición aguda si el IMC para la edad es < -2 DE", () => {
    const result = evaluatePediatricWho({
      ageMonths: 84, // 7 años
      gender: "FEMALE",
      weightKg: 14, // Muy bajo peso
      heightCm: 118,
    });

    expect(result.zScoreBmiForAge).toBeLessThan(-2);
    expect(result.bmiClassification).toContain("Delgadez");
  });
});

describe("Análisis de Bioimpedancia Avanzada (BIA)", () => {
  it("debe calcular el Índice de Masa Muscular Esquelética (SMI) y riesgo de sarcopenia", () => {
    const result = analyzeBia({
      weightKg: 70,
      heightCm: 175,
      ageYears: 30,
      gender: "MALE",
      skeletalMuscleMassKg: 32,
      phaseAngleDegrees: 6.8,
      visceralFatLevel: 6,
    });

    expect(result.skeletalMuscleIndex).toBeCloseTo(10.45, 1);
    expect(result.sarcopeniaRisk).toBe("NORMAL");
    expect(result.phaseAngleDegrees).toBe(6.8);
    expect(result.cellularHealthClassification).toContain("óptimo");
  });

  it("debe detectar ángulo de fase crítico en estado catabólico", () => {
    const result = analyzeBia({
      weightKg: 48,
      heightCm: 165,
      ageYears: 68,
      gender: "FEMALE",
      phaseAngleDegrees: 4.2,
      visceralFatLevel: 3,
    });

    expect(result.phaseAngleDegrees).toBe(4.2);
    expect(result.cellularHealthClassification).toContain("crítico");
  });
});

describe("Soporte Clínico Enteral y Síndrome de Realimentación", () => {
  const mockFormula: SupplementProfile = {
    id: "ensure-advance",
    name: "Ensure Advance Líquido",
    presentation: "LIQUIDO",
    kcalPer100gOrMl: 150,
    proteinGPer100: 6.25,
    carbsGPer100: 19.8,
    fatGPer100: 4.9,
    osmolarityMOsmL: 480, // Hiperosmolar
    potassiumMgPer100: 180,
    phosphorusMgPer100: 95,
  };

  it("debe calcular volumen por calorías y advertir hiperosmolaridad", () => {
    const result = calculateEnteralPrescription(mockFormula, {
      mode: "BY_KCAL",
      targetValue: 1500, // 1500 kcal
    });

    expect(result.volumeMlOrG).toBe(1000);
    expect(result.totalProteinG).toBeCloseTo(62.5, 1);
    expect(result.infusionRateContinuous24hMlH).toBeCloseTo(41.7, 1);
    expect(result.safetyAlerts.some((a) => a.includes("hiperosmolar"))).toBe(true);
  });

  it("debe clasificar en Riesgo ALTO de Realimentación a paciente con pérdida severa y ayuno", () => {
    const risk = evaluateRefeedingRisk({
      currentBmi: 15.2, // Mayor criterio 1 (<16)
      unintentionalWeightLossPercentage: 18, // Mayor criterio 2 (>15%)
      fastingOrLittleIntakeDays: 12, // Mayor criterio 3 (>10 días)
      lowBaselineElectrolytes: true, // Mayor criterio 4
      historyOfAlcoholMisuseOrChemo: false,
    });

    expect(risk.riskLevel).toBe("MUY_ALTO");
    expect(risk.recommendedStartingKcalKgDay).toBeLessThanOrEqual(10);
    expect(risk.clinicalGuidance.some((g) => g.includes("Tiamina"))).toBe(true);
  });
});
