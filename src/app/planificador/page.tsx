import { db } from "@/lib/db";
import WeeklyPlannerCalendar from "@/components/mealplan/WeeklyPlannerCalendar";
import Link from "next/link";
import { Calendar, ChefHat, Sparkles, Plus } from "lucide-react";
import { createWeeklyMealPlan, assignRecipeToSlot } from "@/actions/mealplan-actions";

export const dynamic = "force-dynamic";

export default async function PlannerPage() {
  // 1. Buscar si ya existe algún plan semanal
  let plan = await db.weeklyMealPlan.findFirst({
    include: {
      patient: {
        select: { id: true, firstName: true, lastName: true, recordNumber: true },
      },
      slots: {
        include: {
          recipe: {
            select: { id: true, code: true, name: true, category: true, tags: true },
          },
        },
        orderBy: [{ dayOfWeek: "asc" }],
      },
    },
  });

  // 2. Si no existe ningún plan, crear uno base automáticamente
  if (!plan) {
    const firstPatient = await db.patient.findFirst({
      select: { id: true },
    });

    const newPlan = await createWeeklyMealPlan({
      patientId: firstPatient?.id || null,
      title: "Plan Semanal Estandarizado - Dieta Balanceada Peruana",
      targetKcal: 1950,
      targetProteinG: 130,
      targetCarbsG: 210,
      targetFatG: 55,
      notes: "Prescripción inicial con alimentos peruanos de alta densidad nutricional.",
    });

    // Asignar recetas de muestra a los slots del Lunes y Martes
    const recipes = await db.recipe.findMany({ take: 6 });
    const slots = await db.mealPlanSlot.findMany({
      where: { mealPlanId: newPlan.id },
      orderBy: [{ dayOfWeek: "asc" }],
    });

    // Lunes (dayOfWeek: 0): Desayuno, Almuerzo, Cena
    const breakfast = recipes.find((r) => r.category === "DESAYUNO");
    const lunch = recipes.find((r) => r.category === "ALMUERZO");
    const dinner = recipes.find((r) => r.category === "CENA");

    const mondayBreakfast = slots.find((s) => s.dayOfWeek === 0 && s.mealTime === "DESAYUNO");
    const mondayLunch = slots.find((s) => s.dayOfWeek === 0 && s.mealTime === "ALMUERZO");
    const mondayDinner = slots.find((s) => s.dayOfWeek === 0 && s.mealTime === "CENA");

    if (breakfast && mondayBreakfast) await assignRecipeToSlot(mondayBreakfast.id, breakfast.id);
    if (lunch && mondayLunch) await assignRecipeToSlot(mondayLunch.id, lunch.id);
    if (dinner && mondayDinner) await assignRecipeToSlot(mondayDinner.id, dinner.id);

    // Recargar el plan completo
    plan = await db.weeklyMealPlan.findUnique({
      where: { id: newPlan.id },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, recordNumber: true },
        },
        slots: {
          include: {
            recipe: {
              select: { id: true, code: true, name: true, category: true, tags: true },
            },
          },
          orderBy: [{ dayOfWeek: "asc" }],
        },
      },
    });
  }

  // 3. Traer recetas disponibles para el selector rápido
  const availableRecipes = await db.recipe.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      totalKcal: true,
      totalProteinG: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Calendario de Alimentación de Clase Mundial
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Planificador Semanal & Lista de Compras
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Organiza los 7 días de la semana con los 5 tiempos de comida. Desglosa cualquier preparación ("Explode Recipe") para ajustar gramos individuales y genera la lista de compras consolidada para el paciente.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/recetas"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition"
          >
            <ChefHat className="w-4 h-4 text-emerald-600" />
            Ver Catálogo de Recetas
          </Link>
        </div>
      </div>

      {/* Calendario Semanal */}
      {plan && (
        <WeeklyPlannerCalendar
          initialPlan={plan as any}
          availableRecipes={availableRecipes}
        />
      )}
    </div>
  );
}
