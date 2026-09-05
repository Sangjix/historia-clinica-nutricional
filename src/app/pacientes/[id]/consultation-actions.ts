"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { calculateBMI, calculateFaulkner, calculateCompartments } from "@/lib/formulas/body-composition";

export async function addConsultation(patientId: string, formData: FormData) {
  const reasonForVisit = formData.get("reasonForVisit") as string;
  const nutritionalDiagnosisPES = (formData.get("nutritionalDiagnosisPES") as string) || null;
  const clinicalEvolutionNotes = (formData.get("clinicalEvolutionNotes") as string) || null;
  const nextAppointmentDateStr = formData.get("nextAppointmentDate") as string;

  // Antropometría
  const weightKgStr = formData.get("weightKg") as string;
  const heightCmStr = formData.get("heightCm") as string;
  const waistCmStr = formData.get("waistCm") as string;
  const hipCmStr = formData.get("hipCm") as string;

  // Pliegues (Faulkner 4)
  const tricepsMmStr = formData.get("tricepsFoldMm") as string;
  const subscapularMmStr = formData.get("subscapularFoldMm") as string;
  const suprailiacMmStr = formData.get("suprailiacFoldMm") as string;
  const abdominalMmStr = formData.get("abdominalFoldMm") as string;

  // Obtener número de consulta correlativo
  const previousConsultationsCount = await db.consultation.count({
    where: { patientId },
  });

  const consultation = await db.consultation.create({
    data: {
      patientId,
      consultationNumber: previousConsultationsCount + 1,
      date: new Date(),
      reasonForVisit,
      nutritionalDiagnosisPES,
      clinicalEvolutionNotes,
      nextAppointmentDate: nextAppointmentDateStr ? new Date(nextAppointmentDateStr) : null,
    },
  });

  if (weightKgStr && heightCmStr) {
    const weightKg = parseFloat(weightKgStr);
    const heightCm = parseFloat(heightCmStr);
    const bmiResult = calculateBMI(weightKg, heightCm);

    let bodyFatPercentage: number | null = null;
    let fatMassKg: number | null = null;
    let leanMassKg: number | null = null;
    let muscleMassKg: number | null = null;

    if (tricepsMmStr && subscapularMmStr && suprailiacMmStr && abdominalMmStr) {
      bodyFatPercentage = calculateFaulkner(
        parseFloat(tricepsMmStr),
        parseFloat(subscapularMmStr),
        parseFloat(suprailiacMmStr),
        parseFloat(abdominalMmStr)
      );
      const comp = calculateCompartments(weightKg, bodyFatPercentage);
      fatMassKg = comp.fatMassKg;
      leanMassKg = comp.leanMassKg;
      muscleMassKg = comp.muscleMassKg;
    }

    const waistCm = waistCmStr ? parseFloat(waistCmStr) : null;
    const hipCm = hipCmStr ? parseFloat(hipCmStr) : null;
    const waistHipRatio = waistCm && hipCm ? parseFloat((waistCm / hipCm).toFixed(2)) : null;
    const waistHeightRatio = waistCm ? parseFloat((waistCm / heightCm).toFixed(2)) : null;

    await db.anthropometryRecord.create({
      data: {
        consultationId: consultation.id,
        date: new Date(),
        weightKg,
        heightCm,
        bmi: bmiResult.bmi,
        bmiClassification: bmiResult.classification,
        waistCm,
        hipCm,
        waistHipRatio,
        waistHeightRatio,
        tricepsFoldMm: tricepsMmStr ? parseFloat(tricepsMmStr) : null,
        subscapularFoldMm: subscapularMmStr ? parseFloat(subscapularMmStr) : null,
        suprailiacFoldMm: suprailiacMmStr ? parseFloat(suprailiacMmStr) : null,
        abdominalFoldMm: abdominalMmStr ? parseFloat(abdominalMmStr) : null,
        bodyFatPercentage,
        fatMassKg,
        leanMassKg,
        muscleMassKg,
      },
    });
  }

  // Actualizar updated_at del paciente
  await db.patient.update({
    where: { id: patientId },
    data: { updatedAt: new Date() },
  });

  revalidatePath(`/pacientes/${patientId}`);
  revalidatePath("/pacientes");
  revalidatePath("/");
}

