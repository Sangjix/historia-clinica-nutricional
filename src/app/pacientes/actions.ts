"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calculateBMI } from "@/lib/formulas/body-composition";

export async function createPatient(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const recordNumber = formData.get("recordNumber") as string;
  const birthDateStr = formData.get("birthDate") as string;
  const gender = formData.get("gender") as string;
  const documentId = (formData.get("documentId") as string) || null;
  const phone = (formData.get("phone") as string) || null;
  const email = (formData.get("email") as string) || null;
  const occupation = (formData.get("occupation") as string) || null;
  const city = (formData.get("city") as string) || null;
  const emergencyNotes = (formData.get("emergencyNotes") as string) || null;

  // Consulta inicial opcional
  const initialReason = formData.get("initialReason") as string;
  const initialWeightStr = formData.get("initialWeight") as string;
  const initialHeightStr = formData.get("initialHeight") as string;

  if (!firstName || !lastName || !recordNumber || !birthDateStr || !gender) {
    throw new Error("Campos obligatorios incompletos.");
  }

  const patient = await db.patient.create({
    data: {
      firstName,
      lastName,
      recordNumber,
      birthDate: new Date(birthDateStr),
      gender,
      documentId,
      phone,
      email,
      occupation,
      city,
      emergencyNotes,
    },
  });

  // Si se ingresó motivo y peso/talla, creamos la consulta inicial
  if (initialReason && initialWeightStr && initialHeightStr) {
    const weightKg = parseFloat(initialWeightStr);
    const heightCm = parseFloat(initialHeightStr);
    const bmiResult = calculateBMI(weightKg, heightCm);

    const consultation = await db.consultation.create({
      data: {
        patientId: patient.id,
        consultationNumber: 1,
        date: new Date(),
        reasonForVisit: initialReason,
      },
    });

    await db.anthropometryRecord.create({
      data: {
        consultationId: consultation.id,
        date: new Date(),
        weightKg,
        heightCm,
        bmi: bmiResult.bmi,
        bmiClassification: bmiResult.classification,
      },
    });
  }

  revalidatePath("/pacientes");
  revalidatePath("/");
  redirect(`/pacientes/${patient.id}`);
}
