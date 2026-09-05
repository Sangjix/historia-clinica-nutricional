"use client";

import { useState } from "react";
import { Scale, Calculator, ArrowRight, Check, Sparkles, Utensils } from "lucide-react";

interface FoodEquivalenceRule {
  id: string;
  name: string;
  category: "CARBOHIDRATO" | "PROTEINA" | "GRASA" | "FRUTA" | "VERDURA";
  nutrientPer100g: number; // g de CHO, Prot o Grasa en 100g
  householdMeasureBase: string; // Medida casera para la porción base
  baseGrams: number; // Gramos de la medida casera base
  caloriesPer100g: number;
  secondaryInfo?: string;
}

// Catálogo maestro de alimentos de intercambio con composición TAFERA / TPCA
const EQUIVALENCE_CATALOG: Record<string, FoodEquivalenceRule[]> = {
  CHO: [
    {
      id: "papa-blanca",
      name: "Papa blanca cocida (Canchan / Tomasa)",
      category: "CARBOHIDRATO",
      nutrientPer100g: 19.5, // 19.5g CHO / 100g
      householdMeasureBase: "1 unidad pequeña (100g) = 19.5g CHO",
      baseGrams: 100,
      caloriesPer100g: 86,
      secondaryInfo: "Bajo en grasa, alta saciedad",
    },
    {
      id: "papa-amarilla",
      name: "Papa amarilla cocida",
      category: "CARBOHIDRATO",
      nutrientPer100g: 21.0, // 21g CHO / 100g
      householdMeasureBase: "1/2 unidad mediana (50g) = 10.5g CHO",
      baseGrams: 50,
      caloriesPer100g: 101,
      secondaryInfo: "Aporta carotenos y textura cremosa",
    },
    {
      id: "camote-amarillo",
      name: "Camote amarillo cocido",
      category: "CARBOHIDRATO",
      nutrientPer100g: 24.0, // 24g CHO / 100g
      householdMeasureBase: "1/3 unidad mediana o 1 rodaja gruesa (45g) = 10.8g CHO",
      baseGrams: 45,
      caloriesPer100g: 110,
      secondaryInfo: "Rico en betacarotenos (Pro-vitamina A) y fibra",
    },
    {
      id: "pan-frances",
      name: "Pan francés tradicional peruano",
      category: "CARBOHIDRATO",
      nutrientPer100g: 58.0, // 58g CHO / 100g
      householdMeasureBase: "1/2 unidad (18g) = 10.4g CHO | 1 unidad entera (35g) = 20.3g CHO",
      baseGrams: 18,
      caloriesPer100g: 275,
      secondaryInfo: "Almidón de rápida asimilación",
    },
    {
      id: "arroz-cocido",
      name: "Arroz blanco graneado / cocido",
      category: "CARBOHIDRATO",
      nutrientPer100g: 26.0, // 26g CHO / 100g
      householdMeasureBase: "2 cucharadas soperas colmadas (40g) = 10.4g CHO | 1/2 taza (100g) = 26g CHO",
      baseGrams: 40,
      caloriesPer100g: 120,
      secondaryInfo: "Base de la gastronomía peruana",
    },
    {
      id: "quinua-cocida",
      name: "Quinua blanca perlada cocida",
      category: "CARBOHIDRATO",
      nutrientPer100g: 22.0, // 22g CHO / 100g
      householdMeasureBase: "2.5 cucharadas colmadas (45g) = 10.0g CHO | 1/2 taza (100g) = 22g CHO",
      baseGrams: 45,
      caloriesPer100g: 115,
      secondaryInfo: "Proteína vegetal completa con todos los aminoácidos esenciales",
    },
    {
      id: "avena-cruda",
      name: "Avena en hojuelas cruda",
      category: "CARBOHIDRATO",
      nutrientPer100g: 66.0, // 66g CHO / 100g
      householdMeasureBase: "1.5 cucharadas soperas (15g) = 9.9g CHO | 1/3 taza (30g) = 19.8g CHO",
      baseGrams: 15,
      caloriesPer100g: 375,
      secondaryInfo: "Rica en betaglucanos (fibra soluble cardioprotectora)",
    },
    {
      id: "fideos-cocidos",
      name: "Fideos tallarín / canuto cocido",
      category: "CARBOHIDRATO",
      nutrientPer100g: 25.0, // 25g CHO / 100g
      householdMeasureBase: "2 cucharadas colmadas (40g) = 10.0g CHO | 1/2 taza (100g) = 25g CHO",
      baseGrams: 40,
      caloriesPer100g: 130,
      secondaryInfo: "Bajo en fibra si es refinado",
    },
    {
      id: "yuca-cocida",
      name: "Yuca cocida / sancochada",
      category: "CARBOHIDRATO",
      nutrientPer100g: 32.0, // 32g CHO / 100g
      householdMeasureBase: "1 trozo pequeño (32g) = 10.2g CHO | 1 trozo mediano (80g) = 25.6g CHO",
      baseGrams: 32,
      caloriesPer100g: 145,
      secondaryInfo: "Alta densidad energética y almidón resistente",
    },
    {
      id: "choclo-cocido",
      name: "Choclo desgranado cocido",
      category: "CARBOHIDRATO",
      nutrientPer100g: 21.0, // 21g CHO / 100g
      householdMeasureBase: "3 cucharadas soperas colmadas (48g) = 10.1g CHO | 1/2 taza (100g) = 21g CHO",
      baseGrams: 48,
      caloriesPer100g: 105,
      secondaryInfo: "Aporta fibra insoluble y fósforo",
    },
    {
      id: "platano-seda",
      name: "Plátano de seda (parte comestible)",
      category: "CARBOHIDRATO",
      nutrientPer100g: 22.0,
      householdMeasureBase: "1/2 unidad pequeña (45g) = 9.9g CHO | 1 unidad mediana (100g) = 22g CHO",
      baseGrams: 45,
      caloriesPer100g: 95,
      secondaryInfo: "Rico en potasio y fructosa natural",
    },
  ],
  PROT: [
    {
      id: "pechuga-pollo",
      name: "Pechuga de pollo a la plancha / sancochada",
      category: "PROTEINA",
      nutrientPer100g: 31.0, // 31g Prot / 100g
      householdMeasureBase: "1 trozo pequeño o 2 cucharadas deshilachadas (32g) = 10.0g Prot",
      baseGrams: 32,
      caloriesPer100g: 165,
      secondaryInfo: "Proteína magra de máxima biodisponibilidad",
    },
    {
      id: "sangrecita-pollo",
      name: "Sangrecita de pollo cocida",
      category: "PROTEINA",
      nutrientPer100g: 16.0, // 16g Prot / 100g
      householdMeasureBase: "3 cucharadas soperas colmadas (62g) = 10.0g Prot | ¡Aporta 18mg de Hierro!",
      baseGrams: 62,
      caloriesPer100g: 89,
      secondaryInfo: "⭐ Alimento estrella peruano contra la anemia (Hierro hemo)",
    },
    {
      id: "pescado-bonito",
      name: "Pescado bonito cocido / plancha",
      category: "PROTEINA",
      nutrientPer100g: 24.0, // 24g Prot / 100g
      householdMeasureBase: "1 trozo pequeño (42g) = 10.1g Prot | 1 filete mediano (100g) = 24g Prot",
      baseGrams: 42,
      caloriesPer100g: 138,
      secondaryInfo: "Pescado azul rico en ácidos grasos Omega-3 (EPA/DHA)",
    },
    {
      id: "huevo-entero",
      name: "Huevo de gallina entero cocido (sancochado)",
      category: "PROTEINA",
      nutrientPer100g: 12.5, // 12.5g Prot / 100g
      householdMeasureBase: "1.5 unidades medianas (80g) = 10.0g Prot | 1 unidad entera (55g) = 6.9g Prot",
      baseGrams: 80,
      caloriesPer100g: 155,
      secondaryInfo: "Patrón de referencia internacional de aminoácidos",
    },
    {
      id: "clara-huevo",
      name: "Clara de huevo sancochada",
      category: "PROTEINA",
      nutrientPer100g: 11.0, // 11g Prot / 100g
      householdMeasureBase: "3 claras de huevo (90g) = 10.0g Prot",
      baseGrams: 90,
      caloriesPer100g: 48,
      secondaryInfo: "0% grasa y colesterol, pura albúmina",
    },
    {
      id: "queso-fresco",
      name: "Queso fresco de vaca pasteurizado",
      category: "PROTEINA",
      nutrientPer100g: 18.0, // 18g Prot / 100g
      householdMeasureBase: "1 tajada y media mediana (55g) = 10.0g Prot",
      baseGrams: 55,
      caloriesPer100g: 215,
      secondaryInfo: "Aporte de calcio y fósforo lácteo",
    },
    {
      id: "carne-res",
      name: "Carne de res pulpa magra cocida",
      category: "PROTEINA",
      nutrientPer100g: 28.0, // 28g Prot / 100g
      householdMeasureBase: "1 trozo pequeño (36g) = 10.0g Prot | 1 filete mediano (100g) = 28g Prot",
      baseGrams: 36,
      caloriesPer100g: 180,
      secondaryInfo: "Fuente de zinc, vitamina B12 y hierro hemo",
    },
    {
      id: "higado-pollo",
      name: "Hígado de pollo sancochado",
      category: "PROTEINA",
      nutrientPer100g: 22.0,
      householdMeasureBase: "1 unidad y media (45g) = 10.0g Prot | 3.5mg Hierro hemo",
      baseGrams: 45,
      caloriesPer100g: 125,
      secondaryInfo: "Alta concentración de vitamina A y folatos",
    },
  ],
  FAT: [
    {
      id: "aceite-oliva",
      name: "Aceite de oliva virgen extra / vegetal",
      category: "GRASA",
      nutrientPer100g: 100.0, // 100g Grasa / 100g
      householdMeasureBase: "1 cucharadita (5ml / 5g) = 5.0g Grasa (45 kcal)",
      baseGrams: 5,
      caloriesPer100g: 900,
      secondaryInfo: "Grasa monoinsaturada cardiosaludable pura",
    },
    {
      id: "palta-fuerte",
      name: "Palta / Aguacate fuerte o hass",
      category: "GRASA",
      nutrientPer100g: 15.0, // 15g Grasa / 100g
      householdMeasureBase: "2 cucharadas soperas o 1/4 unidad pequeña (33g) = 5.0g Grasa",
      baseGrams: 33,
      caloriesPer100g: 160,
      secondaryInfo: "Fibra prebiótica, potasio y antioxidantes",
    },
    {
      id: "aceituna-botija",
      name: "Aceituna de botija negra peruana",
      category: "GRASA",
      nutrientPer100g: 13.5, // 13.5g Grasa / 100g
      householdMeasureBase: "4 a 5 unidades medianas (37g) = 5.0g Grasa",
      baseGrams: 37,
      caloriesPer100g: 145,
      secondaryInfo: "Tradicional en la costa peruana",
    },
    {
      id: "mani-tostado",
      name: "Maní tostado sin sal",
      category: "GRASA",
      nutrientPer100g: 49.0, // 49g Grasa / 100g
      householdMeasureBase: "1 cucharada colmada o 1 puñado chico (10g) = 4.9g Grasa (60 kcal)",
      baseGrams: 10,
      caloriesPer100g: 585,
      secondaryInfo: "Aporta además 2.5g de proteína vegetal",
    },
    {
      id: "nueces-almendras",
      name: "Nueces / Almendras picadas",
      category: "GRASA",
      nutrientPer100g: 54.0,
      householdMeasureBase: "5 a 6 unidades (10g) = 5.4g Grasa",
      baseGrams: 10,
      caloriesPer100g: 610,
      secondaryInfo: "Ácidos grasos esenciales Omega-3 y vitamina E",
    },
  ],
};