export async function updateConsultation(
  consultationId: string,
  patientId: string,
  formData: FormData
) {
  const reasonForVisit = formData.get("reasonForVisit") as string;
  const nutritionalDiagnosisPES = (formData.get("nutritionalDiagnosisPES") as string) || null;
  const clinicalEvolutionNotes = (formData.get("clinicalEvolutionNotes") as string) || null;
  const nextAppointmentDateStr = formData.get("nextAppointmentDate") as string;

  // Antropometría
  const weightKgStr = formData.get("weightKg") as string;
  const heightCmStr = formData.get("heightCm") as string;
  const waistCmStr = formData.get("waistCm") as string;
  const hipCmStr = formData.get("hipCm") as string;

  // Pliegues
  const tricepsMmStr = formData.get("tricepsFoldMm") as string;
  const subscapularMmStr = formData.get("subscapularFoldMm") as string;
  const suprailiacMmStr = formData.get("suprailiacFoldMm") as string;
  const abdominalMmStr = formData.get("abdominalFoldMm") as string;

  // Actualizar consulta
  await db.consultation.update({
    where: { id: consultationId },
    data: {
      reasonForVisit,
      nutritionalDiagnosisPES,
      clinicalEvolutionNotes,
      nextAppointmentDate: nextAppointmentDateStr ? new Date(nextAppointmentDateStr) : null,
    },
  });

  // Si hay datos de peso y talla, actualizar o crear el registro antropométrico
  if (weightKgStr && heightCmStr) {
    const weightKg = parseFloat(weightKgStr);
    const heightCm = parseFloat(heightCmStr);
    const bmiResult = calculateBMI(weightKg, heightCm);

    let bodyFatPercentage: number | null = null;
    let fatMassKg: number | null = null;
    let leanMassKg: number | null = null;
    let muscleMassKg: number | null = null;

    if (tricepsMmStr && subscapularMmStr && suprailiacMmStr && abdominalMmStr) {
      bodyFatPercentage = calculateFaulkner(
        parseFloat(tricepsMmStr),
        parseFloat(subscapularMmStr),
        parseFloat(suprailiacMmStr),
        parseFloat(abdominalMmStr)
      );
      const comp = calculateCompartments(weightKg, bodyFatPercentage);
      fatMassKg = comp.fatMassKg;
      leanMassKg = comp.leanMassKg;
      muscleMassKg = comp.muscleMassKg;
    }

    const waistCm = waistCmStr ? parseFloat(waistCmStr) : null;
    const hipCm = hipCmStr ? parseFloat(hipCmStr) : null;
    const waistHipRatio = waistCm && hipCm ? parseFloat((waistCm / hipCm).toFixed(2)) : null;
    const waistHeightRatio = waistCm ? parseFloat((waistCm / heightCm).toFixed(2)) : null;

    const anthropoData = {
      weightKg,
      heightCm,
      bmi: bmiResult.bmi,
      bmiClassification: bmiResult.classification,
      waistCm,
      hipCm,
      waistHipRatio,
      waistHeightRatio,
      tricepsFoldMm: tricepsMmStr ? parseFloat(tricepsMmStr) : null,
      subscapularFoldMm: subscapularMmStr ? parseFloat(subscapularMmStr) : null,
      suprailiacFoldMm: suprailiacMmStr ? parseFloat(suprailiacMmStr) : null,
      abdominalFoldMm: abdominalMmStr ? parseFloat(abdominalMmStr) : null,
      bodyFatPercentage,
      fatMassKg,
      leanMassKg,
      muscleMassKg,
    };

    const existingAnthropo = await db.anthropometryRecord.findUnique({
      where: { consultationId },
    });

    if (existingAnthropo) {
      await db.anthropometryRecord.update({
        where: { consultationId },
        data: anthropoData,
      });
    } else {
      await db.anthropometryRecord.create({
        data: {
          consultationId,
          date: new Date(),
          ...anthropoData,
        },
      });
    }
  }

  await db.patient.update({
    where: { id: patientId },
    data: { updatedAt: new Date() },
  });

  revalidatePath(`/pacientes/${patientId}`);
  revalidatePath("/pacientes");
  revalidatePath("/");
}
