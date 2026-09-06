import { db } from "@/lib/db";
import ClinicalSupplementCalculator from "@/components/clinical/ClinicalSupplementCalculator";

export const revalidate = 0;

export default async function SuplementosPage() {
  const supplements = await db.clinicalSupplement.findMany({
    orderBy: {
      category: "asc",
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Soporte Nutricional Clínico & Vademécum
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Calculadora de fórmulas enterales y módulos proteicos, alertas de seguridad (osmolaridad/fósforo/potasio) y protocolo automatizado de Síndrome de Realimentación (NICE/ASPEN).
        </p>
      </div>

      <ClinicalSupplementCalculator supplements={supplements} />
    </div>
  );
}
