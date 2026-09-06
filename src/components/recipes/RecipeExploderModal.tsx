"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  Trash2,
  Flame,
  Scale,
  Search,
  Check,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  Utensils,
} from "lucide-react";
import { searchTpcaFoods, SearchTpcaFoodItem } from "@/actions/recipe-actions";
import { MealIngredientItem } from "@/actions/mealplan-actions";

export interface ExploderItem extends MealIngredientItem {
  // Factores por gramo para recálculo perfecto al cambiar cantidades
  kcalPerG: number;
  proteinPerG: number;
  fatPerG: number;
  carbsPerG: number;
  ironPerG: number;
}

interface RecipeExploderModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialIngredients: MealIngredientItem[];
  onSave: (updatedIngredients: MealIngredientItem[], updatedTitle?: string) => Promise<void>;
  targetKcal?: number;
}

export default function RecipeExploderModal({
  isOpen,
  onClose,
  title,
  initialIngredients,
  onSave,
  targetKcal,
}: RecipeExploderModalProps) {
  const [mealTitle, setMealTitle] = useState(title);
  const [ingredients, setIngredients] = useState<ExploderItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Estado para el buscador TPCA
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchTpcaFoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFoodToAdd, setSelectedFoodToAdd] = useState<SearchTpcaFoodItem | null>(null);
  const [newFoodGrams, setNewFoodGrams] = useState<number>(100);

  // Inicializar los ingredientes con sus factores unitarios por gramo
  useEffect(() => {
    if (isOpen) {
      setMealTitle(title);
      const mapped: ExploderItem[] = initialIngredients.map((ing) => {
        const grams = ing.netWeightG > 0 ? ing.netWeightG : 100;
        return {
          ...ing,
          kcalPerG: ing.energyKcal / grams,
          proteinPerG: ing.proteinG / grams,
          fatPerG: ing.fatG / grams,
          carbsPerG: ing.carbsG / grams,
          ironPerG: (ing.ironMg || 0) / grams,
        };
      });
      setIngredients(mapped);
      setSearchQuery("");
      setSearchResults([]);
      setSelectedFoodToAdd(null);
    }
  }, [isOpen, initialIngredients, title]);

  // Manejar búsqueda reactiva en TPCA
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchTpcaFoods(searchQuery);
        setSearchResults(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Alterar cantidad de gramos de un ingrediente
  const handleGramsChange = (id: string, newGrams: number) => {
    const safeGrams = Math.max(0, isNaN(newGrams) ? 0 : newGrams);
    setIngredients((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const energyKcal = Math.round(item.kcalPerG * safeGrams * 10) / 10;
          const proteinG = Math.round(item.proteinPerG * safeGrams * 10) / 10;
          const fatG = Math.round(item.fatPerG * safeGrams * 10) / 10;
          const carbsG = Math.round(item.carbsPerG * safeGrams * 10) / 10;
          const ironMg = Math.round(item.ironPerG * safeGrams * 10) / 10;
          return {
            ...item,
            netWeightG: safeGrams,
            householdMeasure: `${safeGrams}g`,
            energyKcal,
            proteinG,
            fatG,
            carbsG,
            ironMg,
          };
        }
        return item;
      })
    );
  };

  // Quitar un ingrediente
  const handleRemoveIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  // Agregar nuevo ingrediente desde la TPCA
  const handleAddTpcaFood = () => {
    if (!selectedFoodToAdd) return;
    const grams = Math.max(1, newFoodGrams);
    const kcalPerG = selectedFoodToAdd.energyKcal / 100;
    const proteinPerG = selectedFoodToAdd.proteinG / 100;
    const fatPerG = selectedFoodToAdd.fatG / 100;
    const carbsPerG = selectedFoodToAdd.carbsG / 100;
    const ironPerG = (selectedFoodToAdd.ironMg || 0) / 100;

    const newItem: ExploderItem = {
      id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      foodName: selectedFoodToAdd.name,
      category: selectedFoodToAdd.groupName || "GENERAL",
      netWeightG: grams,
      householdMeasure: `${grams}g`,
      energyKcal: Math.round(kcalPerG * grams * 10) / 10,
      proteinG: Math.round(proteinPerG * grams * 10) / 10,
      fatG: Math.round(fatPerG * grams * 10) / 10,
      carbsG: Math.round(carbsPerG * grams * 10) / 10,
      ironMg: Math.round(ironPerG * grams * 10) / 10,
      peruvianFoodCode: selectedFoodToAdd.code,
      kcalPerG,
      proteinPerG,
      fatPerG,
      carbsPerG,
      ironPerG,
    };

    setIngredients((prev) => [...prev, newItem]);
    setSelectedFoodToAdd(null);
    setSearchQuery("");
    setSearchResults([]);
    setNewFoodGrams(100);
  };

  // Totales en tiempo real
  const totals = useMemo(() => {
    const totalKcal = ingredients.reduce((acc, i) => acc + i.energyKcal, 0);
    const totalProteinG = ingredients.reduce((acc, i) => acc + i.proteinG, 0);
    const totalFatG = ingredients.reduce((acc, i) => acc + i.fatG, 0);
    const totalCarbsG = ingredients.reduce((acc, i) => acc + i.carbsG, 0);
    const totalIronMg = ingredients.reduce((acc, i) => acc + (i.ironMg || 0), 0);
    const totalWeightG = ingredients.reduce((acc, i) => acc + i.netWeightG, 0);

    return {
      totalKcal: Math.round(totalKcal * 10) / 10,
      totalProteinG: Math.round(totalProteinG * 10) / 10,
      totalFatG: Math.round(totalFatG * 10) / 10,
      totalCarbsG: Math.round(totalCarbsG * 10) / 10,
      totalIronMg: Math.round(totalIronMg * 10) / 10,
      totalWeightG: Math.round(totalWeightG * 10) / 10,
    };
  }, [ingredients]);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const cleanItems: MealIngredientItem[] = ingredients.map((item) => ({
        id: item.id,
        foodName: item.foodName,
        category: item.category,
        netWeightG: item.netWeightG,
        householdMeasure: item.householdMeasure,
        energyKcal: item.energyKcal,
        proteinG: item.proteinG,
        fatG: item.fatG,
        carbsG: item.carbsG,
        ironMg: item.ironMg,
        peruvianFoodCode: item.peruvianFoodCode,
      }));
      await onSave(cleanItems, mealTitle);
      onClose();
    } catch (e: any) {
      alert("Error guardando modificaciones: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera del Modal */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-emerald-900/50 px-2 py-0.5 rounded">
                  Modo Desglose (Explode Recipe)
                </span>
                <span className="text-xs text-emerald-100">
                  {ingredients.length} ingredientes
                </span>
              </div>
              <input
                type="text"
                value={mealTitle}
                onChange={(e) => setMealTitle(e.target.value)}
                className="font-bold text-lg text-white bg-transparent border-b border-white/30 focus:border-white focus:outline-hidden px-1 -ml-1 mt-0.5"
                placeholder="Nombre personalizado del plato..."
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Totales Nutricionales en Tiempo Real */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex-shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Energía
              </span>
              <span className="text-lg font-black text-amber-600 flex items-center gap-1">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                {totals.totalKcal} <span className="text-xs font-normal text-slate-500">kcal</span>
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Proteínas
              </span>
              <span className="text-base font-bold text-blue-700">
                {totals.totalProteinG} <span className="text-xs font-normal text-slate-500">g</span>
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Grasas
              </span>
              <span className="text-base font-bold text-rose-600">
                {totals.totalFatG} <span className="text-xs font-normal text-slate-500">g</span>
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Carbohidratos
              </span>
              <span className="text-base font-bold text-amber-700">
                {totals.totalCarbsG} <span className="text-xs font-normal text-slate-500">g</span>
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Hierro (Fe)
              </span>
              <span className="text-base font-bold text-emerald-700">
                {totals.totalIronMg} <span className="text-xs font-normal text-slate-500">mg</span>
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Peso Total
              </span>
              <span className="text-base font-bold text-slate-700">
                {totals.totalWeightG} <span className="text-xs font-normal text-slate-500">g</span>
              </span>
            </div>
          </div>
        </div>

        {/* Cuerpo con Scroll: Lista de Ingredientes y Buscador */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Instrucciones Rápidas */}
          <div className="flex items-center justify-between text-xs text-slate-600 bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>
                <strong>Instrucciones clínicas:</strong> Modifica los gramos ($g$) en cualquier fila para recalcular las calorías en vivo, o elimina insumos no deseados (como aceites o alérgenos).
              </span>
            </div>
            {targetKcal && (
              <span className="font-semibold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-lg">
                Meta del Plato: ~{targetKcal} kcal
              </span>
            )}
          </div>

          {/* Tabla de Ingredientes Desglosados */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Ingrediente</th>
                  <th className="py-2.5 px-3 w-28 text-center">Peso Neto (g)</th>
                  <th className="py-2.5 px-3 text-right">Kcal</th>
                  <th className="py-2.5 px-3 text-right">Prot (g)</th>
                  <th className="py-2.5 px-3 text-right hidden sm:table-cell">Grasa (g)</th>
                  <th className="py-2.5 px-3 text-right hidden sm:table-cell">Carb (g)</th>
                  <th className="py-2.5 px-3 text-right hidden sm:table-cell">Fe (mg)</th>
                  <th className="py-2.5 px-3 w-12 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ingredients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No quedan ingredientes en esta receta. Añade uno desde el buscador TPCA abajo.
                    </td>
                  </tr>
                ) : (
                  ingredients.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800">{item.foodName}</div>
                        <div className="text-[11px] text-slate-500">{item.householdMeasure}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center justify-center">
                          <input
                            type="number"
                            min="0"
                            step="5"
                            value={item.netWeightG}
                            onChange={(e) =>
                              handleGramsChange(item.id, parseFloat(e.target.value) || 0)
                            }
                            className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-700">
                        {item.energyKcal}
                      </td>
                      <td className="py-2.5 px-3 text-right text-blue-700 font-semibold">
                        {item.proteinG}
                      </td>
                      <td className="py-2.5 px-3 text-right text-rose-600 hidden sm:table-cell">
                        {item.fatG}
                      </td>
                      <td className="py-2.5 px-3 text-right text-amber-600 hidden sm:table-cell">
                        {item.carbsG}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-medium hidden sm:table-cell">
                        {item.ironMg}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleRemoveIngredient(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Eliminar ingrediente de la receta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Sección para Agregar Nuevos Ingredientes con Buscador TPCA */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              Añadir Ingrediente Adicional desde la TPCA (928 alimentos peruanos)
            </h4>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Escribe el nombre de un alimento (ej. palta, quinua, sangrecita, camote, huevo)..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              {isSearching && (
                <div className="absolute right-3 top-2.5 text-xs text-slate-400">Buscando...</div>
              )}
            </div>

            {/* Resultados de Búsqueda */}
            {searchResults.length > 0 && !selectedFoodToAdd && (
              <div className="bg-white border border-slate-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100 shadow-md">
                {searchResults.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setSelectedFoodToAdd(f);
                      setSearchResults([]);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 flex items-center justify-between transition"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{f.name}</span>
                      <span className="text-[11px] text-slate-500 ml-2">({f.groupName})</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <strong className="text-amber-600">{f.energyKcal} kcal</strong> | P: {f.proteinG}g | G: {f.fatG}g | C: {f.carbsG}g / 100g
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Configurar Gramos del Ingrediente Seleccionado para Agregar */}
            {selectedFoodToAdd && (
              <div className="bg-emerald-100/70 border border-emerald-300 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      {selectedFoodToAdd.name}
                    </span>
                    <span className="text-[11px] text-slate-600 block">
                      Aporte base: {selectedFoodToAdd.energyKcal} kcal por 100g
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700">Cantidad (g):</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={newFoodGrams}
                    onChange={(e) => setNewFoodGrams(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold text-emerald-800"
                  />
                  <button
                    onClick={handleAddTpcaFood}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
                  >
                    Agregar a la Receta
                  </button>
                  <button
                    onClick={() => setSelectedFoodToAdd(null)}
                    className="px-2 py-1 text-slate-500 hover:text-slate-700 text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pie de Acciones del Modal */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs sm:text-sm font-semibold transition"
          >
            Descartar Cambios
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAll}
              disabled={isSaving || ingredients.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-200 transition"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Guardando..." : "Guardar Receta Personalizada"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
