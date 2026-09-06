"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ShoppingCart,
  Printer,
  Sparkles,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  Flame,
  Scale,
  Utensils,
  User,
  AlertCircle,
  Clock,
  Layers,
} from "lucide-react";
import RecipeExploderModal from "../recipes/RecipeExploderModal";
import GroceryListModal from "./GroceryListModal";
import {
  assignRecipeToSlot,
  explodeSlotRecipe,
  updateSlotIngredients,
  clearSlot,
  getConsolidatedGroceryList,
  ConsolidatedGroceryCategory,
  MealIngredientItem,
} from "@/actions/mealplan-actions";

export interface MealPlanSlotData {
  id: string;
  dayOfWeek: number;
  mealTime: string;
  recipeId?: string | null;
  customTitle: string;
  isExploded: boolean;
  ingredientsJson?: string | null;
  totalKcal: number;
  totalProteinG: number;
  totalFatG: number;
  totalCarbsG: number;
  totalIronMg: number;
  recipe?: {
    id: string;
    code: string;
    name: string;
    category: string;
    tags?: string | null;
  } | null;
}

export interface WeeklyPlanData {
  id: string;
  title: string;
  targetKcal: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    recordNumber: string;
  } | null;
  slots: MealPlanSlotData[];
}

export interface RecipeSimple {
  id: string;
  name: string;
  category: string;
  totalKcal: number;
  totalProteinG: number;
}

const DAY_NAMES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const MEAL_TIMES = [
  { key: "DESAYUNO", label: "Desayuno", time: "08:00" },
  { key: "MEDIA_MANANA", label: "Media Mañana", time: "11:00" },
  { key: "ALMUERZO", label: "Almuerzo", time: "13:30" },
  { key: "MEDIA_TARDE", label: "Media Tarde", time: "17:00" },
  { key: "CENA", label: "Cena", time: "20:30" },
];

