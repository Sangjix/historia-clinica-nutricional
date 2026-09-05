"use client";

import { useState } from "react";
import {
  Calculator,
  Flame,
  Activity,
  Zap,
  PieChart as PieChartIcon,
  RefreshCw,
} from "lucide-react";
import { Gender } from "@/types/clinical";
import {
  calculateNutritionalPlan,
  ActivityLevel,
} from "@/lib/formulas/bmr-tdee";
import {
  calculateBMI,
  calculateFaulkner,
  calculateCompartments,
  calculateIdealWeights,
} from "@/lib/formulas/body-composition";
import { calculateHeathCarter } from "@/lib/formulas/somatotype";

interface PatientClinicalCalculatorProps {
  patientId: string;
  patientName: string;
  gender: Gender;
  ageYears: number;
  initialWeightKg: number;
  initialHeightCm: number;
  initialFolds?: {
    triceps?: number | null;
    subscapular?: number | null;
    suprailiac?: number | null;
    abdominal?: number | null;
  } | null;
}

export default function PatientClinicalCalculator({
  patientName,
  gender,
  ageYears,
  initialWeightKg,
  initialHeightCm,
  initialFolds,
}: PatientClinicalCalculatorProps) {
  const [activeTab, setActiveTab] = useState<"metabolic" | "bodyfat" | "somatotype">("metabolic");

  // Parámetros metabólicos del paciente
  const [weight, setWeight] = useState<number>(initialWeightKg || 65);
  const [height, setHeight] = useState<number>(initialHeightCm || 165);
  const [formula, setFormula] = useState<"MIFFLIN_ST_JEOR" | "HARRIS_BENEDICT" | "KATCH_MCARDLE" | "FAO_WHO">("MIFFLIN_ST_JEOR");
  const [activity, setActivity] = useState<ActivityLevel>("MODERADO");
  const [goal, setGoal] = useState<"PERDIDA_GRASA" | "MANTENIMIENTO" | "HIPERTROFIA" | "RECOMPOSICION">("PERDIDA_GRASA");
  const [proteinGPerKg, setProteinGPerKg] = useState<number>(1.8);
  const [fatPct, setFatPct] = useState<number>(25);

  // Pliegues
  const [triceps, setTriceps] = useState<number>(initialFolds?.triceps || 16);
  const [subscapular, setSubscapular] = useState<number>(initialFolds?.subscapular || 14);
  const [suprailiac, setSuprailiac] = useState<number>(initialFolds?.suprailiac || 18);
  const [abdominal, setAbdominal] = useState<number>(initialFolds?.abdominal || 20);

  // Cálculos en vivo
  const plan = calculateNutritionalPlan({
    params: {
      gender,
      ageYears,
      weightKg: weight,
      heightCm: height,
    },
    formula,
    activityLevel: activity,
    goal,
    proteinGramsPerKg: proteinGPerKg,
    fatPercentage: fatPct,
  });

  const bmiInfo = calculateBMI(weight, height);
  const idealWeights = calculateIdealWeights(gender, height);

  const faulknerFat = calculateFaulkner(triceps, subscapular, suprailiac, abdominal);
  const compartments = calculateCompartments(weight, faulknerFat);

  const somatotype = calculateHeathCarter({
    heightCm: height,
    weightKg: weight,
    tricepsMm: triceps,
    subscapularMm: subscapular,
    suprailiacMm: suprailiac,
  });

  const handleResetToLatest = () => {
    setWeight(initialWeightKg);
    setHeight(initialHeightCm);
    if (initialFolds?.triceps) setTriceps(initialFolds.triceps);
    if (initialFolds?.subscapular) setSubscapular(initialFolds.subscapular);
    if (initialFolds?.suprailiac) setSuprailiac(initialFolds.suprailiac);
    if (initialFolds?.abdominal) setAbdominal(initialFolds.abdominal);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6">
      {/* Encabezado con datos precargados del paciente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-lg">
              Calculadora Clínica de {patientName}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Precargada automáticamente con los datos clínicos: {ageYears} años • {gender === "MALE" ? "Varón" : "Mujer"} • Último peso: {initialWeightKg} kg • Talla: {initialHeightCm} cm
          </p>
        </div>

        <button
          onClick={handleResetToLatest}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition"
          title="Restablecer a los valores de la última consulta"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Restablecer Valores
        </button>
      </div>

      {/* Pestañas de la Calculadora */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab("metabolic")}
          className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "metabolic"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <Flame className="w-4 h-4" />
          Requerimiento Energético y Macros
        </button>
        <button
          onClick={() => setActiveTab("bodyfat")}
          className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "bodyfat"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <Activity className="w-4 h-4" />
          Pliegues y Composición (% Grasa)
        </button>
        <button
          onClick={() => setActiveTab("somatotype")}
          className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "somatotype"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <Zap className="w-4 h-4" />
          Somatotipo de Heath-Carter
        </button>
      </div>

      {/* TAB 1: METABOLISMO Y MACROS */}
      {activeTab === "metabolic" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Ajuste de Parámetros
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">Peso de cálculo (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Estatura (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded font-semibold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Fórmula de GEB</label>
              <select
                value={formula}
                onChange={(e) => setFormula(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
              >
                <option value="MIFFLIN_ST_JEOR">Mifflin-St Jeor (1990 - Gold Standard)</option>
                <option value="HARRIS_BENEDICT">Harris-Benedict (Revisada 1984)</option>
                <option value="FAO_WHO">FAO / OMS / UNU</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Actividad Física</label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value as ActivityLevel)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
              >
                <option value="SEDENTARIO">Sedentario (x1.20)</option>
                <option value="LIGERO">Ligero (x1.375 - 1 a 3 días/sem)</option>
                <option value="MODERADO">Moderado (x1.55 - 3 a 5 días/sem)</option>
                <option value="ACTIVO">Activo (x1.725 - 6 a 7 días/sem)</option>
                <option value="MUY_ACTIVO">Muy Activo (x1.90 - Doble turno)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Objetivo Nutricional</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-emerald-800"
              >
                <option value="PERDIDA_GRASA">Pérdida de Grasa (Déficit -400 kcal)</option>
                <option value="MANTENIMIENTO">Mantenimiento (Normocalórico)</option>
                <option value="HIPERTROFIA">Ganancia Muscular (+300 kcal)</option>
                <option value="RECOMPOSICION">Recomposición Corporal (-150 kcal)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">Proteína (g/kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={proteinGPerKg}
                  onChange={(e) => setProteinGPerKg(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">% Grasas</label>
                <input
                  type="number"
                  step="1"
                  value={fatPct}
                  onChange={(e) => setFatPct(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded"
                />
              </div>
            </div>
          </div>

          {/* Resultados de Requerimientos y Macros */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <span className="text-xs text-slate-500 block">Basal (GEB)</span>
                <span className="text-2xl font-bold text-slate-800">{plan.bmrKcal}</span>
                <span className="text-xs text-slate-400 ml-1">kcal</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <span className="text-xs text-slate-500 block">Total (GET)</span>
                <span className="text-2xl font-bold text-blue-600">{plan.totalDailyEnergyExpenditureKcal}</span>
                <span className="text-xs text-slate-400 ml-1">kcal</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-600 text-white shadow-sm">
                <span className="text-xs text-emerald-100 block">Objetivo Diario</span>
                <span className="text-2xl font-bold">{plan.targetCaloriesKcal}</span>
                <span className="text-xs text-emerald-200 ml-1">kcal/día</span>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
              <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase">
                <PieChartIcon className="w-4 h-4 text-emerald-600" />
                Desglose Nutricional Calculado para {patientName}
              </h5>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                  <span className="text-xs font-bold text-red-800">Proteína</span>
                  <div className="text-xl font-bold text-red-900 mt-0.5">{plan.macros.protein.grams}g</div>
                  <div className="text-xs text-red-700 mt-0.5">
                    {plan.macros.protein.gramsPerKg} g/kg ({plan.macros.protein.percentage}%)
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <span className="text-xs font-bold text-amber-800">Grasas</span>
                  <div className="text-xl font-bold text-amber-900 mt-0.5">{plan.macros.fat.grams}g</div>
                  <div className="text-xs text-amber-700 mt-0.5">
                    {plan.macros.fat.percentage}% ({plan.macros.fat.kcal} kcal)
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <span className="text-xs font-bold text-emerald-800">Carbohidratos</span>
                  <div className="text-xl font-bold text-emerald-900 mt-0.5">{plan.macros.carbs.grams}g</div>
                  <div className="text-xs text-emerald-700 mt-0.5">
                    {plan.macros.carbs.gramsPerKg} g/kg ({plan.macros.carbs.percentage}%)
                  </div>
                </div>
              </div>

              <div className="h-2.5 rounded-full overflow-hidden flex">
                <div style={{ width: `${plan.macros.protein.percentage}%` }} className="bg-red-500"></div>
                <div style={{ width: `${plan.macros.fat.percentage}%` }} className="bg-amber-400"></div>
                <div style={{ width: `${plan.macros.carbs.percentage}%` }} className="bg-emerald-500"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLIEGUES Y COMPOSICIÓN */}
      {activeTab === "bodyfat" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Pliegues Cutáneos (mm)
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">Tríceps</label>
                <input
                  type="number"
                  step="0.5"
                  value={triceps}
                  onChange={(e) => setTriceps(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Subescapular</label>
                <input
                  type="number"
                  step="0.5"
                  value={subscapular}
                  onChange={(e) => setSubscapular(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Suprailíaco</label>
                <input
                  type="number"
                  step="0.5"
                  value={suprailiac}
                  onChange={(e) => setSuprailiac(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Abdominal</label>
                <input
                  type="number"
                  step="0.5"
                  value={abdominal}
                  onChange={(e) => setAbdominal(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Suma de 4 pliegues: <strong>{triceps + subscapular + suprailiac + abdominal} mm</strong>.
            </p>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-center">
                <span className="text-xs font-bold text-amber-800 block uppercase">% Grasa (Faulkner)</span>
                <span className="text-3xl font-bold text-amber-900 mt-1">{faulknerFat}%</span>
                <p className="text-xs text-amber-700 mt-1">{compartments.fatMassKg} kg grasa</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
                <span className="text-xs font-bold text-blue-800 block uppercase">Masa Magra (MLG)</span>
                <span className="text-3xl font-bold text-blue-900 mt-1">{compartments.leanMassKg} kg</span>
                <p className="text-xs text-blue-700 mt-1">{compartments.muscleMassKg} kg masa muscular</p>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Rango Teórico Saludable (IMC 18.5 - 24.9):</span>
                <strong>{idealWeights.metropolitanRange.minKg} - {idealWeights.metropolitanRange.maxKg} kg</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Peso Teórico (Fórmula de Devine):</span>
                <strong>{idealWeights.devineKg} kg</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SOMATOTIPO */}
      {activeTab === "somatotype" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
            <span className="text-xs font-bold text-red-800 uppercase block">Endomorfia (Adiposidad)</span>
            <span className="text-3xl font-bold text-red-900 mt-1">{somatotype.endomorphy}</span>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <span className="text-xs font-bold text-blue-800 uppercase block">Mesomorfia (Muscularidad)</span>
            <span className="text-3xl font-bold text-blue-900 mt-1">{somatotype.mesomorphy}</span>
          </div>
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
            <span className="text-xs font-bold text-emerald-800 uppercase block">Ectomorfia (Linealidad)</span>
            <span className="text-3xl font-bold text-emerald-900 mt-1">{somatotype.ectomorphy}</span>
          </div>
          <div className="lg:col-span-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-xs text-slate-500 font-semibold uppercase">Clasificación Somatotípica</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{somatotype.classification}</div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              Coordenadas Somatocarta: X = {somatotype.xCoord} | Y = {somatotype.yCoord}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
