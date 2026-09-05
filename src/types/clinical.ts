// Tipos de dominio clínico para el Sistema de Historia Clínica Nutricional

export type Gender = "MALE" | "FEMALE";

export interface Patient {
  id: string;
  recordNumber: string; // Número de expediente
  firstName: string;
  lastName: string;
  documentId?: string; // Cédula o DNI
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
  phone?: string;
  email?: string;
  occupation?: string;
  city?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Anamnesis {
  id: string;
  patientId: string;
  consultationId: string;
  // Motivo de consulta
  reasonForVisit: string;
  // Antecedentes Heredofamiliares
  familyHistory: {
    diabetes?: boolean;
    hypertension?: boolean;
    obesity?: boolean;
    dyslipidemia?: boolean;
    cancer?: boolean;
    cardiovascular?: boolean;
    otherNotes?: string;
  };
  // Antecedentes Personales Patológicos
  pathologicalHistory: {
    diagnosedDiseases?: string[];
    currentMedications?: string[];
    surgeries?: string[];
    gastrointestinalSymptoms?: string[]; // reflujo, gastritis, estreñimiento, distensión
  };
  // Alergias e intolerancias
  allergiesIntolerances: {
    allergies: string[];
    intolerances: string[];
    foodDislikes: string[];
    favoriteFoods: string[];
  };
  // Estilo de vida
  lifestyle: {
    sleepHours: number;
    stressLevel: "BAJO" | "MODERADO" | "ALTO";
    smoking: boolean;
    alcoholFrequency: "NUNCA" | "OCASIONAL" | "MODERADO" | "FRECUENTE";
    waterIntakeLiters: number;
    physicalActivity: {
      type: string;
      frequencyPerWeek: number;
      durationMinutes: number;
      intensity: "LEVE" | "MODERADA" | "INTENSA";
    };
  };
}

export interface AnthropometryRecord {
  id: string;
  patientId: string;
  consultationId: string;
  date: string;
  // Básicos
  weightKg: number;
  heightCm: number;
  // Índices calculados
  bmi: number;
  bmiClassification: string;
  idealWeightKg?: number;
  // Circunferencias / Perímetros (cm)
  waistCircumferenceCm?: number;
  hipCircumferenceCm?: number;
  armCircumferenceCm?: number;
  calfCircumferenceCm?: number;
  wristCircumferenceCm?: number;
  waistHipRatio?: number;
  waistHeightRatio?: number;
  // Pliegues cutáneos (mm)
  tricepsFoldMm?: number;
  subscapularFoldMm?: number;
  bicepsFoldMm?: number;
  suprailiacFoldMm?: number;
  abdominalFoldMm?: number;
  thighFoldMm?: number;
  calfFoldMm?: number;
  // Composición corporal calculada
  bodyFatPercentage?: number;
  fatMassKg?: number;
  leanMassKg?: number;
  muscleMassKg?: number;
  boneMassKg?: number;
  residualMassKg?: number;
  // Bioimpedancia (opcional si dispone de equipo)
  visceralFatLevel?: number;
  totalBodyWaterLiters?: number;
  extracellularWaterRatio?: number;
  phaseAngle?: number;
  // Somatotipo Heath-Carter
  somatotype?: {
    endomorphy: number;
    mesomorphy: number;
    ectomorphy: number;
    xCoord: number;
    yCoord: number;
    classification: string;
  };
}

export interface BiochemicalRecord {
  id: string;
  patientId: string;
  consultationId: string;
  date: string;
  fastingGlucoseMgDl?: number;
  glycatedHemoglobinHba1c?: number;
  totalCholesterolMgDl?: number;
  hdlCholesterolMgDl?: number;
  ldlCholesterolMgDl?: number;
  triglyceridesMgDl?: number;
  uricAcidMgDl?: number;
  creatinineMgDl?: number;
  hemoglobinGDl?: number;
  ferritinNgMl?: number;
  altU_L?: number;
  astU_L?: number;
  notes?: string;
}

export interface EnergyRequirement {
  formulaUsed: "MIFFLIN_ST_JEOR" | "HARRIS_BENEDICT" | "KATCH_MCARDLE" | "FAO_WHO" | "SCHOFIELD";
  bmrKcal: number; // Tasa metabólica basal / GEB
  activityFactor: number;
  activityKcal: number;
  thermicEffectFoodKcal: number; // ETA (normalmente 10%)
  injuryStressFactor?: number;
  totalDailyEnergyExpenditureKcal: number; // GET
  targetCaloriesKcal: number; // Objetivo calórico ajustado (déficit, superávit o mantenimiento)
  goal: "PERDIDA_GRASA" | "MANTENIMIENTO" | "HIPERTROFIA" | "RECOMPOSICION" | "CLINICO_ESPECIAL";
  // Distribución de macronutrientes
  macros: {
    protein: { grams: number; percentage: number; gramsPerKg: number; kcal: number };
    carbs: { grams: number; percentage: number; gramsPerKg: number; kcal: number };
    fat: { grams: number; percentage: number; gramsPerKg: number; kcal: number };
  };
}

export interface DietMealExchange {
  category: "CEREALES" | "LEGUMINOSAS" | "VERDURAS" | "FRUTAS" | "POA_MAGRO" | "POA_GRASO" | "LACTEOS" | "GRASAS" | "AZUCARES";
  portions: number;
}

export interface DietMeal {
  name: string; // Desayuno, Colación 1, Almuerzo/Comida, Merienda, Cena
  time?: string; // ej. 08:30
  notes?: string;
  suggestedMenu: string;
  exchanges: DietMealExchange[];
}

export interface DietPlan {
  id: string;
  patientId: string;
  consultationId: string;
  title: string;
  dateCreated: string;
  requirements: EnergyRequirement;
  meals: DietMeal[];
  hydrationRecommendations: string;
  generalGuidelines: string[];
  supplements?: string[];
}

export interface Consultation {
  id: string;
  patientId: string;
  consultationNumber: number;
  date: string;
  reason: string;
  nutritionalDiagnosisPES?: string; // Problema, Etiología, Signos/Síntomas
  clinicalEvolutionNotes?: string;
  anthropometry?: AnthropometryRecord;
  anamnesis?: Anamnesis;
  biochemicals?: BiochemicalRecord;
  dietPlan?: DietPlan;
  nextAppointmentDate?: string;
}
