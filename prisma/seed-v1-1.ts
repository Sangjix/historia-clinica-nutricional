import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando precarga de Boxes y Vademécum Clínico para Versión 1.1...");

  // 1. Boxes / Consultorios
  const rooms = [
    {
      name: "Box 1 - Antropometría ISAK & Bioimpedancia (BIA)",
      description: "Equipado con plicómetros Harpenden/Slimguide, tallímetro y analizador BIA multifrecuencia octapolar.",
    },
    {
      name: "Box 2 - Consulta Nutricional Adulto & Deportiva",
      description: "Consultorio para entrevista clínica, anamnesis y diseño de planes de alimentación.",
    },
    {
      name: "Box 3 - Soporte Clínico & Nutrición Enteral",
      description: "Área de evaluación de pacientes críticos, nefropatías, oncología y cálculo de soporte.",
    },
  ];

  for (const r of rooms) {
    const existing = await prisma.consultationRoom.findFirst({ where: { name: r.name } });
    if (!existing) {
      await prisma.consultationRoom.create({ data: r });
    }
  }

  // 2. Vademécum de Suplementos y Fórmulas Clínicas
  const supplements = [
    {
      code: "ENS-ADV",
      name: "Ensure Advance Líquido (Vainilla)",
      brand: "Abbott Nutrition",
      category: "ENTERAL_STANDARD",
      presentation: "LIQUIDO",
      servingSize: "237 ml (1 botella)",
      kcalPer100gOrMl: 106,
      proteinGPer100: 4.4,
      carbsGPer100: 14.2,
      fatGPer100: 3.3,
      fiberGPer100: 1.2,
      osmolarityMOsmL: 450,
      sodiumMgPer100: 95,
      potassiumMgPer100: 165,
      phosphorusMgPer100: 80,
      calciumMgPer100: 120,
      indications: "Desnutrición calórico-proteica leve/moderada, sarcopenia del adulto mayor, postoperatorio.",
      administrationRoute: "BOTH",
    },
    {
      code: "GLU-1.5",
      name: "Glucerna 1.5 Kcal",
      brand: "Abbott Nutrition",
      category: "ENTERAL_SPECIALIZED",
      presentation: "LIQUIDO",
      servingSize: "237 ml",
      kcalPer100gOrMl: 150,
      proteinGPer100: 7.5,
      carbsGPer100: 13.3,
      fatGPer100: 7.5,
      fiberGPer100: 2.1,
      osmolarityMOsmL: 420,
      sodiumMgPer100: 105,
      potassiumMgPer100: 190,
      phosphorusMgPer100: 100,
      calciumMgPer100: 130,
      indications: "Pacientes con diabetes tipo 1, 2, hiperglucemia por estrés metabólico o intolerancia a la glucosa.",
      administrationRoute: "BOTH",
    },
    {
      code: "FRE-HPE",
      name: "Fresubin HP Energy",
      brand: "Fresenius Kabi",
      category: "ENTERAL_SPECIALIZED",
      presentation: "LIQUIDO",
      servingSize: "500 ml (EasyBag)",
      kcalPer100gOrMl: 150,
      proteinGPer100: 7.5,
      carbsGPer100: 17.0,
      fatGPer100: 5.8,
      fiberGPer100: 0.0,
      osmolarityMOsmL: 390,
      sodiumMgPer100: 110,
      potassiumMgPer100: 180,
      phosphorusMgPer100: 90,
      calciumMgPer100: 110,
      indications: "Soporte enteral en paciente crítico, politraumatizado, quemados o con restricción de volumen.",
      administrationRoute: "ENTERAL_TUBE",
    },
    {
      code: "MOD-PROT",
      name: "Módulo Proteico Whey Isolate 90%",
      brand: "NutriClinic Lab",
      category: "PROTEIN_MODULE",
      presentation: "POLVO",
      servingSize: "1 scoop (25g) = 22.5g Proteína",
      kcalPer100gOrMl: 375,
      proteinGPer100: 90.0,
      carbsGPer100: 1.0,
      fatGPer100: 1.5,
      fiberGPer100: 0.0,
      osmolarityMOsmL: 280,
      sodiumMgPer100: 140,
      potassiumMgPer100: 180,
      phosphorusMgPer100: 120,
      calciumMgPer100: 450,
      indications: "Déficit proteico agudo, cicatrización de úlceras por presión, sarcopenia, deportistas.",
      administrationRoute: "BOTH",
    },
    {
      code: "MOD-GLUT",
      name: "L-Glutamina Micronizada 100%",
      brand: "NutriClinic Lab",
      category: "PROTEIN_MODULE",
      presentation: "POLVO",
      servingSize: "5 g (1 cucharadita)",
      kcalPer100gOrMl: 400,
      proteinGPer100: 100.0,
      carbsGPer100: 0.0,
      fatGPer100: 0.0,
      fiberGPer100: 0.0,
      osmolarityMOsmL: 310,
      sodiumMgPer100: 0,
      potassiumMgPer100: 0,
      phosphorusMgPer100: 0,
      calciumMgPer100: 0,
      indications: "Integridad de la barrera intestinal, mucositis por quimioterapia, síndrome de intestino corto.",
      administrationRoute: "BOTH",
    },
    {
      code: "MOD-MCT",
      name: "Aceite MCT (Triglicéridos de Cadena Media)",
      brand: "Fresenius / Vital",
      category: "LIPID_MODULE",
      presentation: "LIQUIDO",
      servingSize: "15 ml (1 cucharada) = 115 kcal",
      kcalPer100gOrMl: 830,
      proteinGPer100: 0.0,
      carbsGPer100: 0.0,
      fatGPer100: 93.0,
      fiberGPer100: 0.0,
      osmolarityMOsmL: 0,
      sodiumMgPer100: 0,
      potassiumMgPer100: 0,
      phosphorusMgPer100: 0,
      calciumMgPer100: 0,
      indications: "Malabsorción grasa, esteatorrea, quilotórax, pancreatitis crónica, dieta cetogénica clínica.",
      administrationRoute: "BOTH",
    },
  ];

  for (const s of supplements) {
    const existing = await prisma.clinicalSupplement.findUnique({ where: { code: s.code } });
    if (!existing) {
      await prisma.clinicalSupplement.create({ data: s });
    }
  }

  console.log("Precarga completada con éxito en versión 1.1.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