export default function WeeklyPlannerCalendar({
  initialPlan,
  availableRecipes,
}: {
  initialPlan: WeeklyPlanData;
  availableRecipes: RecipeSimple[];
}) {
  const [plan, setPlan] = useState<WeeklyPlanData>(initialPlan);
  const [selectedDay, setSelectedDay] = useState<number>(0); // 0 = Lunes

  // Modal de Desglose (Explode Recipe)
  const [explodingSlot, setExplodingSlot] = useState<MealPlanSlotData | null>(null);

  // Modal de Asignar Receta
  const [assigningSlot, setAssigningSlot] = useState<MealPlanSlotData | null>(null);
  const [recipeFilterText, setRecipeFilterText] = useState("");

  // Modal de Lista de Compras
  const [isGroceryOpen, setIsGroceryOpen] = useState(false);
  const [groceryCategories, setGroceryCategories] = useState<ConsolidatedGroceryCategory[]>([]);
  const [loadingGrocery, setLoadingGrocery] = useState(false);

  // Calcular totales por día (0 a 6)
  const dailyTotals = useMemo(() => {
    const map: Record<
      number,
      { kcal: number; protein: number; fat: number; carbs: number; iron: number }
    > = {};

    for (let d = 0; d < 7; d++) {
      map[d] = { kcal: 0, protein: 0, fat: 0, carbs: 0, iron: 0 };
    }

    for (const slot of plan.slots) {
      if (map[slot.dayOfWeek]) {
        map[slot.dayOfWeek].kcal += slot.totalKcal;
        map[slot.dayOfWeek].protein += slot.totalProteinG;
        map[slot.dayOfWeek].fat += slot.totalFatG;
        map[slot.dayOfWeek].carbs += slot.totalCarbsG;
        map[slot.dayOfWeek].iron += slot.totalIronMg;
      }
    }

    return map;
  }, [plan.slots]);

  // Manejar Asignación de Receta a Slot
  const handleAssignRecipe = async (recipeId: string) => {
    if (!assigningSlot) return;
    try {
      const updated = await assignRecipeToSlot(assigningSlot.id, recipeId);
      setPlan((prev) => ({
        ...prev,
        slots: prev.slots.map((s) => (s.id === assigningSlot.id ? (updated as any) : s)),
      }));
      setAssigningSlot(null);
    } catch (e: any) {
      alert("Error asignando receta: " + e.message);
    }
  };

  // Manejar Desglose Directo ("Explode Recipe")
  const handleTriggerExplode = async (slot: MealPlanSlotData) => {
    setExplodingSlot(slot);
  };

  // Guardar Cambios del Desglose
  const handleSaveSlotIngredients = async (
    updatedIngredients: MealIngredientItem[],
    updatedTitle?: string
  ) => {
    if (!explodingSlot) return;
    try {
      const updated = await updateSlotIngredients(
        explodingSlot.id,
        updatedIngredients,
        updatedTitle
      );
      setPlan((prev) => ({
        ...prev,
        slots: prev.slots.map((s) => (s.id === explodingSlot.id ? (updated as any) : s)),
      }));
    } catch (e: any) {
      alert("Error guardando modificaciones: " + e.message);
    }
  };

  // Limpiar Slot
  const handleClearSlot = async (slotId: string) => {
    if (!confirm("¿Deseas vaciar este tiempo de comida?")) return;
    try {
      const updated = await clearSlot(slotId);
      setPlan((prev) => ({
        ...prev,
        slots: prev.slots.map((s) => (s.id === slotId ? (updated as any) : s)),
      }));
    } catch (e: any) {
      alert("Error vaciando slot: " + e.message);
    }
  };

  // Abrir Lista de Compras Consolidada
  const handleOpenGroceryList = async () => {
    setLoadingGrocery(true);
    try {
      const cats = await getConsolidatedGroceryList(plan.id);
      setGroceryCategories(cats);
      setIsGroceryOpen(true);
    } catch (e: any) {
      alert("Error consolidando lista: " + e.message);
    } finally {
      setLoadingGrocery(false);
    }
  };

  const getIngredientsFromSlot = (slot: MealPlanSlotData): MealIngredientItem[] => {
    if (slot.ingredientsJson) {
      try {
        return JSON.parse(slot.ingredientsJson);
      } catch (e) {}
    }
    return [];
  };

  return (
    <div className="space-y-6">
      {/* Barra Superior con Resumen del Paciente y Metas */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Plan Semanal Activo
            </span>
            {plan.patient && (
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {plan.patient.firstName} {plan.patient.lastName} (Folio: {plan.patient.recordNumber})
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">{plan.title}</h2>
        </div>

        {/* Metas Nutricionales y Botones de Logística */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span>Meta Diaria:</span>
            <strong className="text-amber-600 font-bold">{plan.targetKcal} kcal</strong>
            <span>• P: {plan.targetProteinG}g • G: {plan.targetFatG}g • C: {plan.targetCarbsG}g</span>
          </div>

          <button
            onClick={handleOpenGroceryList}
            disabled={loadingGrocery}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition"
          >
            <ShoppingCart className="w-4 h-4" />
            {loadingGrocery ? "Calculando..." : "Lista de Compras"}
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs sm:text-sm font-semibold rounded-xl transition"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Selector de Días de la Semana con Barras de Balance Calórico */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {DAY_NAMES.map((dayName, index) => {
          const tot = dailyTotals[index];
          const pct = Math.round((tot.kcal / (plan.targetKcal || 2000)) * 100);
          const isSelected = selectedDay === index;

          let badgeColor = "bg-slate-100 text-slate-600";
          if (pct >= 85 && pct <= 115) badgeColor = "bg-emerald-100 text-emerald-800 font-bold";
          else if (pct > 115) badgeColor = "bg-rose-100 text-rose-800 font-bold";
          else if (pct > 0) badgeColor = "bg-amber-100 text-amber-800 font-bold";

          return (
            <button
              key={dayName}
              onClick={() => setSelectedDay(index)}
              className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-white/80 hover:bg-white border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{dayName}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${badgeColor}`}>
                  {pct}%
                </span>
              </div>

              <div className="mt-2">
                <span className="text-base font-black text-slate-900 block">
                  {Math.round(tot.kcal)}{" "}
                  <span className="text-[10px] font-normal text-slate-400">kcal</span>
                </span>
                <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                  <span>P: {Math.round(tot.protein)}g</span>
                  <span>Fe: {Math.round(tot.iron)}mg</span>
                </div>
              </div>

              {/* Mini barra de progreso */}
              <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full ${
                    pct >= 85 && pct <= 115
                      ? "bg-emerald-500"
                      : pct > 115
                      ? "bg-rose-500"
                      : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Vista Detallada del Día Seleccionado */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-base text-slate-900">
              Comidas del {DAY_NAMES[selectedDay]}
            </h3>
          </div>
          <div className="text-xs text-slate-600 flex items-center gap-3">
            <span>
              Total Día:{" "}
              <strong className="text-amber-600 text-sm">
                {Math.round(dailyTotals[selectedDay].kcal)} kcal
              </strong>
            </span>
            <span>• P: {Math.round(dailyTotals[selectedDay].protein)}g</span>
            <span>• G: {Math.round(dailyTotals[selectedDay].fat)}g</span>
            <span>• C: {Math.round(dailyTotals[selectedDay].carbs)}g</span>
            <span>• Fe: {Math.round(dailyTotals[selectedDay].iron)}mg</span>
          </div>
        </div>

        {/* Tiempos de Comida del Día */}
        <div className="divide-y divide-slate-100">
          {MEAL_TIMES.map((mealTime) => {
            const slot = plan.slots.find(
              (s) => s.dayOfWeek === selectedDay && s.mealTime === mealTime.key
            );

            const hasRecipe = slot && (slot.recipeId || slot.customTitle || slot.totalKcal > 0);
            const ingredients = slot ? getIngredientsFromSlot(slot) : [];

            return (
              <div
                key={mealTime.key}
                className="p-5 hover:bg-slate-50/70 transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                {/* Indicador de Horario y Tiempo */}
                <div className="flex items-center gap-3 min-w-[170px]">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">
                      {mealTime.label}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {mealTime.time}
                    </span>
                  </div>
                </div>

                {/* Contenido del Plato Asignado */}
                <div className="flex-1">
                  {hasRecipe ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-slate-800">
                          {slot?.customTitle || slot?.recipe?.name}
                        </span>

                        {slot?.isExploded && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Desglosada ({ingredients.length} insumos)
                          </span>
                        )}
                      </div>

                      {/* Macronutrientes y Calorías */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="font-extrabold text-amber-600 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {slot?.totalKcal} kcal
                        </span>
                        <span>• Proteína: <strong>{slot?.totalProteinG}g</strong></span>
                        <span>• Grasas: <strong>{slot?.totalFatG}g</strong></span>
                        <span>• Carbos: <strong>{slot?.totalCarbsG}g</strong></span>
                        {slot?.totalIronMg ? (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                            Fe: {slot.totalIronMg} mg
                          </span>
                        ) : null}
                      </div>

                      {/* Lista resumida de ingredientes si está desglosada */}
                      {slot?.isExploded && ingredients.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {ingredients.map((ing, i) => (
                            <span
                              key={i}
                              className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                            >
                              {ing.foodName}: <strong>{ing.netWeightG}g</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">
                      Sin menú asignado para este tiempo de comida.
                    </div>
                  )}
                </div>

                {/* Botones de Acción */}
                <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                  {hasRecipe ? (
                    <>
                      {/* Botón Desglosar / Modificar Ingredientes */}
                      <button
                        onClick={() => slot && handleTriggerExplode(slot)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold rounded-xl transition shadow-2xs"
                        title="Desglosar en ingredientes individuales, alterar gramos o quitar alérgenos"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Desglosar / Alterar (Explode)
                      </button>

                      {/* Botón Cambiar Receta */}
                      <button
                        onClick={() => slot && setAssigningSlot(slot)}
                        className="px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition"
                      >
                        Cambiar
                      </button>

                      {/* Botón Limpiar */}
                      <button
                        onClick={() => slot && handleClearSlot(slot.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Vaciar tiempo de comida"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => slot && setAssigningSlot(slot)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition"
                    >
                      <Plus className="w-4 h-4" />
                      Asignar Receta Peruana
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Desglose en Vivo ("Explode Recipe") */}
      {explodingSlot && (
        <RecipeExploderModal
          isOpen={!!explodingSlot}
          onClose={() => setExplodingSlot(null)}
          title={explodingSlot.customTitle || explodingSlot.recipe?.name || "Comida"}
          initialIngredients={getIngredientsFromSlot(explodingSlot)}
          onSave={handleSaveSlotIngredients}
          targetKcal={Math.round(plan.targetKcal / 4)}
        />
      )}

      {/* Modal para Seleccionar Receta del Catálogo */}
      {assigningSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h4 className="font-bold text-sm text-slate-800">
                Seleccionar Receta para {assigningSlot.mealTime} ({DAY_NAMES[assigningSlot.dayOfWeek]})
              </h4>
              <button
                onClick={() => setAssigningSlot(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              <input
                type="text"
                placeholder="Filtrar receta por nombre..."
                value={recipeFilterText}
                onChange={(e) => setRecipeFilterText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {availableRecipes
                  .filter((r) =>
                    r.name.toLowerCase().includes(recipeFilterText.toLowerCase())
                  )
                  .map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleAssignRecipe(r.id)}
                      className="w-full text-left p-3 hover:bg-emerald-50 flex items-center justify-between rounded-xl transition"
                    >
                      <div>
                        <span className="font-bold text-xs text-slate-800 block">{r.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase">{r.category}</span>
                      </div>
                      <div className="text-right">
                        <strong className="text-xs text-amber-600 block">{r.totalKcal} kcal</strong>
                        <span className="text-[10px] text-slate-500">P: {r.totalProteinG}g</span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Lista de Compras Consolidada */}
      <GroceryListModal
        isOpen={isGroceryOpen}
        onClose={() => setIsGroceryOpen(false)}
        planTitle={plan.title}
        categories={groceryCategories}
      />
    </div>
  );
}
