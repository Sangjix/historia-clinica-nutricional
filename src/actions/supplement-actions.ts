"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createSupplement(formData: FormData) {
  const name = formData.get("name") as string;
  const brand = (formData.get("brand") as string) || null;
  const rawCode = (formData.get("code") as string) || "";
  const code = rawCode.trim() || `SUP-${Date.now().toString().slice(-6)}`;
  const category = (formData.get("category") as string) || "ENTERAL_STANDARD";
  const presentation = (formData.get("presentation") as string) || "LIQUIDO";
  const servingSize = (formData.get("servingSize") as string) || "100 ml";
  const administrationRoute = (formData.get("administrationRoute") as string) || "BOTH";

  const kcalPer100gOrMl = parseFloat((formData.get("kcalPer100gOrMl") as string) || "0");
  const proteinGPer100 = parseFloat((formData.get("proteinGPer100") as string) || "0");
  const carbsGPer100 = parseFloat((formData.get("carbsGPer100") as string) || "0");
  const fatGPer100 = parseFloat((formData.get("fatGPer100") as string) || "0");
  const fiberGPer100 = formData.get("fiberGPer100")
    ? parseFloat(formData.get("fiberGPer100") as string)
    : null;

  const osmolarityMOsmL = formData.get("osmolarityMOsmL")
    ? parseFloat(formData.get("osmolarityMOsmL") as string)
    : null;
  const sodiumMgPer100 = formData.get("sodiumMgPer100")
    ? parseFloat(formData.get("sodiumMgPer100") as string)
    : null;
  const potassiumMgPer100 = formData.get("potassiumMgPer100")
    ? parseFloat(formData.get("potassiumMgPer100") as string)
    : null;
  const phosphorusMgPer100 = formData.get("phosphorusMgPer100")
    ? parseFloat(formData.get("phosphorusMgPer100") as string)
    : null;
  const calciumMgPer100 = formData.get("calciumMgPer100")
    ? parseFloat(formData.get("calciumMgPer100") as string)
    : null;

  const indications = (formData.get("indications") as string) || null;
  const contraindications = (formData.get("contraindications") as string) || null;

  if (!name || isNaN(kcalPer100gOrMl)) {
    throw new Error("El nombre y el aporte calórico son obligatorios.");
  }

  // Verificar si ya existe el código
  const existing = await db.clinicalSupplement.findUnique({
    where: { code },
  });

  const finalCode = existing ? `${code}-${Math.floor(Math.random() * 1000)}` : code;

  const supplement = await db.clinicalSupplement.create({
    data: {
      code: finalCode,
      name,
      brand,
      category,
      presentation,
      servingSize,
      administrationRoute,
      kcalPer100gOrMl,
      proteinGPer100,
      carbsGPer100,
      fatGPer100,
      fiberGPer100,
      osmolarityMOsmL,
      sodiumMgPer100,
      potassiumMgPer100,
      phosphorusMgPer100,
      calciumMgPer100,
      indications,
      contraindications,
    },
  });

  try {
    revalidatePath("/suplementos");
  } catch {
    // Modo standalone / script fuera de request context
  }
  return supplement;
}
