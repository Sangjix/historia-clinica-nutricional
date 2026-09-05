import { db } from "@/lib/db";
import Link from "next/link";
import { Apple, Search, Flame, Award, Scale, BookOpen, Layers, Sparkles, FileText } from "lucide-react";
import SuggestedEquivalencesTable from "@/components/food/SuggestedEquivalencesTable";
import TaferaPdfViewer from "@/components/food/TaferaPdfViewer";

export const dynamic = "force-dynamic";

interface FoodPageProps {
  searchParams: Promise<{
    tab?: string;
    q?: string;
    group?: string;
    page?: string;
  }>;
}

export default async function FoodPage({ searchParams }: FoodPageProps) {
  const { tab = "tpca", q = "", group = "TODOS", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page) || 1);
  const pageSize = 40;
  const skip = (currentPage - 1) * pageSize;

  // 1. Datos TPCA (Tabla Peruana de Composición de Alimentos)
  let tpcaFoods: any[] = [];
  let tpcaTotal = 0;
  let tpcaGroups: { groupCode: string; groupName: string }[] = [];

  if (tab === "tpca") {
    const whereClause: any = {
      AND: [
        q ? { name: { contains: q } } : {},
        group && group !== "TODOS" ? { groupCode: group } : {},
      ],
    };

    [tpcaFoods, tpcaTotal, tpcaGroups] = await Promise.all([
      db.peruvianFood.findMany({
        where: whereClause,
        orderBy: { name: "asc" },
        skip,
        take: pageSize,
      }),
      db.peruvianFood.count({ where: whereClause }),
      db.peruvianFood.findMany({
        select: { groupCode: true, groupName: true },
        distinct: ["groupCode"],
        orderBy: { groupCode: "asc" },
      }),
    ]);
  }

  // 2. Datos TAFERA 2016 VF (Porciones y Medidas Caseras)
  let taferaPortions: any[] = [];
  let taferaTotal = 0;
  let taferaGroups: { groupNumber: number; groupName: string }[] = [];

  if (tab === "tafera") {
    const groupNum = group !== "TODOS" ? parseInt(group) : undefined;
    const whereClause: any = {
      AND: [
        q
          ? {
              OR: [
                { foodName: { contains: q } },
                { householdMeasure: { contains: q } },
              ],
            }
          : {},
        groupNum ? { groupNumber: groupNum } : {},
      ],
    };

    [taferaPortions, taferaTotal, taferaGroups] = await Promise.all([
      db.taferaFoodPortion.findMany({
        where: whereClause,
        orderBy: { code: "asc" },
        skip,
        take: pageSize,
      }),
      db.taferaFoodPortion.count({ where: whereClause }),
      db.taferaFoodPortion.findMany({
        select: { groupNumber: true, groupName: true },
        distinct: ["groupNumber"],
        orderBy: { groupNumber: "asc" },
      }),
    ]);
  }

  // 3. Factores de Conversión (Módulo II)
  let conversionFactors: any[] = [];
  let fcTotal = 0;

  if (tab === "fc") {
    const whereClause: any = q
      ? {
          OR: [
            { foodName: { contains: q } },
            { cookingType: { contains: q } },
            { groupName: { contains: q } },
          ],
        }
      : {};

    [conversionFactors, fcTotal] = await Promise.all([
      db.taferaConversionFactor.findMany({
        where: whereClause,
        orderBy: { foodName: "asc" },
        skip,
        take: pageSize,
      }),
      db.taferaConversionFactor.count({ where: whereClause }),
    ]);
  }

  // 4. Sistema de Equivalentes SMAE
  let smaeFoods: any[] = [];
  let smaeTotal = 0;
  if (tab === "smae") {
    const whereClause: any = q ? { name: { contains: q } } : {};
    [smaeFoods, smaeTotal] = await Promise.all([
      db.foodEquivalent.findMany({
        where: whereClause,
        orderBy: { category: "asc" },
      }),
      db.foodEquivalent.count({ where: whereClause }),
    ]);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Apple className="w-6 h-6 text-emerald-600" />
            Bases Bromatológicas y Tablas Nutricionales
          </h2>
          <p className="text-sm text-slate-500">
            Tablas oficiales de composición de alimentos, medidas caseras peruanas (TAFERA 2016) y factores de cocción.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            🇵🇪 CENAN / INS Perú Integrado
          </span>
        </div>
      </div>

      {/* Pestañas Principales */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto text-sm font-semibold">
        <Link
          href={`/alimentos?tab=tpca${q ? `&q=${q}` : ""}`}
          className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            tab === "tpca"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          1. Tabla Peruana de Alimentos (TPCA - 928 alimentos)
        </Link>
        <Link
          href={`/alimentos?tab=tafera${q ? `&q=${q}` : ""}`}
          className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            tab === "tafera"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Scale className="w-4 h-4" />
          2. TAFERA 2016 VF (1023 Porciones y Medidas Caseras)
        </Link>
        <Link
          href={`/alimentos?tab=fc${q ? `&q=${q}` : ""}`}
          className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            tab === "fc"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Flame className="w-4 h-4" />
          3. Factores Cocido a Crudo (FC TAFERA Módulo II)
        </Link>
        <Link
          href={`/alimentos?tab=smae${q ? `&q=${q}` : ""}`}
          className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            tab === "smae"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          4. Equivalentes Rápidos (SMAE)
        </Link>
        <Link
          href="/alimentos?tab=equivalencias"
          className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            tab === "equivalencias"
              ? "border-emerald-600 text-emerald-700 font-bold"
              : "border-transparent text-emerald-700 hover:text-emerald-900 bg-emerald-50/50 px-2 rounded-t"
          }`}
        >
          <Scale className="w-4 h-4 text-emerald-600" />
          ⭐ 5. Equivalencias Sugeridas (10g CHO)
        </Link>
        <Link
          href="/alimentos?tab=pdf"
          className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            tab === "pdf"
              ? "border-emerald-600 text-emerald-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          📖 6. Documento Oficial TAFERA (PDF & Backup)
        </Link>
      </div>

      {/* Buscador Común (solo si no es la pestaña de equivalencias ni visor pdf) */}
      {tab !== "equivalencias" && tab !== "pdf" && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <form method="GET" action="/alimentos" className="relative">
          <input type="hidden" name="tab" value={tab} />
          <input type="hidden" name="group" value={group} />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={
              tab === "tpca"
                ? "Buscar en TPCA por nombre (ej. quinua, sangrecita, papa amarilla, jurel, camote)..."
                : tab === "tafera"
                ? "Buscar en TAFERA por alimento o medida casera (ej. arroz cocido, taza llena, tajada)..."
                : tab === "fc"
                ? "Buscar factor de cocción (ej. arroz, pollo, sancochado, frito)..."
                : "Buscar alimento en catálogo de equivalentes..."
            }
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </form>

        {/* Filtro por grupo para TPCA */}
        {tab === "tpca" && tpcaGroups.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Link
              href={`/alimentos?tab=tpca&group=TODOS${q ? `&q=${q}` : ""}`}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                group === "TODOS"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Todos ({tpcaTotal})
            </Link>
            {tpcaGroups.map((g) => (
              <Link
                key={g.groupCode}
                href={`/alimentos?tab=tpca&group=${g.groupCode}${q ? `&q=${q}` : ""}`}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                  group === g.groupCode
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                [{g.groupCode}] {g.groupName}
              </Link>
            ))}
          </div>
        )}

        {/* Filtro por grupo para TAFERA */}
        {tab === "tafera" && taferaGroups.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Link
              href={`/alimentos?tab=tafera&group=TODOS${q ? `&q=${q}` : ""}`}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                group === "TODOS"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Todos ({taferaTotal})
            </Link>
            {taferaGroups.map((g) => (
              <Link
                key={g.groupNumber}
                href={`/alimentos?tab=tafera&group=${g.groupNumber}${q ? `&q=${q}` : ""}`}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                  group === String(g.groupNumber)
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {g.groupNumber}. {g.groupName}
              </Link>
            ))}
          </div>
        )}
      </div>
      )}

      {/* TABLA 1: TABLA PERUANA DE COMPOSICIÓN DE ALIMENTOS (TPCA) */}
      {tab === "tpca" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-emerald-50/50 border-b border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-600">
              Mostrando alimentos en <strong>100 gramos de parte comestible</strong> según la <em>Tabla Peruana de Composición de Alimentos (CENAN/INS)</em>.
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-800">
              Total encontrados: {tpcaTotal}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Cód</th>
                  <th className="px-4 py-3.5">Alimento Peruano</th>
                  <th className="px-4 py-3.5">Grupo</th>
                  <th className="px-4 py-3.5 text-right">Energía (kcal)</th>
                  <th className="px-4 py-3.5 text-right">Proteína (g)</th>
                  <th className="px-4 py-3.5 text-right">Grasa (g)</th>
                  <th className="px-4 py-3.5 text-right">Carbos (g)</th>
                  <th className="px-4 py-3.5 text-right font-bold text-red-700 bg-red-50/40">Hierro (mg)</th>
                  <th className="px-4 py-3.5 text-right">Calcio (mg)</th>
                  <th className="px-4 py-3.5 text-right">Zinc (mg)</th>
                  <th className="px-4 py-3.5 text-right">Vit C (mg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tpcaFoods.map((food) => (
                  <tr key={food.id} className="hover:bg-slate-50/80 transition text-xs">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-500">
                      {food.code}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 text-sm">
                      {food.name}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">
                        {food.groupName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {food.energyKcal}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">
                      {food.proteinG}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {food.fatG}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {food.carbsG}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-700 bg-red-50/40">
                      {food.ironMg !== null ? `${food.ironMg} mg` : "--"}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {food.calciumMg !== null ? food.calciumMg : "--"}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {food.zincMg !== null ? food.zincMg : "--"}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {food.vitaminCMg !== null ? food.vitaminCMg : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {tpcaTotal > pageSize && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <div>
                Página {currentPage} de {Math.ceil(tpcaTotal / pageSize)}
              </div>
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/alimentos?tab=tpca&group=${group}&page=${currentPage - 1}${q ? `&q=${q}` : ""}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    Anterior
                  </Link>
                )}
                {currentPage * pageSize < tpcaTotal && (
                  <Link
                    href={`/alimentos?tab=tpca&group=${group}&page=${currentPage + 1}${q ? `&q=${q}` : ""}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    Siguiente
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TABLA 2: TAFERA 2016 VF (MEDIDAS CASERAS Y PORCIONES) */}
      {tab === "tafera" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-emerald-50/50 border-b border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-600">
              Valores calculados según <strong>unidad de consumo / medida casera</strong> y peso neto reportado en la <em>TAFERA 2016 VF (CENAN/INS)</em>.
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-800">
              Total porciones: {taferaTotal}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Cód</th>
                  <th className="px-4 py-3.5">Alimento</th>
                  <th className="px-4 py-3.5">Unidad de Consumo / Medida Casera</th>
                  <th className="px-4 py-3.5 text-right">Peso Neto (g)</th>
                  <th className="px-4 py-3.5 text-right">% Comestible</th>
                  <th className="px-4 py-3.5 text-right font-bold text-slate-900">Energía (kcal)</th>
                  <th className="px-4 py-3.5 text-right">Prot (g)</th>
                  <th className="px-4 py-3.5 text-right">Grasa (g)</th>
                  <th className="px-4 py-3.5 text-right">Carbos (g)</th>
                  <th className="px-4 py-3.5 text-right font-bold text-red-700 bg-red-50/40">Hierro (mg)</th>
                  <th className="px-4 py-3.5 text-right">Calcio (mg)</th>
                  <th className="px-4 py-3.5 text-right">Zinc (mg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {taferaPortions.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition text-xs">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-500">
                      {p.code}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 text-sm">
                      {p.foodName}
                      <span className="block text-xs font-normal text-slate-400">
                        {p.groupName}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-emerald-800 bg-emerald-50/20">
                      {p.householdMeasure}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {p.netWeightG} g
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      {p.ediblePercentage ? `${p.ediblePercentage}%` : "--"}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {p.energyKcal}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">
                      {p.proteinG}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {p.fatG}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {p.carbsG}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-700 bg-red-50/40">
                      {p.ironMg !== null ? `${p.ironMg} mg` : "--"}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {p.calciumMg !== null ? p.calciumMg : "--"}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {p.zincMg !== null ? p.zincMg : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {taferaTotal > pageSize && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <div>
                Página {currentPage} de {Math.ceil(taferaTotal / pageSize)}
              </div>
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/alimentos?tab=tafera&group=${group}&page=${currentPage - 1}${q ? `&q=${q}` : ""}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    Anterior
                  </Link>
                )}
                {currentPage * pageSize < taferaTotal && (
                  <Link
                    href={`/alimentos?tab=tafera&group=${group}&page=${currentPage + 1}${q ? `&q=${q}` : ""}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    Siguiente
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TABLA 3: FACTORES DE CONVERSIÓN COCIDO A CRUDO (FC TAFERA MÓDULO II) */}
      {tab === "fc" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-emerald-50/50 border-b border-slate-200">
            <div className="text-xs text-slate-700 font-medium">
              Factor de Conversión (FC): Permite calcular el peso en crudo necesario a partir del peso del alimento cocido prescrito en la dieta.
              <br />
              <strong>Fórmula: Peso Crudo (g) = Peso Cocido (g) × Factor de Conversión (FC)</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Grupo</th>
                  <th className="px-6 py-3.5">Alimento</th>
                  <th className="px-6 py-3.5">Método / Tipo de Cocción</th>
                  <th className="px-6 py-3.5 text-right font-bold text-emerald-800">Factor de Conversión (FC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {conversionFactors.map((fc) => (
                  <tr key={fc.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-3 text-xs text-slate-500 font-medium">
                      {fc.groupName}
                    </td>
                    <td className="px-6 py-3 font-semibold text-slate-900 text-sm">
                      {fc.foodName}
                    </td>
                    <td className="px-6 py-3 text-xs text-emerald-700 font-medium">
                      {fc.cookingType}
                    </td>
                    <td className="px-6 py-3 text-right font-bold font-mono text-emerald-800 text-base">
                      {fc.factor.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLA 4: SMAE */}
      {tab === "smae" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Alimento</th>
                  <th className="px-6 py-3.5">Categoría</th>
                  <th className="px-6 py-3.5">Porción</th>
                  <th className="px-6 py-3.5 text-right">Calorías (kcal)</th>
                  <th className="px-6 py-3.5 text-right">Proteína (g)</th>
                  <th className="px-6 py-3.5 text-right">Carbos (g)</th>
                  <th className="px-6 py-3.5 text-right">Grasa (g)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {smaeFoods.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-3 font-semibold text-slate-900">{f.name}</td>
                    <td className="px-6 py-3 text-xs text-slate-500">{f.category}</td>
                    <td className="px-6 py-3 text-xs text-slate-600">{f.servingSize}</td>
                    <td className="px-6 py-3 text-right font-bold text-slate-900">{f.caloriesKcal}</td>
                    <td className="px-6 py-3 text-right text-red-600 font-medium">{f.proteinG}g</td>
                    <td className="px-6 py-3 text-right text-emerald-600 font-medium">{f.carbsG}g</td>
                    <td className="px-6 py-3 text-right text-amber-600 font-medium">{f.fatG}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLA 5: EQUIVALENCIAS SUGERIDAS E INTERCAMBIOS (10g CHO = x g Papa, Camote, Pan) */}
      {tab === "equivalencias" && (
        <SuggestedEquivalencesTable />
      )}

      {/* SECCIÓN 6: DOCUMENTO OFICIAL TAFERA PDF Y RESPALDO LOCAL */}
      {tab === "pdf" && (
        <TaferaPdfViewer />
      )}
    </div>
  );
}
