"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Pill,
  Calculator,
  ShieldAlert,
  Droplet,
  Zap,
  BookOpen,
  Plus,
  X,
} from "lucide-react";
import {
  calculateEnteralPrescription,
  evaluateRefeedingRisk,
  SupplementProfile,
} from "@/lib/formulas/supplement-calculator";
import { createSupplement } from "@/actions/supplement-actions";

interface SupplementItem {
  id: string;
  code: string;
  name: string;
  brand: string | null;
  category: string;
  presentation: string;
  servingSize: string;
  kcalPer100gOrMl: number;
  proteinGPer100: number;
  carbsGPer100: number;
  fatGPer100: number;
  fiberGPer100: number | null;
  osmolarityMOsmL: number | null;
  sodiumMgPer100: number | null;
  potassiumMgPer100: number | null;
  phosphorusMgPer100: number | null;
  calciumMgPer100: number | null;
  indications: string | null;
  administrationRoute: string;
}

export default function ClinicalSupplementCalculator({
  supplements,
}: {
  supplements: SupplementItem[];
}) {
  const [selectedTab, setSelectedTab] = useState<"CALCULATOR" | "REFEEDING" | "CATALOG">("CALCULATOR");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado de la Calculadora de Soporte
  const [selectedSuppId, setSelectedSuppId] = useState<string>(
    supplements[0]?.id || ""
  );
  const [calcMode, setCalcMode] = useState<"BY_VOLUME" | "BY_KCAL" | "BY_PROTEIN">("BY_KCAL");
  const [targetValue, setTargetValue] = useState<number>(1000);
  const [hasRenal, setHasRenal] = useState<boolean>(false);
  const [hasDiarrheaRisk, setHasDiarrheaRisk] = useState<boolean>(false);

  // Estado del Evaluador de Síndrome de Realimentación
  const [patientWeightKg, setPatientWeightKg] = useState<number>(55);
  const [currentBmi, setCurrentBmi] = useState<number>(16.5);
  const [weightLossPercent, setWeightLossPercent] = useState<number>(12);
  const [fastingDays, setFastingDays] = useState<number>(7);
  const [lowElectrolytes, setLowElectrolytes] = useState<boolean>(false);
  const [alcoholOrChemo, setAlcoholOrChemo] = useState<boolean>(false);

  const activeSupplement = supplements.find((s) => s.id === selectedSuppId) || supplements[0];

  // Cálculo de pauta enteral
  const suppProfile: SupplementProfile = activeSupplement
    ? {
        id: activeSupplement.id,
        name: activeSupplement.name,
        presentation: activeSupplement.presentation as any,
        kcalPer100gOrMl: activeSupplement.kcalPer100gOrMl,
        proteinGPer100: activeSupplement.proteinGPer100,
        carbsGPer100: activeSupplement.carbsGPer100,
        fatGPer100: activeSupplement.fatGPer100,
        osmolarityMOsmL: activeSupplement.osmolarityMOsmL || undefined,
        sodiumMgPer100: activeSupplement.sodiumMgPer100 || undefined,
        potassiumMgPer100: activeSupplement.potassiumMgPer100 || undefined,
        phosphorusMgPer100: activeSupplement.phosphorusMgPer100 || undefined,
        calciumMgPer100: activeSupplement.calciumMgPer100 || undefined,
      }
    : ({} as any);

  const calcResult = activeSupplement
    ? calculateEnteralPrescription(suppProfile, {
        mode: calcMode,
        targetValue,
        hasRenalImpairment: hasRenal,
        hasOsmoticDiarrheaRisk: hasDiarrheaRisk,
      })
    : null;

  // Cálculo de riesgo de Realimentación
  const refeedingResult = evaluateRefeedingRisk({
    currentBmi,
    unintentionalWeightLossPercentage: weightLossPercent,
    fastingOrLittleIntakeDays: fastingDays,
    lowBaselineElectrolytes: lowElectrolytes,
    historyOfAlcoholMisuseOrChemo: alcoholOrChemo,
  });

  return (
    <div className="space-y-6">
      {/* Pestañas de Navegación del Módulo */}
      <div className="flex flex-wrap items-center border-b border-gray-200 gap-2 bg-white p-2 rounded-2xl shadow-sm">
        <button
          onClick={() => setSelectedTab("CALCULATOR")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition ${
            selectedTab === "CALCULATOR"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Calculator className="w-4 h-4" />
          Calculadora de Soporte Clínico & Enteral
        </button>
        <button
          onClick={() => setSelectedTab("REFEEDING")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition ${
            selectedTab === "REFEEDING"
              ? "bg-rose-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Alerta Síndrome de Realimentación (NICE)
        </button>
        <button
          onClick={() => setSelectedTab("CATALOG")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition ${
            selectedTab === "CATALOG"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Vademécum de Fórmulas y Módulos ({supplements.length})
        </button>

        <button
          onClick={() => setShowAddModal(true)}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Agregar Fórmula
        </button>
      </div>

      {/* TAB 1: CALCULADORA DE SOPORTE ENTERAL / ORAL */}
      {selectedTab === "CALCULATOR" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel Izquierdo: Configuración de la Prescripción */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
              <Pill className="w-5 h-5 text-emerald-600" />
              Parámetros de Prescripción
            </h2>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Fórmula o Módulo Clínico
              </label>
              <select
                value={selectedSuppId}
                onChange={(e) => setSelectedSuppId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500"
              >
                {supplements.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.brand || "Clínico"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Criterio de Cálculo
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCalcMode("BY_KCAL")}
                  className={`px-2 py-2 text-xs font-bold rounded-lg border transition ${
                    calcMode === "BY_KCAL"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Por Kcal Meta
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode("BY_VOLUME")}
                  className={`px-2 py-2 text-xs font-bold rounded-lg border transition ${
                    calcMode === "BY_VOLUME"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Por Volumen (ml)
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode("BY_PROTEIN")}
                  className={`px-2 py-2 text-xs font-bold rounded-lg border transition ${
                    calcMode === "BY_PROTEIN"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Por Proteína (g)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {calcMode === "BY_KCAL"
                  ? "Aporte Calórico Objetivo (Kcal/día)"
                  : calcMode === "BY_VOLUME"
                  ? "Volumen Diario Objetivo (ml o g)"
                  : "Aporte Proteico Objetivo (g/día)"}
              </label>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-base font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2 border-t space-y-3">
              <label className="block text-xs font-bold text-gray-700">
                Condiciones de Seguridad Clínica
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasRenal}
                  onChange={(e) => setHasRenal(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Paciente con Insuficiencia Renal / ERC (Alerta K / P)</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDiarrheaRisk}
                  onChange={(e) => setHasDiarrheaRisk(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Riesgo de Diarrea Osmótica o Intolerancia Digestiva</span>
              </label>
            </div>
          </div>

          {/* Panel Derecho: Resultados de la Prescripción e Infusión */}
          <div className="lg:col-span-2 space-y-6">
            {calcResult && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">
                      Resultado de Prescripción: {activeSupplement.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Vía sugerida: {activeSupplement.administrationRoute === "BOTH" ? "Oral y Enteral por sonda" : activeSupplement.administrationRoute}
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center">
                    <span className="text-xs font-semibold block text-emerald-600">Volumen Total</span>
                    <span className="text-xl font-black">{calcResult.volumeMlOrG} ml / día</span>
                  </div>
                </div>

                {/* Métricas Principales de Aporte */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-center">
                    <span className="text-xs font-bold text-orange-700 block">Energía</span>
                    <span className="text-2xl font-black text-orange-950">{calcResult.totalKcal}</span>
                    <span className="text-xs text-orange-600 block">kcal / día</span>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
                    <span className="text-xs font-bold text-blue-700 block">Proteínas</span>
                    <span className="text-2xl font-black text-blue-950">{calcResult.totalProteinG}</span>
                    <span className="text-xs text-blue-600 block">gramos</span>
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                    <span className="text-xs font-bold text-amber-700 block">Carbohidratos</span>
                    <span className="text-2xl font-black text-amber-950">{calcResult.totalCarbsG}</span>
                    <span className="text-xs text-amber-600 block">gramos</span>
                  </div>
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center">
                    <span className="text-xs font-bold text-rose-700 block">Grasas</span>
                    <span className="text-2xl font-black text-rose-950">{calcResult.totalFatG}</span>
                    <span className="text-xs text-rose-600 block">gramos</span>
                  </div>
                </div>

                {/* Pauta de Infusión por Bomba o Gravedad */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Droplet className="w-4 h-4 text-indigo-600" />
                    Pauta de Infusión Continua Recomendada (Enteral)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                      <span className="text-xs text-gray-500 block">Bomba continua 24 horas:</span>
                      <span className="text-lg font-bold text-indigo-700">
                        {calcResult.infusionRateContinuous24hMlH} ml / hora
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                      <span className="text-xs text-gray-500 block">Bomba 20h (con 4h descanso):</span>
                      <span className="text-lg font-bold text-indigo-700">
                        {calcResult.infusionRateContinuous20hMlH} ml / hora
                      </span>
                    </div>
                  </div>
                </div>

                {/* Electrolitos y Osmolaridad */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-50 border rounded-lg">
                    <span className="text-gray-500 block">Osmolaridad</span>
                    <span className="font-bold text-gray-800">{calcResult.osmolarityMOsmL} mOsm/L</span>
                  </div>
                  <div className="p-2 bg-slate-50 border rounded-lg">
                    <span className="text-gray-500 block">Sodio (Na)</span>
                    <span className="font-bold text-gray-800">{calcResult.totalSodiumMg} mg</span>
                  </div>
                  <div className="p-2 bg-slate-50 border rounded-lg">
                    <span className="text-gray-500 block">Potasio (K)</span>
                    <span className="font-bold text-gray-800">{calcResult.totalPotassiumMg} mg</span>
                  </div>
                  <div className="p-2 bg-slate-50 border rounded-lg">
                    <span className="text-gray-500 block">Fósforo (P)</span>
                    <span className="font-bold text-gray-800">{calcResult.totalPhosphorusMg} mg</span>
                  </div>
                </div>

                {/* Alertas Clínicas de Seguridad */}
                {calcResult.safetyAlerts.length > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                    <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Alertas de Seguridad Clínica Activadas ({calcResult.safetyAlerts.length})
                    </h5>
                    <ul className="space-y-1">
                      {calcResult.safetyAlerts.map((alert, idx) => (
                        <li key={idx} className="text-xs text-amber-800 flex items-start gap-1.5">
                          <span>•</span>
                          <span>{alert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ALERTA SÍNDROME DE REALIMENTACIÓN (NICE) */}
      {selectedTab === "REFEEDING" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              Criterios del Paciente (NICE)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Peso Actual del Paciente (kg)
              </label>
              <input
                type="number"
                value={patientWeightKg}
                onChange={(e) => setPatientWeightKg(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                IMC Actual (kg/m²)
              </label>
              <input
                type="number"
                step="0.1"
                value={currentBmi}
                onChange={(e) => setCurrentBmi(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Pérdida Involuntaria de Peso en 3-6 meses (%)
              </label>
              <input
                type="number"
                value={weightLossPercent}
                onChange={(e) => setWeightLossPercent(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Días continuos con ayuno o ingesta insignificante
              </label>
              <input
                type="number"
                value={fastingDays}
                onChange={(e) => setFastingDays(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm font-semibold"
              />
            </div>

            <div className="space-y-2 pt-2 border-t">
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowElectrolytes}
                  onChange={(e) => setLowElectrolytes(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span>Electrolitos basales bajos (Fósforo, Potasio o Magnesio)</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alcoholOrChemo}
                  onChange={(e) => setAlcoholOrChemo(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span>Historial de abuso de alcohol, quimio o diuréticos</span>
              </label>
            </div>
          </div>

          {/* Resultado de Riesgo y Conducta Terapéutica */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h4 className="text-lg font-black text-gray-900">
                  Nivel de Riesgo de Síndrome de Realimentación
                </h4>
                <p className="text-xs text-gray-500">
                  Criterios diagnósticos estandarizados de las Guías Clínicas NICE
                </p>
              </div>

              <div>
                {refeedingResult.riskLevel === "MUY_ALTO" || refeedingResult.riskLevel === "ALTO" ? (
                  <span className="px-4 py-2 bg-rose-100 text-rose-800 text-sm font-black rounded-xl border border-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> RIESGO {refeedingResult.riskLevel}
                  </span>
                ) : refeedingResult.riskLevel === "MODERADO" ? (
                  <span className="px-4 py-2 bg-amber-100 text-amber-800 text-sm font-black rounded-xl border border-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> RIESGO MODERADO
                  </span>
                ) : (
                  <span className="px-4 py-2 bg-emerald-100 text-emerald-800 text-sm font-black rounded-xl border border-emerald-300 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> RIESGO BAJO
                  </span>
                )}
              </div>
            </div>

            {/* Aporte Calórico de Inicio Conservador */}
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                  Prescripción Inicial Máxima Recomendada
                </span>
                <span className="text-xs text-rose-700">
                  Para las primeras 48 a 72 horas de inicio de alimentación
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-rose-950 block">
                  {refeedingResult.recommendedMaxStartingKcal(patientWeightKg)} kcal / día
                </span>
                <span className="text-xs font-semibold text-rose-700">
                  ({refeedingResult.recommendedStartingKcalKgDay} kcal/kg/día)
                </span>
              </div>
            </div>

            {/* Criterios Cumplidos */}
            <div>
              <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Criterios Diagnósticos Disparados:
              </h5>
              {refeedingResult.criteriaTriggered.length === 0 ? (
                <p className="text-xs text-gray-500 italic">Ningún criterio mayor o menor activado.</p>
              ) : (
                <ul className="space-y-1.5">
                  {refeedingResult.criteriaTriggered.map((crit, idx) => (
                    <li key={idx} className="text-xs text-rose-800 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-600 flex-shrink-0" />
                      {crit}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Guía Clínica de Manejo y Vigilancia */}
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
              <h5 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-600" />
                Guía de Conducta Terapéutica Obligatoria:
              </h5>
              <ul className="space-y-1.5">
                {refeedingResult.clinicalGuidance.map((guide, idx) => (
                  <li key={idx} className="text-xs text-indigo-800 flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>{guide}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CATÁLOGO DEL VADEMÉCUM */}
      {selectedTab === "CATALOG" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-gray-900">Catálogo de Fórmulas y Módulos Clínicos</h3>
              <p className="text-xs text-gray-500">
                {supplements.length} fórmulas registradas para soporte nutricional oral y enteral por sonda.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Agregar Nueva Fórmula
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supplements.map((s) => (
              <div
                key={s.id}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4 hover:border-emerald-500 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      {s.code}
                    </span>
                    <h4 className="text-base font-bold text-gray-900 mt-1">{s.name}</h4>
                    <p className="text-xs text-gray-500 font-medium">{s.brand || "Laboratorio Clínico"}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-700 rounded-lg">
                    {s.presentation}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs py-2 border-y border-gray-100">
                  <div>
                    <span className="text-gray-400 block">Kcal</span>
                    <span className="font-bold text-gray-800">{s.kcalPer100gOrMl}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Prot</span>
                    <span className="font-bold text-blue-600">{s.proteinGPer100}g</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">CHO</span>
                    <span className="font-bold text-amber-600">{s.carbsGPer100}g</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Grasa</span>
                    <span className="font-bold text-rose-600">{s.fatGPer100}g</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="text-gray-600">
                    <strong className="text-gray-800">Porción:</strong> {s.servingSize}
                  </p>
                  {s.osmolarityMOsmL && (
                    <p className="text-gray-600">
                      <strong className="text-gray-800">Osmolaridad:</strong> {s.osmolarityMOsmL} mOsm/L
                    </p>
                  )}
                  {s.indications && (
                    <p className="text-gray-600 line-clamp-2">
                      <strong className="text-gray-800">Indicaciones:</strong> {s.indications}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedSuppId(s.id);
                    setSelectedTab("CALCULATOR");
                  }}
                  className="w-full py-2 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 text-xs font-bold rounded-xl border border-gray-200 hover:border-emerald-300 transition text-center"
                >
                  Calcular Dosis de Esta Fórmula
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para Agregar Nueva Fórmula / Módulo Clínico */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600" />
                Registrar Nueva Fórmula o Módulo Clínico
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              action={async (formData) => {
                setIsSubmitting(true);
                try {
                  await createSupplement(formData);
                  setShowAddModal(false);
                  window.location.reload();
                } catch (err: any) {
                  alert(err.message || "Error al registrar la fórmula.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              {/* Bloque 1: Identificación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">
                    Nombre Comercial de la Fórmula *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="ej. Pulmocare 1.5, Nepro HP, Whey Isolate 90%"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Marca o Laboratorio
                  </label>
                  <input
                    type="text"
                    name="brand"
                    placeholder="ej. Abbott, Nestlé Health Science, Fresenius"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Código Interno / Referencia
                  </label>
                  <input
                    type="text"
                    name="code"
                    placeholder="ej. PUL-15, NEP-HP (opcional)"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Bloque 2: Clasificación y Vía */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Categoría</label>
                  <select
                    name="category"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ENTERAL_STANDARD">Enteral Estándar</option>
                    <option value="ENTERAL_SPECIALIZED">Enteral Especializada (Renal/Diabetes/Crítico)</option>
                    <option value="PROTEIN_MODULE">Módulo Proteico</option>
                    <option value="CARB_MODULE">Módulo de Carbohidratos</option>
                    <option value="LIPID_MODULE">Módulo de Lípidos / MCT</option>
                    <option value="MICRONUTRIENT">Micronutriente / Complejo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Presentación</label>
                  <select
                    name="presentation"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="LIQUIDO">Líquido (Listo para usar)</option>
                    <option value="POLVO">Polvo para reconstituir</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Vía de Administración</label>
                  <select
                    name="administrationRoute"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="BOTH">Oral y Sonda Enteral</option>
                    <option value="ORAL">Exclusivo Vía Oral</option>
                    <option value="ENTERAL_TUBE">Exclusivo Sonda Enteral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Porción de Consumo Habitual
                </label>
                <input
                  type="text"
                  name="servingSize"
                  placeholder="ej. 237 ml (1 botella), 1 medida scoop (25g)"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Bloque 3: Composición Nutricional por 100g o 100ml */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">
                  Aporte Nutricional en 100 ml (Líquido) o 100 g (Polvo)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div>
                    <label className="block text-gray-600 font-semibold mb-0.5">Kcal *</label>
                    <input
                      type="number"
                      step="0.1"
                      name="kcalPer100gOrMl"
                      required
                      placeholder="100"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-700 font-semibold mb-0.5">Proteínas (g) *</label>
                    <input
                      type="number"
                      step="0.1"
                      name="proteinGPer100"
                      required
                      placeholder="4.5"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-blue-700"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-700 font-semibold mb-0.5">Carbohidratos (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="carbsGPer100"
                      placeholder="12.0"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-amber-700"
                    />
                  </div>
                  <div>
                    <label className="block text-rose-700 font-semibold mb-0.5">Grasas (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="fatGPer100"
                      placeholder="3.5"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-rose-700"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-0.5">Fibra (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="fiberGPer100"
                      placeholder="1.0"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque 4: Osmolaridad y Electrolitos Críticos */}
              <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-2">
                <span className="font-bold text-indigo-900 uppercase tracking-wider block text-[11px]">
                  Electrolitos Críticos y Osmolaridad (Para Alertas de Seguridad)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div>
                    <label className="block text-gray-600 font-semibold mb-0.5">Osmolaridad</label>
                    <input
                      type="number"
                      name="osmolarityMOsmL"
                      placeholder="mOsm/L"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-0.5">Sodio (mg)</label>
                    <input
                      type="number"
                      name="sodiumMgPer100"
                      placeholder="mg / 100"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-0.5">Potasio (mg)</label>
                    <input
                      type="number"
                      name="potassiumMgPer100"
                      placeholder="mg / 100"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-0.5">Fósforo (mg)</label>
                    <input
                      type="number"
                      name="phosphorusMgPer100"
                      placeholder="mg / 100"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-0.5">Calcio (mg)</label>
                    <input
                      type="number"
                      name="calciumMgPer100"
                      placeholder="mg / 100"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque 5: Indicaciones Clínicas */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Indicaciones Clínicas Principales
                </label>
                <textarea
                  name="indications"
                  rows={2}
                  placeholder="ej. Pacientes críticos hipercatabólicos, restricción hídrica, desnutrición en oncología..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Guardar Fórmula en Vademécum"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
