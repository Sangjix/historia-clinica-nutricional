import { db } from "@/lib/db";
import RecipeCatalog from "@/components/recipes/RecipeCatalog";
import Link from "next/link";
import { BookOpen, Calendar, Plus, Sparkles, ChefHat } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RecipesPage() {
  const recipes = await db.recipe.findMany({
    include: {
      ingredients: {
        orderBy: { netWeightG: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <ChefHat className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Recetario Clínico Estandarizado
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Recetas Peruanas con Desglose de Nutrientes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Fórmulas culinarias calculadas con la Tabla Peruana de Composición de Alimentos (CENAN/INS). Desglosa cualquier receta en vivo para adaptar sus ingredientes a las necesidades clínicas de tu paciente.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/planificador"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
          >
            <Calendar className="w-4 h-4" />
            Ir al Planificador Semanal
          </Link>
        </div>
      </div>

      {/* Catálogo y Desglosador */}
      <RecipeCatalog initialRecipes={recipes as any} />
    </div>
  );
}
