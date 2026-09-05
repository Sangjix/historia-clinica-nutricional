"use client";

import { useState } from "react";
import {
  Calculator,
  Flame,
  Activity,
  User,
  Zap,
  CheckCircle2,
  PieChart as PieChartIcon,
} from "lucide-react";
import { Gender } from "@/types/clinical";
import {
  calculateNutritionalPlan,
  ActivityLevel,
  ACTIVITY_FACTORS,
} from "@/lib/formulas/bmr-tdee";
import {
  calculateBMI,
  calculateFaulkner,
  calculateCompartments,
  calculateIdealWeights,
} from "@/lib/formulas/body-composition";
import { calculateHeathCarter } from "@/lib/formulas/somatotype";

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<"metabolic" | "bodyfat" | "somatotype">("metabolic");

  // Estados para Cálculo Metabólico
  const [gender, setGender] = useState<Gender>("FEMALE");
  const [age, setAge] = useState<number>(28);
  const [weight, setWeight] = useState<number>(65);
  const [height, setHeight] = useState<number>(165);
  const [formula, setFormula] = useState<"MIFFLIN_ST_JEOR" | "HARRIS_BENEDICT" | "KATCH_MCARDLE" | "FAO_WHO">("MIFFLIN_ST_JEOR");
  const [activity, setActivity] = useState<ActivityLevel>("MODERADO");
  const [goal, setGoal] = useState<"PERDIDA_GRASA" | "MANTENIMIENTO" | "HIPERTROFIA" | "RECOMPOSICION">("PERDIDA_GRASA");
  const [proteinGPerKg, setProteinGPerKg] = useState<number>(1.8);
  const [fatPct, setFatPct] = useState<number>(25);

  // Estados para Pliegues / Composición
  const [triceps, setTriceps] = useState<number>(16);
  const [subscapular, setSubscapular] = useState<number>(14);
  const [suprailiac, setSuprailiac] = useState<number>(18);
  const [abdominal, setAbdominal] = useState<number>(20);

  // Estados para Somatotipo
  const [somatoTriceps, setSomatoTriceps] = useState<number>(12);
  const [somatoSubscapular, setSomatoSubscapular] = useState<number>(10);
  const [somatoSuprailiac, setSomatoSuprailiac] = useState<number>(14);

  // Cálculos en tiempo real
  const plan = calculateNutritionalPlan({
    params: {
      gender,
      ageYears: age,
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
    tricepsMm: somatoTriceps,
    subscapularMm: somatoSubscapular,
    suprailiacMm: somatoSuprailiac,
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Calculator className="w-6 h-6 text-emerald-600" />
          Calculadora Clínica Nutricional
        </h2>
        <p className="text-sm text-slate-500">
          Herramienta de cálculo instantáneo para requerimientos energéticos, composición corporal y somatotipo.
        </p>
      </div>

      {/* Pestañas de Navegación */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab("metabolic")}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === "metabolic"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Flame className="w-4 h-4" />
          1. Gasto Energético y Macronutrientes
        </button>
        <button
          onClick={() => setActiveTab("bodyfat")}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === "bodyfat"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Activity className="w-4 h-4" />
          2. Antropometría y % Grasa (Faulkner)
        </button>
        <button
          onClick={() => setActiveTab("somatotype")}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === "somatotype"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Zap className="w-4 h-4" />
          3. Somatotipo (Heath-Carter)
        </button>
      </div>

      {/* PESTAÑA 1: GASTO ENERGÉTICO Y MACROS */}
      {activeTab === "metabolic" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de Entradas */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Parámetros del Paciente
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Sexo</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                >
                  <option value="FEMALE">Femenino</option>
                  <option value="MALE">Masculino</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Edad (años)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Peso (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Estatura (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Ecuación Predictiva</label>
              <select
                value={formula}
                onChange={(e) => setFormula(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
              >
                <option value="MIFFLIN_ST_JEOR">Mifflin-St Jeor (1990 - Gold Standard)</option>
                <option value="HARRIS_BENEDICT">Harris-Benedict (Revisada 1984)</option>
                <option value="FAO_WHO">FAO / OMS / UNU</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Factor de Actividad</label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value as ActivityLevel)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
              >
                <option value="SEDENTARIO">Sedentario (x1.20 - Escritorio)</option>
                <option value="LIGERO">Ligero (x1.375 - 1 a 3 días/sem)</option>
                <option value="MODERADO">Moderado (x1.55 - 3 a 5 días/sem)</option>
                <option value="ACTIVO">Activo (x1.725 - 6 a 7 días/sem)</option>
                <option value="MUY_ACTIVO">Muy Activo (x1.90 - Doble sesión)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Objetivo Calórico</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none font-medium text-emerald-800"
              >
                <option value="PERDIDA_GRASA">Pérdida de Grasa (Déficit -400 kcal)</option>
                <option value="MANTENIMIENTO">Mantenimiento (Normocalórico)</option>
                <option value="HIPERTROFIA">Ganancia Muscular / Hipertrofia (+300 kcal)</option>
                <option value="RECOMPOSICION">Recomposición Corporal (-150 kcal)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Proteína (g/kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={proteinGPerKg}
                  onChange={(e) => setProteinGPerKg(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">% Grasas</label>
                <input
                  type="number"
                  step="1"
                  value={fatPct}
                  onChange={(e) => setFatPct(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                />
              </div>
            </div>
          </div>

          {/* Panel de Resultados */}
          <div className="lg:col-span-2 space-y-5">
            {/* Tarjetas de Energía */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Gasto Basal (GEB)
                </span>
                <div className="text-3xl font-bold text-slate-900 mt-1">
                  {plan.bmrKcal}
                  <span className="text-xs text-slate-400 font-normal ml-1">kcal</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Metabolismo en reposo</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Gasto Total (GET)
                </span>
                <div className="text-3xl font-bold text-blue-600 mt-1">
                  {plan.totalDailyEnergyExpenditureKcal}
                  <span className="text-xs text-slate-400 font-normal ml-1">kcal</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Actividad + ETA (10%)</p>
              </div>

              <div className="bg-emerald-600 text-white p-5 rounded-2xl shadow-md shadow-emerald-200">
                <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                  Calorías Objetivo
                </span>
                <div className="text-3xl font-bold mt-1">
                  {plan.targetCaloriesKcal}
                  <span className="text-xs text-emerald-200 font-normal ml-1">kcal/día</span>
                </div>
                <p className="text-xs text-emerald-100 mt-1">{goal.replace("_", " ")}</p>
              </div>
            </div>

            {/* Desglose de Macronutrientes */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-emerald-600" />
                Prescripción de Macronutrientes
              </h3>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-red-50/60 border border-red-100">
                  <span className="text-xs font-bold text-red-800 uppercase">Proteínas</span>
                  <div className="text-2xl font-bold text-red-900 mt-1">
                    {plan.macros.protein.grams}g
                  </div>
                  <div className="text-xs text-red-700 mt-1">
                    {plan.macros.protein.gramsPerKg} g/kg • {plan.macros.protein.percentage}% ({plan.macros.protein.kcal} kcal)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
                  <span className="text-xs font-bold text-amber-800 uppercase">Grasas</span>
                  <div className="text-2xl font-bold text-amber-900 mt-1">
                    {plan.macros.fat.grams}g
                  </div>
                  <div className="text-xs text-amber-700 mt-1">
                    {plan.macros.fat.gramsPerKg} g/kg • {plan.macros.fat.percentage}% ({plan.macros.fat.kcal} kcal)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-xs font-bold text-emerald-800 uppercase">Carbohidratos</span>
                  <div className="text-2xl font-bold text-emerald-900 mt-1">
                    {plan.macros.carbs.grams}g
                  </div>
                  <div className="text-xs text-emerald-700 mt-1">
                    {plan.macros.carbs.gramsPerKg} g/kg • {plan.macros.carbs.percentage}% ({plan.macros.carbs.kcal} kcal)
                  </div>
                </div>
              </div>

              {/* Barra de Proporción Visual */}
              <div className="h-3 rounded-full overflow-hidden flex shadow-inner">
                <div style={{ width: `${plan.macros.protein.percentage}%` }} className="bg-red-500" title="Proteínas"></div>
                <div style={{ width: `${plan.macros.fat.percentage}%` }} className="bg-amber-400" title="Grasas"></div>
                <div style={{ width: `${plan.macros.carbs.percentage}%` }} className="bg-emerald-500" title="Carbohidratos"></div>
              </div>

              {/* Estado Nutricional IMC */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>
                  Estado actual: <strong>IMC {bmiInfo.bmi}</strong> ({bmiInfo.classification})
                </span>
                <span>
                  Rango saludable (18.5 - 24.9): <strong>{idealWeights.metropolitanRange.minKg} - {idealWeights.metropolitanRange.maxKg} kg</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: ANTROPOMETRÍA Y FAULKNER */}
      {activeTab === "bodyfat" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Pliegues Cutáneos (Ecuación de Faulkner - 4 Pliegues)
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tríceps (mm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={triceps}
                  onChange={(e) => setTriceps(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Subescapular (mm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={subscapular}
                  onChange={(e) => setSubscapular(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Suprailíaco (mm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={suprailiac}
                  onChange={(e) => setSuprailiac(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Abdominal (mm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={abdominal}
                  onChange={(e) => setAbdominal(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
              Suma de 4 pliegues: <strong>{triceps + subscapular + suprailiac + abdominal} mm</strong>.
              Fórmula: <code>% Grasa = (Suma × 0.153) + 5.783</code>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Resultados de Composición Corporal
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
                <span className="text-xs font-bold text-amber-800 uppercase">% Grasa Corporal</span>
                <div className="text-3xl font-bold text-amber-900 mt-1">{faulknerFat}%</div>
                <p className="text-xs text-amber-700 mt-1">{compartments.fatMassKg} kg de grasa</p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                <span className="text-xs font-bold text-blue-800 uppercase">Masa Libre de Grasa</span>
                <div className="text-3xl font-bold text-blue-900 mt-1">{compartments.leanMassKg} kg</div>
                <p className="text-xs text-blue-700 mt-1">{(100 - faulknerFat).toFixed(1)}% magro</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Masa Muscular Estimada:</span>
                <strong className="text-slate-800">{compartments.muscleMassKg} kg</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Masa Residual y Ósea:</span>
                <strong className="text-slate-800">{compartments.residualKg} kg</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: SOMATOTIPO HEATH-CARTER */}
      {activeTab === "somatotype" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Mediciones para Somatocarta (Heath-Carter)
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tríceps (mm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={somatoTriceps}
                  onChange={(e) => setSomatoTriceps(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Subescapular (mm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={somatoSubscapular}
                  onChange={(e) => setSomatoSubscapular(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Suprailíaco (mm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={somatoSuprailiac}
                  onChange={(e) => setSomatoSuprailiac(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm"
                />
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Calcula los 3 ejes biomecánicos: Endomorfia (adiposidad relativa), Mesomorfia (robustez músculo-esquelética) y Ectomorfia (linealidad relativa).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Clasificación y Coordenadas en Somatocarta
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-red-50/70 border border-red-100 rounded-xl">
                <span className="text-xs font-bold text-red-800">Endomorfia</span>
                <div className="text-2xl font-bold text-red-900 mt-1">{somatotype.endomorphy}</div>
              </div>
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                <span className="text-xs font-bold text-blue-800">Mesomorfia</span>
                <div className="text-2xl font-bold text-blue-900 mt-1">{somatotype.mesomorphy}</div>
              </div>
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                <span className="text-xs font-bold text-emerald-800">Ectomorfia</span>
                <div className="text-2xl font-bold text-emerald-900 mt-1">{somatotype.ectomorphy}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">Clasificación Somatotípica</span>
              <div className="text-lg font-bold text-slate-900">{somatotype.classification}</div>
              <div className="text-xs text-slate-500 font-mono">
                Coordenadas Somatocarta: X = {somatotype.xCoord} | Y = {somatotype.yCoord}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
