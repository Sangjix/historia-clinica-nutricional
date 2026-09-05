import { describe, it, expect } from "vitest";
import {
  calculateMifflinStJeor,
  calculateHarrisBenedict,
  calculateKatchMcArdle,
  calculateNutritionalPlan,
} from "../bmr-tdee";
import {
  calculateBMI,
  calculateIdealWeights,
  calculateWaistToHipRatio,
  calculateWaistToHeightRatio,
  calculateFaulkner,
  calculateCompartments,
} from "../body-composition";
import { calculateHeathCarter } from "../somatotype";

describe("Ecuaciones de Gasto Energético (BMR y TDEE)", () => {
  it("debe calcular correctamente Mifflin-St Jeor para varón y mujer", () => {
    // Varón: 70kg, 175cm, 25 años
    // 10(70) + 6.25(175) - 5(25) + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 -> 1674
    const bmrMale = calculateMifflinStJeor({
      gender: "MALE",
      weightKg: 70,
      heightCm: 175,
      ageYears: 25,
    });
    expect(bmrMale).toBe(1674);

    // Mujer: 60kg, 160cm, 30 años
    // 10(60) + 6.25(160) - 5(30) - 161 = 600 + 1000 - 150 - 161 = 1289
    const bmrFemale = calculateMifflinStJeor({
      gender: "FEMALE",
      weightKg: 60,
      heightCm: 160,
      ageYears: 30,
    });
    expect(bmrFemale).toBe(1289);
  });

  it("debe calcular correctamente Katch-McArdle a partir de masa magra", () => {
    // 370 + 21.6 * 55kg = 370 + 1188 = 1558
    const bmr = calculateKatchMcArdle(55);
    expect(bmr).toBe(1558);
  });

  it("debe generar un plan nutricional equilibrado con macros calculados", () => {
    const plan = calculateNutritionalPlan({
      params: { gender: "MALE", weightKg: 80, heightCm: 180, ageYears: 28 },
      formula: "MIFFLIN_ST_JEOR",
      activityLevel: "MODERADO", // 1.55
      goal: "PERDIDA_GRASA", // -400 kcal
      proteinGramsPerKg: 2.0,
      fatPercentage: 25,
    });

    expect(plan.bmrKcal).toBeGreaterThan(1700);
    expect(plan.totalDailyEnergyExpenditureKcal).toBeGreaterThan(plan.targetCaloriesKcal);
    expect(plan.macros.protein.grams).toBe(160); // 80kg * 2g/kg = 160g
    expect(plan.macros.fat.percentage).toBe(25);
    expect(plan.macros.carbs.grams).toBeGreaterThan(100);
  });
});

describe("Composición Corporal y Antropometría", () => {
  it("debe clasificar el IMC según criterios de la OMS", () => {
    const normal = calculateBMI(70, 175);
    expect(normal.bmi).toBe(22.9);
    expect(normal.category).toBe("NORMAL");

    const obesidad = calculateBMI(95, 175);
    expect(obesidad.bmi).toBe(31.0);
    expect(obesidad.category).toBe("OBESIDAD_I");
  });

  it("debe calcular el riesgo cardiovascular según el índice cintura-cadera", () => {
    const maleLow = calculateWaistToHipRatio(80, 95, "MALE");
    expect(maleLow.riskLevel).toBe("BAJO");

    const maleHigh = calculateWaistToHipRatio(105, 100, "MALE");
    expect(maleHigh.riskLevel).toBe("ALTO");
  });

  it("debe evaluar el índice cintura-estatura", () => {
    const ok = calculateWaistToHeightRatio(75, 175);
    expect(ok.healthy).toBe(true);

    const risk = calculateWaistToHeightRatio(95, 175);
    expect(risk.healthy).toBe(false);
  });

  it("debe calcular el porcentaje de grasa por Faulkner y desglosar compartimentos", () => {
    // Pliegues: tríceps 12, subescapular 14, suprailíaco 16, abdominal 18 mm -> suma = 60 mm
    // (60 * 0.153) + 5.783 = 9.18 + 5.783 = 14.963 -> 15.0%
    const fatPct = calculateFaulkner(12, 14, 16, 18);
    expect(fatPct).toBe(15.0);

    const comp = calculateCompartments(70, fatPct);
    expect(comp.fatMassKg).toBe(10.5);
    expect(comp.leanMassKg).toBe(59.5);
    expect(comp.muscleMassKg).toBeGreaterThan(40);
  });
});

describe("Somatotipo Heath-Carter", () => {
  it("debe calcular endomorfia, mesomorfia, ectomorfia y coordenadas X, Y", () => {
    const somatotype = calculateHeathCarter({
      heightCm: 178,
      weightKg: 75,
      tricepsMm: 10,
      subscapularMm: 12,
      suprailiacMm: 14,
    });

    expect(somatotype.endomorphy).toBeGreaterThan(1);
    expect(somatotype.mesomorphy).toBeGreaterThan(1);
    expect(somatotype.ectomorphy).toBeGreaterThan(1);
    expect(typeof somatotype.xCoord).toBe("number");
    expect(typeof somatotype.yCoord).toBe("number");
    expect(somatotype.classification.length).toBeGreaterThan(0);
  });
});