export default function SuggestedEquivalencesTable() {
  const [selectedMacro, setSelectedMacro] = useState<"CHO" | "PROT" | "FAT">("CHO");
  const [targetGrams, setTargetGrams] = useState<number>(10); // Valor de ejemplo: 10g de CHO

  const activeRules = EQUIVALENCE_CATALOG[selectedMacro] || [];

  const macroLabels = {
    CHO: { name: "Carbohidratos (CHO)", unit: "g de CHO", default: 10, color: "emerald" },
    PROT: { name: "Proteínas", unit: "g de Proteína", default: 10, color: "red" },
    FAT: { name: "Grasas", unit: "g de Grasa", default: 5, color: "amber" },
  };

  const handleMacroChange = (macro: "CHO" | "PROT" | "FAT") => {
    setSelectedMacro(macro);
    setTargetGrams(macroLabels[macro].default);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-lg">
              Tabla de Equivalencias de Alimentos Sugeridos y Medidas Caseras
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calcula exactamente a cuántos gramos y qué medida casera equivale cualquier cantidad de nutriente (ej. <strong>10 g de CHO = x g de papa, camote o pan</strong>).
          </p>
        </div>

        {/* Botones de Selección Rápida de Macro */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => handleMacroChange("CHO")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedMacro === "CHO"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Carbohidratos (CHO)
          </button>
          <button
            onClick={() => handleMacroChange("PROT")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedMacro === "PROT"
                ? "bg-red-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Proteínas
          </button>
          <button
            onClick={() => handleMacroChange("FAT")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedMacro === "FAT"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Grasas
          </button>
        </div>
      </div>

      {/* Barra Interactiva de Cálculo de Equivalencias Dinámicas */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
              Regla de Equivalencia Activa
            </span>
            <div className="text-sm text-slate-800 font-semibold flex items-center gap-2 mt-0.5">
              <span>Calcular para:</span>
              <input
                type="number"
                min="1"
                max="200"
                step="1"
                value={targetGrams}
                onChange={(e) => setTargetGrams(Math.max(1, Number(e.target.value)))}
                className="w-16 px-2 py-0.5 bg-white border border-emerald-300 rounded font-bold text-emerald-800 text-center outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-emerald-800 font-bold">{macroLabels[selectedMacro].unit}</span>
            </div>
          </div>
        </div>

        {/* Accesos rápidos a porciones estándar */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-medium">Valores típicos:</span>
          {selectedMacro === "CHO" && (
            <>
              <button
                onClick={() => setTargetGrams(10)}
                className={`px-2.5 py-1 rounded-md font-semibold border ${
                  targetGrams === 10
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                10g CHO
              </button>
              <button
                onClick={() => setTargetGrams(15)}
                className={`px-2.5 py-1 rounded-md font-semibold border ${
                  targetGrams === 15
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                15g CHO (1 Porción)
              </button>
              <button
                onClick={() => setTargetGrams(20)}
                className={`px-2.5 py-1 rounded-md font-semibold border ${
                  targetGrams === 20
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                20g CHO
              </button>
              <button
                onClick={() => setTargetGrams(30)}
                className={`px-2.5 py-1 rounded-md font-semibold border ${
                  targetGrams === 30
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                30g CHO (2 Porciones)
              </button>
            </>
          )}

          {selectedMacro === "PROT" && (
            <>
              <button
                onClick={() => setTargetGrams(7)}
                className={`px-2.5 py-1 rounded-md font-semibold border ${
                  targetGrams === 7
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                7g Prot (1 Porción)
              </button>
              <button
                onClick={() => setTargetGrams(10)}
                className={`px-2.5 py-1 rounded-md font-semibold border ${
                  targetGrams === 10
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                10g Prot
              </button>
              <button
                onClick={() => setTargetGrams(20)}
                className={`px-2.5 py-1 rounded-md font-semibold border ${
                  targetGrams === 20
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                20g Prot
              </button>
              <button
                onClick={() => setTargetGrams(30)}
                className={`px-2.5 py-1 rounded-md font-semibold border ${
                  targetGrams === 30
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                30g Prot
              </button>
            </>
          )}

          {selectedMacro === "FAT" && (
            <>
              <button
                onClick={() => setTargetGrams(5)}
                className={`px-2.5 py-1 rounded-md font-semibold border ${
                  targetGrams === 5
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                5g Grasa (1 Porción)
              </button>
              <button
                onClick={() => setTargetGrams(10)}
                className={`px-2.5 py-1 rounded-md font-semibold border ${
                  targetGrams === 10
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                10g Grasa
              </button>
              <button
                onClick={() => setTargetGrams(15)}
                className={`px-2.5 py-1 rounded-md font-semibold border ${
                  targetGrams === 15
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                15g Grasa
              </button>
            </>
          )}
        </div>
      </div>

      {/* TABLA PRINCIPAL DE EQUIVALENCIAS SUGERIDAS */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5">Alimento Sugerido</th>
              <th className="px-5 py-3.5 text-center font-bold text-emerald-800 bg-emerald-50/50">
                Gramos Requeridos ({targetGrams}g {selectedMacro})
              </th>
              <th className="px-5 py-3.5 font-bold text-slate-800">
                Medida Casera Sugerida (TAFERA)
              </th>
              <th className="px-5 py-3.5 text-right">Calorías Totales</th>
              <th className="px-5 py-3.5">Propiedades Nutricionales</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeRules.map((food) => {
              // Cálculo exacto: Gramos = (targetGrams / nutrientPer100g) * 100
              const calculatedGrams = parseFloat(
                ((targetGrams / food.nutrientPer100g) * 100).toFixed(1)
              );
              const calculatedCalories = Math.round(
                (calculatedGrams * food.caloriesPer100g) / 100
              );

              // Proporción de la medida casera base
              const ratio = calculatedGrams / food.baseGrams;
              let approximateMeasureText = "";

              if (ratio >= 0.85 && ratio <= 1.15) {
                approximateMeasureText = food.householdMeasureBase.split("=")[0].trim();
              } else if (ratio >= 1.8 && ratio <= 2.2) {
                approximateMeasureText = `Doble porción (~${Math.round(calculatedGrams)}g)`;
              } else if (ratio >= 0.4 && ratio <= 0.6) {
                approximateMeasureText = `Mitad de porción (~${Math.round(calculatedGrams)}g)`;
              } else {
                approximateMeasureText = `${calculatedGrams} g en peso neto comestible`;
              }

              return (
                <tr key={food.id} className="hover:bg-slate-50/80 transition text-xs">
                  <td className="px-5 py-3.5 font-bold text-slate-900 text-sm">
                    {food.name}
                  </td>
                  <td className="px-5 py-3.5 text-center font-bold text-emerald-800 bg-emerald-50/30 text-base font-mono">
                    {calculatedGrams} g
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">
                    <span className="inline-block px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {food.householdMeasureBase}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900 text-sm">
                    {calculatedCalories} kcal
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 italic">
                    {food.secondaryInfo}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cuadro Clínico de Resumen de Intercambios */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
        <span className="font-bold text-slate-800 block uppercase">
          💡 Nota para la Prescripción Dietoterapéutica:
        </span>
        <p>
          En la formulación de planes de alimentación, <strong>todos los alimentos de la tabla anterior aportan exactamente {targetGrams} g de {macroLabels[selectedMacro].name}</strong>. Por lo tanto, el paciente puede sustituir libremente cualquiera de estas opciones sin alterar el balance energético de su menú.
        </p>
        <p className="text-slate-500 font-mono">
          Ejemplo: Si la pauta indica 10 g de CHO, el paciente puede consumir <strong>51g de papa blanca</strong>, <strong>48g de papa amarilla</strong>, <strong>42g de camote</strong>, <strong>17g de pan francés</strong> o <strong>38g de arroz cocido</strong>.
        </p>
      </div>
    </div>
  );
}
