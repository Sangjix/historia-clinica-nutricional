"use client";

import React, { useState } from "react";
import {
  Search,
  Flame,
  Clock,
  Award,
  Sparkles,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  Filter,
  Tag,
  BookOpen,
} from "lucide-react";
import RecipeExploderModal from "./RecipeExploderModal";
import { createRecipe, deleteRecipe } from "@/actions/recipe-actions";
import { MealIngredientItem } from "@/actions/mealplan-actions";

export interface RecipeWithIngredients {
  id: string;
  code: string;
  name: string;
  category: string;
  description?: string | null;
  prepTimeMinutes: number;
  servings: number;
  difficulty: string;
  tags?: string | null;
  instructionsJson?: string | null;
  imageUrl?: string | null;
  totalKcal: number;
  totalProteinG: number;
  totalFatG: number;
  totalCarbsG: number;
  totalFiberG?: number | null;
  totalIronMg?: number | null;
  totalSodiumMg?: number | null;
  ingredients: Array<{
    id: string;
    foodName: string;
    category: string;
    netWeightG: number;
    householdMeasure: string;
    energyKcal: number;
    proteinG: number;
    fatG: number;
    carbsG: number;
    ironMg?: number | null;
    peruvianFoodCode?: string | null;
  }>;
}

export default function RecipeCatalog({
  initialRecipes,
}: {
  initialRecipes: RecipeWithIngredients[];
}) {
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>(initialRecipes);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedTag, setSelectedTag] = useState("ALL");

  // Estado para el modal de desglose
  const [activeExplodeRecipe, setActiveExplodeRecipe] = useState<RecipeWithIngredients | null>(null);

  // Filtrado reactivo
  const filteredRecipes = recipes.filter((r) => {
    const matchesCat = selectedCategory === "ALL" || r.category === selectedCategory;
    const matchesTag = selectedTag === "ALL" || (r.tags && r.tags.includes(selectedTag));
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      r.name.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (r.tags && r.tags.toLowerCase().includes(q));

    return matchesCat && matchesTag && matchesQuery;
  });

  // Guardar variante desde el modal de desglose como una nueva receta personalizada
  const handleSaveExplodedVariant = async (
    updatedIngredients: MealIngredientItem[],
    updatedTitle?: string
  ) => {
    if (!activeExplodeRecipe) return;

    try {
      const newName = updatedTitle || `${activeExplodeRecipe.name} (Modificada)`;
      const created = await createRecipe({
        name: newName,
        category: activeExplodeRecipe.category,
        description: `Variante personalizada basada en ${activeExplodeRecipe.name}.`,
        prepTimeMinutes: activeExplodeRecipe.prepTimeMinutes,
        difficulty: activeExplodeRecipe.difficulty,
        tags: activeExplodeRecipe.tags || "PERSONALIZADA",
        ingredients: updatedIngredients.map((i) => ({
          foodName: i.foodName,
          category: i.category,
          netWeightG: i.netWeightG,
          householdMeasure: i.householdMeasure,
          energyKcal: i.energyKcal,
          proteinG: i.proteinG,
          fatG: i.fatG,
          carbsG: i.carbsG,
          ironMg: i.ironMg || 0,
        })),
      });

      setRecipes((prev) => [created as any, ...prev]);
      alert(`✅ Receta "${newName}" guardada en el catálogo.`);
    } catch (e: any) {
      alert("Error guardando variante: " + e.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la receta "${name}"?`)) return;
    try {
      await deleteRecipe(id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch (e: any) {
      alert("Error al eliminar: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Buscador */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar receta por nombre, ingrediente o etiqueta..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Selectores */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">🍽️ Todos los Tiempos</option>
              <option value="DESAYUNO">Desayunos</option>
              <option value="MEDIA_MANANA">Media Mañana</option>
              <option value="ALMUERZO">Almuerzos</option>
              <option value="MEDIA_TARDE">Media Tarde</option>
              <option value="CENA">Cenas</option>
            </select>

            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">🏷️ Todas las Etiquetas Clínicas</option>
              <option value="ANTIANEMICO">🔴 Antianémico (Alto Fe)</option>
              <option value="CARDIOPROTECTOR">💙 Cardioprotector / Omega 3</option>
              <option value="DIABETES">🟢 Diabetes / Bajo IG</option>
              <option value="HIPERPROTEICO">💪 Hiperproteico</option>
              <option value="ALTO_EN_FIBRA">🌾 Alto en Fibra</option>
              <option value="TRADICIONAL_PERUANO">🇵🇪 Tradicional Peruano</option>
            </select>
          </div>
        </div>

        {/* Resumen de Resultados */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Mostrando <strong>{filteredRecipes.length}</strong> recetas clínicas disponibles</span>
          <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
            Estandarizadas con TPCA (CENAN / INS)
          </span>
        </div>
      </div>

      {/* Grid de Recetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
          >
            <div>
              {/* Cabecera de la tarjeta */}
              <div className="p-5 border-b border-slate-100 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    {recipe.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {recipe.prepTimeMinutes} min
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition line-clamp-1">
                  {recipe.name}
                </h3>

                {recipe.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>
                )}

                {/* Etiquetas Clínicas */}
                {recipe.tags && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {recipe.tags.split(",").map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
                      >
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Matriz de Macronutrientes y Kcal */}
              <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 grid grid-cols-4 text-center divide-x divide-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">ENERGÍA</span>
                  <span className="text-sm font-black text-amber-600">
                    {recipe.totalKcal} <span className="text-[10px] font-normal">kcal</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">PROTEÍNA</span>
                  <span className="text-sm font-bold text-blue-700">
                    {recipe.totalProteinG}g
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">GRASA</span>
                  <span className="text-sm font-bold text-rose-600">
                    {recipe.totalFatG}g
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">CARBOS</span>
                  <span className="text-sm font-bold text-amber-700">
                    {recipe.totalCarbsG}g
                  </span>
                </div>
              </div>

              {/* Vista Previa de Ingredientes */}
              <div className="p-5 space-y-2">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Ingredientes ({recipe.ingredients.length})</span>
                  {recipe.totalIronMg && recipe.totalIronMg > 0 ? (
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      Hierro: {recipe.totalIronMg} mg
                    </span>
                  ) : null}
                </div>

                <ul className="text-xs text-slate-600 space-y-1">
                  {recipe.ingredients.slice(0, 4).map((ing) => (
                    <li key={ing.id} className="flex items-center justify-between">
                      <span className="truncate max-w-[190px]">• {ing.foodName}</span>
                      <span className="font-semibold text-slate-800 ml-2">{ing.netWeightG}g</span>
                    </li>
                  ))}
                  {recipe.ingredients.length > 4 && (
                    <li className="text-[11px] text-slate-400 italic">
                      + {recipe.ingredients.length - 4} ingredientes más...
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Acciones de la Tarjeta */}
            <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
              <button
                onClick={() => setActiveExplodeRecipe(recipe)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl transition shadow-2xs group-hover:bg-emerald-600 group-hover:text-white"
                title="Desglosar ingrediente por ingrediente, modificar gramos o quitar ingredientes"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Desglosar Ingredientes (Explode)
              </button>

              {recipe.code.startsWith("REC-") && !recipe.code.startsWith("REC-PER-") && (
                <button
                  onClick={() => handleDelete(recipe.id, recipe.name)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Eliminar receta personalizada"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Desglose Activo */}
      {activeExplodeRecipe && (
        <RecipeExploderModal
          isOpen={!!activeExplodeRecipe}
          onClose={() => setActiveExplodeRecipe(null)}
          title={activeExplodeRecipe.name}
          initialIngredients={activeExplodeRecipe.ingredients.map((ing) => ({
            id: ing.id,
            foodName: ing.foodName,
            category: ing.category,
            netWeightG: ing.netWeightG,
            householdMeasure: ing.householdMeasure,
            energyKcal: ing.energyKcal,
            proteinG: ing.proteinG,
            fatG: ing.fatG,
            carbsG: ing.carbsG,
            ironMg: ing.ironMg || 0,
            peruvianFoodCode: ing.peruvianFoodCode || undefined,
          }))}
          onSave={handleSaveExplodedVariant}
        />
      )}
    </div>
  );
}
