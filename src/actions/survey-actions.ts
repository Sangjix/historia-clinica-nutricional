"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export interface SurveyFormData {
  allergies: string[];
  otherAllergies?: string;
  favoriteFoods?: string;
  dislikedFoods?: string;
  dietType?: string;
  cookingHabits?: string;
  diningOut?: string;
  waterIntake?: string;
  physicalActivity?: string;
  breakfastTime?: string;
  morningSnack?: string;
  lunchTime?: string;
  afternoonSnack?: string;
  dinnerTime?: string;
  additionalNotes?: string;
}

/**
 * Obtiene o genera la encuesta y el token único para un paciente
 */
export async function getOrCreatePatientSurvey(patientId: string) {
  let survey = await db.patientPreferenceSurvey.findUnique({
    where: { patientId },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
    },
  });

  if (!survey) {
    const token = crypto.randomBytes(12).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 días de vigencia

    survey = await db.patientPreferenceSurvey.create({
      data: {
        patientId,
        token,
        expiresAt,
        status: "PENDING",
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }

  return survey;
}

/**
 * Obtiene los datos públicos del formulario a partir del token (vista del paciente)
 */
export async function getPublicSurvey(token: string) {
  const survey = await db.patientPreferenceSurvey.findUnique({
    where: { token },
    include: {
      patient: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!survey) {
    return null;
  }

  return survey;
}

/**
 * Guarda las respuestas completadas por el paciente desde el link público
 */
export async function submitPublicSurvey(token: string, data: SurveyFormData) {
  const existing = await db.patientPreferenceSurvey.findUnique({
    where: { token },
  });

  if (!existing) {
    throw new Error("Formulario no encontrado o token inválido.");
  }

  const updated = await db.patientPreferenceSurvey.update({
    where: { token },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      allergiesJson: JSON.stringify(data.allergies || []),
      otherAllergies: data.otherAllergies || null,
      favoriteFoods: data.favoriteFoods || null,
      dislikedFoods: data.dislikedFoods || null,
      dietType: data.dietType || "OMNIVORE",
      cookingHabits: data.cookingHabits || null,
      diningOut: data.diningOut || null,
      waterIntake: data.waterIntake || null,
      physicalActivity: data.physicalActivity || null,
      breakfastTime: data.breakfastTime || null,
      morningSnack: data.morningSnack || null,
      lunchTime: data.lunchTime || null,
      afternoonSnack: data.afternoonSnack || null,
      dinnerTime: data.dinnerTime || null,
      additionalNotes: data.additionalNotes || null,
    },
  });

  revalidatePath(`/pacientes/${existing.patientId}`);
  return { success: true, surveyId: updated.id };
}

/**
 * Permite al profesional de nutrición editar o cargar directamente las preferencias en consulta
 */
export async function updatePatientSurveyByNutritionist(patientId: string, data: SurveyFormData) {
  const existing = await db.patientPreferenceSurvey.findUnique({
    where: { patientId },
  });

  let survey;
  if (!existing) {
    const token = crypto.randomBytes(12).toString("hex");
    survey = await db.patientPreferenceSurvey.create({
      data: {
        patientId,
        token,
        status: "COMPLETED",
        completedAt: new Date(),
        allergiesJson: JSON.stringify(data.allergies || []),
        otherAllergies: data.otherAllergies || null,
        favoriteFoods: data.favoriteFoods || null,
        dislikedFoods: data.dislikedFoods || null,
        dietType: data.dietType || "OMNIVORE",
        cookingHabits: data.cookingHabits || null,
        diningOut: data.diningOut || null,
        waterIntake: data.waterIntake || null,
        physicalActivity: data.physicalActivity || null,
        breakfastTime: data.breakfastTime || null,
        morningSnack: data.morningSnack || null,
        lunchTime: data.lunchTime || null,
        afternoonSnack: data.afternoonSnack || null,
        dinnerTime: data.dinnerTime || null,
        additionalNotes: data.additionalNotes || null,
      },
    });
  } else {
    survey = await db.patientPreferenceSurvey.update({
      where: { patientId },
      data: {
        status: "COMPLETED",
        completedAt: existing.completedAt || new Date(),
        allergiesJson: JSON.stringify(data.allergies || []),
        otherAllergies: data.otherAllergies || null,
        favoriteFoods: data.favoriteFoods || null,
        dislikedFoods: data.dislikedFoods || null,
        dietType: data.dietType || "OMNIVORE",
        cookingHabits: data.cookingHabits || null,
        diningOut: data.diningOut || null,
        waterIntake: data.waterIntake || null,
        physicalActivity: data.physicalActivity || null,
        breakfastTime: data.breakfastTime || null,
        morningSnack: data.morningSnack || null,
        lunchTime: data.lunchTime || null,
        afternoonSnack: data.afternoonSnack || null,
        dinnerTime: data.dinnerTime || null,
        additionalNotes: data.additionalNotes || null,
      },
    });
  }

  revalidatePath(`/pacientes/${patientId}`);
  return { success: true, survey };
}
