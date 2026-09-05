import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando sembrado de datos clínicos...");

  // Limpiar datos previos si existen
  await prisma.foodEquivalent.deleteMany();
  await prisma.patient.deleteMany();

  // 1. Alimentos Básicos por Equivalentes
  const foods = [
    // Cereales
    { category: "CEREALES", name: "Avena en hojuelas", servingSize: "1/3 taza (30g)", caloriesKcal: 115, proteinG: 4, carbsG: 20, fatG: 2 },
    { category: "CEREALES", name: "Arroz integral cocido", servingSize: "1/2 taza (100g)", caloriesKcal: 110, proteinG: 2.5, carbsG: 23, fatG: 1 },
    { category: "CEREALES", name: "Pan integral de masa madre", servingSize: "1 rebanada (40g)", caloriesKcal: 95, proteinG: 4, carbsG: 18, fatG: 1 },
    { category: "CEREALES", name: "Papa / Patata cocida", servingSize: "1 pieza mediana (120g)", caloriesKcal: 105, proteinG: 2.5, carbsG: 24, fatG: 0.2 },
    { category: "CEREALES", name: "Tortilla de maíz nixtamalizado", servingSize: "1 pieza (30g)", caloriesKcal: 64, proteinG: 1.4, carbsG: 13.6, fatG: 0.5 },
    // Verduras
    { category: "VERDURAS", name: "Espinaca fresca", servingSize: "2 tazas (60g)", caloriesKcal: 15, proteinG: 1.8, carbsG: 2.2, fatG: 0.2 },
    { category: "VERDURAS", name: "Brócoli al vapor", servingSize: "1 taza (90g)", caloriesKcal: 30, proteinG: 2.5, carbsG: 6, fatG: 0.4 },
    { category: "VERDURAS", name: "Zanahoria cruda rallada", servingSize: "1/2 taza (60g)", caloriesKcal: 25, proteinG: 0.6, carbsG: 6, fatG: 0.1 },
    { category: "VERDURAS", name: "Tomate / Jitomate", servingSize: "1 pieza (120g)", caloriesKcal: 22, proteinG: 1.1, carbsG: 4.8, fatG: 0.2 },
    // Frutas
    { category: "FRUTAS", name: "Manzana fresca con cáscara", servingSize: "1 pieza mediana (130g)", caloriesKcal: 65, proteinG: 0.3, carbsG: 17, fatG: 0.2 },
    { category: "FRUTAS", name: "Plátano / Banana", servingSize: "1/2 pieza (60g)", caloriesKcal: 55, proteinG: 0.7, carbsG: 14, fatG: 0.2 },
    { category: "FRUTAS", name: "Frutos rojos / Arándanos", servingSize: "3/4 taza (100g)", caloriesKcal: 57, proteinG: 0.7, carbsG: 14, fatG: 0.3 },
    // Leguminosas
    { category: "LEGUMINOSAS", name: "Lentejas cocidas", servingSize: "1/2 taza (100g)", caloriesKcal: 115, proteinG: 9, carbsG: 20, fatG: 0.4 },
    { category: "LEGUMINOSAS", name: "Frijoles negros cocidos", servingSize: "1/2 taza (100g)", caloriesKcal: 110, proteinG: 7.5, carbsG: 20, fatG: 0.5 },
    // Proteínas de Origen Animal (POA)
    { category: "POA_MAGRO", name: "Pechuga de pollo a la plancha", servingSize: "100g cocido", caloriesKcal: 165, proteinG: 31, carbsG: 0, fatG: 3.6 },
    { category: "POA_MAGRO", name: "Filete de pescado blanco (Merluza/Tilapia)", servingSize: "120g", caloriesKcal: 110, proteinG: 24, carbsG: 0, fatG: 1.5 },
    { category: "POA_MAGRO", name: "Huevo entero de campo", servingSize: "1 pieza (55g)", caloriesKcal: 74, proteinG: 6.3, carbsG: 0.4, fatG: 5 },
    { category: "POA_MAGRO", name: "Atún al natural en agua", servingSize: "1 lata escurrida (100g)", caloriesKcal: 116, proteinG: 26, carbsG: 0, fatG: 0.8 },
    // Lácteos
    { category: "LACTEOS", name: "Yogur griego natural sin azúcar", servingSize: "3/4 taza (150g)", caloriesKcal: 90, proteinG: 15, carbsG: 5, fatG: 0.5 },
    { category: "LACTEOS", name: "Leche descremada o bebida de soja", servingSize: "1 taza (240ml)", caloriesKcal: 85, proteinG: 8, carbsG: 12, fatG: 0.5 },
    // Grasas saludables
    { category: "GRASAS", name: "Aceite de oliva virgen extra", servingSize: "1 cucharadita (5ml)", caloriesKcal: 45, proteinG: 0, carbsG: 0, fatG: 5 },
    { category: "GRASAS", name: "Aguacate / Palta Hass", servingSize: "1/3 pieza (50g)", caloriesKcal: 80, proteinG: 1, carbsG: 4, fatG: 7 },
    { category: "GRASAS", name: "Nueces / Almendras", servingSize: "10-12 piezas (20g)", caloriesKcal: 125, proteinG: 4, carbsG: 4, fatG: 11 },
  ];

  for (const food of foods) {
    await prisma.foodEquivalent.create({ data: food });
  }
  console.log(`✓ ${foods.length} alimentos y equivalentes sembrados.`);

  // 2. Paciente de Demostración con Consultas Evolutivas
  const patient1 = await prisma.patient.create({
    data: {
      recordNumber: "EXP-2026-001",
      firstName: "Valeria",
      lastName: "Ríos Mendoza",
      documentId: "17492834-K",
      birthDate: new Date("1996-05-14"),
      gender: "FEMALE",
      phone: "+54 9 11 4589-2210",
      email: "valeria.rios@email.com",
      occupation: "Diseñadora Gráfica / Trabajo remoto",
      city: "Buenos Aires",
      emergencyNotes: "Contacto: Martín Ríos (Hermano) - Tel: +54 9 11 3322-1100",
    },
  });

  // Consulta 1 (Inicial - hace 1 mes)
  const cons1 = await prisma.consultation.create({
    data: {
      patientId: patient1.id,
      consultationNumber: 1,
      date: new Date("2026-08-04"),
      reasonForVisit: "Mejora de composición corporal, fatiga vespertina y control de ansiedad por dulces.",
      nutritionalDiagnosisPES: "Consumo excesivo de ultraprocesados y carbohidratos simples (P) relacionado con jornadas laborales sedentarias y estrés laboral (E) evidenciado por R24H con 45% azúcares simples y porcentaje de grasa corporal de 31.5% (S).",
      clinicalEvolutionNotes: "Paciente refiere cansancio hacia las 16:00 hrs. Desea aprender a estructurar sus comidas sin dietas restrictivas.",
      nextAppointmentDate: new Date("2026-09-04"),
    },
  });

  await prisma.anthropometryRecord.create({
    data: {
      consultationId: cons1.id,
      date: new Date("2026-08-04"),
      weightKg: 68.5,
      heightCm: 164,
      bmi: 25.5,
      bmiClassification: "Sobrepeso (25.0 - 29.9)",
      idealWeightKg: 58.0,
      waistCm: 79.0,
      hipCm: 102.0,
      waistHipRatio: 0.77,
      waistHeightRatio: 0.48,
      tricepsFoldMm: 20,
      subscapularFoldMm: 18,
      suprailiacFoldMm: 22,
      abdominalFoldMm: 26,
      bodyFatPercentage: 31.5,
      fatMassKg: 21.6,
      leanMassKg: 46.9,
      muscleMassKg: 33.8,
      visceralFatLevel: 5,
      waterPercentage: 48.5,
      endomorphy: 5.2,
      mesomorphy: 3.4,
      ectomorphy: 2.1,
      somatotypeClass: "Endomorfo-Mesomorfo",
    },
  });

  // Consulta 2 (Seguimiento - Hoy)
  const cons2 = await prisma.consultation.create({
    data: {
      patientId: patient1.id,
      consultationNumber: 2,
      date: new Date("2026-09-04"),
      reasonForVisit: "Control mensual de evolución nutricional y ajuste de plan alimentario.",
      nutritionalDiagnosisPES: "Evolución favorable: reducción de grasa subcutánea y mejora de la adherencia a comidas completas.",
      clinicalEvolutionNotes: "Reporta mayor nivel de energía, desaparición de la somnolencia postprandial y mejor digestión. Logró 3 entrenamientos de fuerza semanales.",
      nextAppointmentDate: new Date("2026-10-04"),
    },
  });

  await prisma.anthropometryRecord.create({
    data: {
      consultationId: cons2.id,
      date: new Date("2026-09-04"),
      weightKg: 66.2, // -2.3 kg
      heightCm: 164,
      bmi: 24.6, // Pasa a Normopeso
      bmiClassification: "Normopeso (18.5 - 24.9)",
      idealWeightKg: 58.0,
      waistCm: 76.0, // -3 cm
      hipCm: 99.5, // -2.5 cm
      waistHipRatio: 0.76,
      waistHeightRatio: 0.46,
      tricepsFoldMm: 18,
      subscapularFoldMm: 16,
      suprailiacFoldMm: 19,
      abdominalFoldMm: 22,
      bodyFatPercentage: 29.2, // -2.3% grasa
      fatMassKg: 19.3,
      leanMassKg: 46.9, // Mantuvo 100% de masa magra
      muscleMassKg: 34.0,
      visceralFatLevel: 4,
      waterPercentage: 50.2,
      endomorphy: 4.6,
      mesomorphy: 3.5,
      ectomorphy: 2.4,
      somatotypeClass: "Meso-Endomorfo",
    },
  });

  // Plan Dietético asignado en la consulta 2
  await prisma.dietPlan.create({
    data: {
      consultationId: cons2.id,
      title: "Plan de Recomposición Corporal y Energía Sostenible",
      goal: "Pérdida de Grasa con Preservación de Masa Muscular",
      bmrKcal: 1390,
      tdeeKcal: 1950,
      targetCaloriesKcal: 1650, // Déficit moderado de 300 kcal
      proteinGrams: 120, // ~1.8 g/kg
      carbsGrams: 165,
      fatGrams: 45,
      mealsJson: JSON.stringify([
        {
          name: "Desayuno Energético",
          time: "08:00",
          suggestedMenu: "Omelette de 2 huevos con espinacas y tomates cherry + 1 rebanada de pan integral tostado con 1/3 de aguacate + Té verde o café.",
        },
        {
          name: "Almuerzo / Comida Principal",
          time: "13:30",
          suggestedMenu: "Pechuga de pollo a la plancha (120g) con quinoa cocida (1/2 taza) y ensalada fresca variada con 1 cucharadita de aceite de oliva.",
        },
        {
          name: "Merienda Pre-Entreno",
          time: "17:30",
          suggestedMenu: "Yogur griego natural (150g) con arándanos frescos (3/4 taza) y 10 almendras tostadas.",
        },
        {
          name: "Cena Ligera",
          time: "21:00",
          suggestedMenu: "Filete de pescado blanco al horno con verduras salteadas (brócoli, zanahoria y calabacín) + 1 infusión de manzanilla.",
        },
      ]),
      generalGuidelines: "Consumir al menos 2 a 2.5 litros de agua al día. Priorizar 7-8 horas de descanso nocturno continuo. Mantener 3 sesiones semanales de entrenamiento de fuerza.",
      supplementsNotes: "Creatina monohidrato 3g diarios (post-entrenamiento). Vitamina D3 2000 UI diaria en el desayuno.",
    },
  });

  // Paciente 2 de Demostración
  await prisma.patient.create({
    data: {
      recordNumber: "EXP-2026-002",
      firstName: "Santiago",
      lastName: "Morales Benítez",
      documentId: "24891045-A",
      birthDate: new Date("1989-11-20"),
      gender: "MALE",
      phone: "+54 9 11 6721-8930",
      email: "santiago.morales@techcorp.io",
      occupation: "Ingeniero de Sistemas",
      city: "Córdoba",
      emergencyNotes: "Contacto: Laura Benítez (Madre) - Tel: +54 9 11 8899-7766",
    },
  });

  console.log("✓ Base de datos sembrada con éxito con pacientes, consultas y catálogo bromatológico.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
