import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const RECIPES_DATA = [
  {
    code: "REC-PER-01",
    name: "Ají de Pollo Saludable con Quinua y Papa Nativa",
    category: "ALMUERZO",
    description: "Versión clínica y ligera del tradicional ají de gallina. Sustituye el pan procesado por quinua cocida y utiliza pechuga sin piel y leche descremada. Alto en proteína y bajo en grasas saturadas.",
    prepTimeMinutes: 30,
    servings: 1,
    difficulty: "MEDIA",
    tags: "HIPERPROTEICO, BAJO_EN_GRASA, TRADICIONAL_PERUANO, CARDIOPROTECTOR",
    instructionsJson: JSON.stringify([
      "Sancochar la pechuga de pollo con una pizca de sal y deshilacharla finamente.",
      "Lavar y sancochar la quinua blanca hasta que reviente el grano. Licuar la mitad de la quinua con la leche descremada y el ají amarillo previamente salteado con cebolla para formar la salsa cremosa.",
      "En una sartén con la cucharadita de aceite vegetal, sofreír el ajo y la cebolla picada; verter la crema de ají y quinua licuada.",
      "Incorporar el pollo deshilachado y la quinua restante en grano, mezclando suavemente a fuego lento durante 3 minutos.",
      "Servir sobre rodajas de papa amarilla sancochada y decorar con el medio huevo duro, la aceituna botija y hojas de lechuga fresca."
    ]),
    imageUrl: "/images/recipes/aji_pollo.jpg",
    totalKcal: 482.1,
    totalProteinG: 38.7,
    totalFatG: 14.4,
    totalCarbsG: 47.2,
    totalFiberG: 5.4,
    totalIronMg: 3.2,
    totalZincMg: 2.1,
    totalCalciumMg: 142.0,
    totalSodiumMg: 280.0,
    ingredients: [
      { foodName: "Pechuga de pollo sin piel", category: "PROTEINA", netWeightG: 120, householdMeasure: "1 filete mediano (120g)", energyKcal: 144.0, proteinG: 26.2, fatG: 3.1, carbsG: 0.0, fiberG: 0.0, ironMg: 1.1, sodiumMg: 78.0 },
      { foodName: "Quinua blanca cocida", category: "CEREAL", netWeightG: 60, householdMeasure: "1/4 de taza cocida", energyKcal: 85.8, proteinG: 3.2, fatG: 1.4, carbsG: 14.8, fiberG: 2.1, ironMg: 1.0, sodiumMg: 4.0 },
      { foodName: "Papa amarilla sancochada", category: "TUBERCULO", netWeightG: 100, householdMeasure: "1 unidad mediana", energyKcal: 97.0, proteinG: 2.0, fatG: 0.2, carbsG: 22.0, fiberG: 1.5, ironMg: 0.5, sodiumMg: 8.0 },
      { foodName: "Ají amarillo licuado", category: "CONDIMENTO", netWeightG: 25, householdMeasure: "1 cucharada colmada", energyKcal: 10.0, proteinG: 0.4, fatG: 0.1, carbsG: 2.1, fiberG: 0.6, ironMg: 0.2, sodiumMg: 2.0 },
      { foodName: "Leche evaporada descremada", category: "LACTEO", netWeightG: 40, householdMeasure: "2 cucharadas soperas", energyKcal: 31.2, proteinG: 2.9, fatG: 0.2, carbsG: 4.4, fiberG: 0.0, ironMg: 0.1, sodiumMg: 45.0 },
      { foodName: "Cebolla roja picada", category: "VERDURA", netWeightG: 30, householdMeasure: "2 cucharadas picadas", energyKcal: 11.4, proteinG: 0.4, fatG: 0.1, carbsG: 2.6, fiberG: 0.5, ironMg: 0.1, sodiumMg: 3.0 },
      { foodName: "Aceite vegetal", category: "GRASA", netWeightG: 5, householdMeasure: "1 cucharadita (5ml)", energyKcal: 44.2, proteinG: 0.0, fatG: 5.0, carbsG: 0.0, fiberG: 0.0, ironMg: 0.0, sodiumMg: 0.0 },
      { foodName: "Huevo de gallina sancochado", category: "PROTEINA", netWeightG: 25, householdMeasure: "1/2 unidad", energyKcal: 38.8, proteinG: 3.1, fatG: 2.7, carbsG: 0.2, fiberG: 0.0, ironMg: 0.6, sodiumMg: 35.0 },
      { foodName: "Aceituna negra botija", category: "GRASA", netWeightG: 8, householdMeasure: "1 unidad pequeña", energyKcal: 15.2, proteinG: 0.1, fatG: 1.5, carbsG: 0.3, fiberG: 0.3, ironMg: 0.1, sodiumMg: 95.0 },
      { foodName: "Lechuga fresca", category: "VERDURA", netWeightG: 30, householdMeasure: "2 hojas medianas", energyKcal: 4.5, proteinG: 0.4, fatG: 0.1, carbsG: 0.8, fiberG: 0.4, ironMg: 0.1, sodiumMg: 10.0 }
    ]
  },
  {
    code: "REC-PER-02",
    name: "Chaufa de Sangrecita con Verduras Antianémico",
    category: "ALMUERZO",
    description: "Plato estelar de la gastronomía peruana adaptado para erradicar la anemia ferropénica. Proporciona más de 30 mg de hierro hemínico de absorción directa con verduras crujientes.",
    prepTimeMinutes: 20,
    servings: 1,
    difficulty: "FACIL",
    tags: "ANTIANEMICO, ALTO_HIERRO, PEDIATRICO_RECOMENDADO, GESTANTES",
    instructionsJson: JSON.stringify([
      "Sancochar la sangrecita con hierbabuena y orégano para neutralizar aromas, escurrir y picar en dados pequeños.",
      "En un wok o sartén bien caliente con aceite, dorar el kion rallado y saltear la sangrecita durante 2 minutos.",
      "Agregar el huevo revuelto picado, el pimiento en dados y el arroz blanco cocido frío.",
      "Saltear todo a fuego vivo añadiendo el sillao bajo en sodio.",
      "Terminar con la cebolla china picada fresca y retirar del fuego inmediatamente para mantener su crocancia."
    ]),
    totalKcal: 396.7,
    totalProteinG: 28.8,
    totalFatG: 13.1,
    totalCarbsG: 40.0,
    totalFiberG: 2.8,
    totalIronMg: 32.0,
    totalZincMg: 3.4,
    totalCalciumMg: 68.0,
    totalSodiumMg: 340.0,
    ingredients: [
      { foodName: "Sangrecita de pollo cocida", category: "PROTEINA", netWeightG: 100, householdMeasure: "4 cucharadas colmadas (100g)", energyKcal: 76.0, proteinG: 18.2, fatG: 0.3, carbsG: 0.1, fiberG: 0.0, ironMg: 29.5, sodiumMg: 85.0 },
      { foodName: "Arroz blanco cocido", category: "CEREAL", netWeightG: 120, householdMeasure: "3/4 de taza", energyKcal: 156.0, proteinG: 2.9, fatG: 0.2, carbsG: 34.4, fiberG: 0.5, ironMg: 0.4, sodiumMg: 2.0 },
      { foodName: "Huevo de gallina", category: "PROTEINA", netWeightG: 50, householdMeasure: "1 unidad entera", energyKcal: 77.5, proteinG: 6.3, fatG: 5.4, carbsG: 0.4, fiberG: 0.0, ironMg: 1.1, sodiumMg: 70.0 },
      { foodName: "Cebolla china picada", category: "VERDURA", netWeightG: 30, householdMeasure: "3 cucharadas", energyKcal: 9.6, proteinG: 0.6, fatG: 0.1, carbsG: 2.1, fiberG: 0.8, ironMg: 0.5, sodiumMg: 5.0 },
      { foodName: "Pimiento rojo en dados", category: "VERDURA", netWeightG: 30, householdMeasure: "2 cucharadas", energyKcal: 8.7, proteinG: 0.3, fatG: 0.1, carbsG: 1.8, fiberG: 0.7, ironMg: 0.3, sodiumMg: 2.0 },
      { foodName: "Aceite vegetal", category: "GRASA", netWeightG: 7, householdMeasure: "1/2 cucharada sopera", energyKcal: 61.9, proteinG: 0.0, fatG: 7.0, carbsG: 0.0, fiberG: 0.0, ironMg: 0.0, sodiumMg: 0.0 },
      { foodName: "Kion fresco rallado", category: "CONDIMENTO", netWeightG: 5, householdMeasure: "1/2 cucharadita", energyKcal: 4.0, proteinG: 0.1, fatG: 0.0, carbsG: 0.9, fiberG: 0.1, ironMg: 0.1, sodiumMg: 1.0 },
      { foodName: "Sillao bajo en sodio", category: "CONDIMENTO", netWeightG: 5, householdMeasure: "1 cucharadita", energyKcal: 3.0, proteinG: 0.4, fatG: 0.0, carbsG: 0.3, fiberG: 0.0, ironMg: 0.1, sodiumMg: 175.0 }
    ]
  },
  {
    code: "REC-PER-03",
    name: "Ceviche Tradicional de Bonito con Camote y Choclo",
    category: "ALMUERZO",
    description: "El plato bandera del Perú con pescado azul rico en ácidos grasos Omega-3 (EPA y DHA). Excelente para la salud cardiovascular, reducción de triglicéridos y aporte proteico de alto valor biológico.",
    prepTimeMinutes: 15,
    servings: 1,
    difficulty: "FACIL",
    tags: "CARDIOPROTECTOR, OMEGA_3, HIPERPROTEICO, BAJO_EN_GRASAS_SATURADAS",
    instructionsJson: JSON.stringify([
      "Cortar el filete de bonito fresco en dados uniformes de 2 cm.",
      "En un bowl frío, frotar un trozo de ají limo en las paredes y colocar el pescado con sal y culantro.",
      "Exprimir el limón sutil fresco al momento sin apretar la cáscara para no amargar el jugo.",
      "Añadir la cebolla roja cortada en pluma lavada previamente en agua fría.",
      "Mezclar suavemente durante 30 segundos y servir de inmediato acompañado de rodajas de camote morado y choclo tierno desgranado."
    ]),
    totalKcal: 383.7,
    totalProteinG: 36.9,
    totalFatG: 9.5,
    totalCarbsG: 40.3,
    totalFiberG: 4.5,
    totalIronMg: 4.1,
    totalZincMg: 1.9,
    totalCalciumMg: 52.0,
    totalSodiumMg: 310.0,
    ingredients: [
      { foodName: "Filete de Bonito fresco", category: "PROTEINA", netWeightG: 150, householdMeasure: "1 trozo grande (150g)", energyKcal: 207.0, proteinG: 33.0, fatG: 8.2, carbsG: 0.0, fiberG: 0.0, ironMg: 3.2, sodiumMg: 65.0 },
      { foodName: "Zumo de limón sutil fresco", category: "FRUTA", netWeightG: 40, householdMeasure: "Jugo de 3 limones", energyKcal: 12.0, proteinG: 0.3, fatG: 0.1, carbsG: 3.6, fiberG: 0.2, ironMg: 0.1, sodiumMg: 2.0 },
      { foodName: "Cebolla roja en pluma", category: "VERDURA", netWeightG: 40, householdMeasure: "1/2 unidad mediana", energyKcal: 15.2, proteinG: 0.5, fatG: 0.1, carbsG: 3.4, fiberG: 0.7, ironMg: 0.1, sodiumMg: 4.0 },
      { foodName: "Camote morado sancochado", category: "TUBERCULO", netWeightG: 80, householdMeasure: "1 rodaja gruesa (80g)", energyKcal: 92.8, proteinG: 1.2, fatG: 0.3, carbsG: 21.6, fiberG: 2.0, ironMg: 0.4, sodiumMg: 15.0 },
      { foodName: "Choclo desgranado sancochado", category: "CEREAL", netWeightG: 50, householdMeasure: "3 cucharadas soperas", energyKcal: 54.0, proteinG: 1.7, fatG: 0.8, carbsG: 11.2, fiberG: 1.4, ironMg: 0.3, sodiumMg: 5.0 },
      { foodName: "Ají limo picado", category: "CONDIMENTO", netWeightG: 5, householdMeasure: "1 rodajita fina", energyKcal: 2.0, proteinG: 0.1, fatG: 0.0, carbsG: 0.4, fiberG: 0.1, ironMg: 0.0, sodiumMg: 1.0 },
      { foodName: "Culantro picado", category: "CONDIMENTO", netWeightG: 3, householdMeasure: "1 pizca", energyKcal: 0.7, proteinG: 0.1, fatG: 0.0, carbsG: 0.1, fiberG: 0.1, ironMg: 0.0, sodiumMg: 1.0 }
    ]
  },
  {
    code: "REC-PER-04",
    name: "Seco de Res con Frejoles Canario y Arroz",
    category: "ALMUERZO",
    description: "Guiso tradicional del norte y centro peruano rico en fibra y proteína vegetal/animal complementaria. Excelente aporte de hierro y saciedad prolongada.",
    prepTimeMinutes: 45,
    servings: 1,
    difficulty: "MEDIA",
    tags: "TRADICIONAL_PERUANO, ALTO_EN_FIBRA, HIPERPROTEICO, ANEMIA",
    instructionsJson: JSON.stringify([
      "Dorar los dados de carne magra de res con ajo y cebolla picada.",
      "Licuar el culantro fresco con un chorrito de agua y agregarlo a la carne.",
      "Añadir la zanahoria y cocinar a fuego medio hasta que la carne esté tierna.",
      "Servir acompañado de frejol canario previamente cocido con aderezo bajo en grasa y una porción moderada de arroz blanco."
    ]),
    totalKcal: 554.2,
    totalProteinG: 41.2,
    totalFatG: 14.8,
    totalCarbsG: 64.5,
    totalFiberG: 9.8,
    totalIronMg: 7.9,
    totalZincMg: 5.2,
    totalCalciumMg: 85.0,
    totalSodiumMg: 290.0,
    ingredients: [
      { foodName: "Carne magra de res (cuadril)", category: "PROTEINA", netWeightG: 120, householdMeasure: "1 porción mediana (120g)", energyKcal: 174.0, proteinG: 26.4, fatG: 7.2, carbsG: 0.0, fiberG: 0.0, ironMg: 3.5, sodiumMg: 72.0 },
      { foodName: "Frejol canario cocido", category: "LEGUMINOSA", netWeightG: 100, householdMeasure: "1/2 taza cocida", energyKcal: 139.0, proteinG: 9.5, fatG: 0.6, carbsG: 24.2, fiberG: 7.5, ironMg: 3.2, sodiumMg: 10.0 },
      { foodName: "Arroz blanco cocido", category: "CEREAL", netWeightG: 80, householdMeasure: "1/2 taza", energyKcal: 104.0, proteinG: 1.9, fatG: 0.1, carbsG: 22.9, fiberG: 0.3, ironMg: 0.3, sodiumMg: 2.0 },
      { foodName: "Culantro licuado", category: "VERDURA", netWeightG: 25, householdMeasure: "2 cucharadas", energyKcal: 6.0, proteinG: 0.5, fatG: 0.1, carbsG: 0.9, fiberG: 0.7, ironMg: 0.4, sodiumMg: 5.0 },
      { foodName: "Cebolla roja picada", category: "VERDURA", netWeightG: 30, householdMeasure: "2 cucharadas", energyKcal: 11.4, proteinG: 0.4, fatG: 0.1, carbsG: 2.6, fiberG: 0.5, ironMg: 0.1, sodiumMg: 3.0 },
      { foodName: "Zanahoria en rodajas", category: "VERDURA", netWeightG: 30, householdMeasure: "4 rodajas", energyKcal: 12.3, proteinG: 0.3, fatG: 0.1, carbsG: 2.8, fiberG: 0.8, ironMg: 0.1, sodiumMg: 15.0 },
      { foodName: "Aceite vegetal", category: "GRASA", netWeightG: 7, householdMeasure: "1/2 cucharada sopera", energyKcal: 61.9, proteinG: 0.0, fatG: 7.0, carbsG: 0.0, fiberG: 0.0, ironMg: 0.0, sodiumMg: 0.0 }
    ]
  },
  {
    code: "REC-PER-05",
    name: "Lentejitas Criollas con Pescado a la Plancha y Ensalada",
    category: "ALMUERZO",
    description: "Combinación perfecta de leguminosa con cereal y proteína marina magra. Aporte equilibrado de hierro no hemínico potenciado por la vitamina C de la ensalada fresca de tomate y limón.",
    prepTimeMinutes: 30,
    servings: 1,
    difficulty: "FACIL",
    tags: "ALTO_EN_FIBRA, SALUD_DIGESTIVA, CARDIOPROTECTOR, HIPERPROTEICO",
    instructionsJson: JSON.stringify([
      "Cocinar las lentejas con laurel y aderezo simple de cebolla y ajo.",
      "Salpimentar el filete de jurel o merluza y dorarlo en una sartén antiadherente con unas gotas de aceite de oliva.",
      "Preparar la ensalada fresca con rodajas de tomate y cebolla aliñadas con limón y sal.",
      "Servir las lentejas acompañadas de la porción de arroz, el pescado a la plancha y la ensalada fresca."
    ]),
    totalKcal: 492.6,
    totalProteinG: 38.4,
    totalFatG: 10.9,
    totalCarbsG: 62.1,
    totalFiberG: 11.2,
    totalIronMg: 7.4,
    totalZincMg: 3.8,
    totalCalciumMg: 96.0,
    totalSodiumMg: 285.0,
    ingredients: [
      { foodName: "Lentejas cocidas", category: "LEGUMINOSA", netWeightG: 130, householdMeasure: "3/4 de taza cocida", energyKcal: 150.8, proteinG: 11.7, fatG: 0.5, carbsG: 26.1, fiberG: 8.5, ironMg: 4.3, sodiumMg: 6.0 },
      { foodName: "Filete de jurel a la plancha", category: "PROTEINA", netWeightG: 120, householdMeasure: "1 filete mediano (120g)", energyKcal: 162.0, proteinG: 22.8, fatG: 7.8, carbsG: 0.0, fiberG: 0.0, ironMg: 1.8, sodiumMg: 75.0 },
      { foodName: "Arroz blanco cocido", category: "CEREAL", netWeightG: 70, householdMeasure: "1/3 de taza", energyKcal: 91.0, proteinG: 1.7, fatG: 0.1, carbsG: 20.1, fiberG: 0.3, ironMg: 0.2, sodiumMg: 2.0 },
      { foodName: "Tomate fresco en rodajas", category: "VERDURA", netWeightG: 50, householdMeasure: "1/2 unidad", energyKcal: 9.0, proteinG: 0.5, fatG: 0.1, carbsG: 2.0, fiberG: 0.6, ironMg: 0.2, sodiumMg: 4.0 },
      { foodName: "Cebolla roja", category: "VERDURA", netWeightG: 30, householdMeasure: "2 cucharadas", energyKcal: 11.4, proteinG: 0.4, fatG: 0.1, carbsG: 2.6, fiberG: 0.5, ironMg: 0.1, sodiumMg: 3.0 },
      { foodName: "Aceite de oliva extra virgen", category: "GRASA", netWeightG: 5, householdMeasure: "1 cucharadita", energyKcal: 44.2, proteinG: 0.0, fatG: 5.0, carbsG: 0.0, fiberG: 0.0, ironMg: 0.0, sodiumMg: 0.0 },
      { foodName: "Zumo de limón fresco", category: "FRUTA", netWeightG: 10, householdMeasure: "1 cucharada", energyKcal: 3.0, proteinG: 0.1, fatG: 0.0, carbsG: 0.9, fiberG: 0.1, ironMg: 0.0, sodiumMg: 1.0 }
    ]
  },
  {
    code: "REC-PER-06",
    name: "Quinua Atamalada con Pollo y Verduras Andinas",
    category: "ALMUERZO",
    description: "Guiso andino reconfortante con quinua perlada, pechuga de pollo y habas tiernas. Bajo índice glucémico, excelente para personas con resistencia a la insulina o diabetes.",
    prepTimeMinutes: 35,
    servings: 1,
    difficulty: "MEDIA",
    tags: "DIABETES_RECOMENDADO, GRANOS_ANDINOS, BAJO_INDICE_GLUCEMICO, FIBRA",
    instructionsJson: JSON.stringify([
      "Lavar la quinua frotándola varias veces para retirar las saponinas amargas.",
      "En una olla dorar cebolla, ajo, ají amarillo y trozos de pechuga de pollo con una cucharadita de aceite.",
      "Agregar la quinua lavada, caldo de verduras o agua, choclo desgranado y habas verdes peladas.",
      "Cocinar a fuego bajo por 20 minutos hasta que la quinua absorba el líquido y tome consistencia atamalada cremosa.",
      "Apagar el fuego, añadir cubos de queso fresco pasteurizado y hojas de huacatay picadas."
    ]),
    totalKcal: 442.5,
    totalProteinG: 35.8,
    totalFatG: 11.2,
    totalCarbsG: 51.5,
    totalFiberG: 7.2,
    totalIronMg: 4.8,
    totalZincMg: 3.2,
    totalCalciumMg: 165.0,
    totalSodiumMg: 210.0,
    ingredients: [
      { foodName: "Quinua perlada en crudo", category: "CEREAL", netWeightG: 50, householdMeasure: "1/4 de taza cruda (50g)", energyKcal: 185.0, proteinG: 7.1, fatG: 3.1, carbsG: 32.1, fiberG: 3.5, ironMg: 2.3, sodiumMg: 5.0 },
      { foodName: "Pechuga de pollo en dados", category: "PROTEINA", netWeightG: 100, householdMeasure: "1 trozo mediano (100g)", energyKcal: 120.0, proteinG: 21.8, fatG: 2.6, carbsG: 0.0, fiberG: 0.0, ironMg: 0.9, sodiumMg: 65.0 },
      { foodName: "Queso fresco descremado", category: "LACTEO", netWeightG: 30, householdMeasure: "1 tajada delgada", energyKcal: 48.0, proteinG: 4.8, fatG: 2.5, carbsG: 1.2, fiberG: 0.0, ironMg: 0.2, sodiumMg: 110.0 },
      { foodName: "Choclo tierno desgranado", category: "CEREAL", netWeightG: 40, householdMeasure: "2 cucharadas soperas", energyKcal: 43.2, proteinG: 1.4, fatG: 0.6, carbsG: 9.0, fiberG: 1.1, ironMg: 0.2, sodiumMg: 4.0 },
      { foodName: "Habas verdes peladas", category: "LEGUMINOSA", netWeightG: 40, householdMeasure: "2 cucharadas soperas", energyKcal: 38.0, proteinG: 3.2, fatG: 0.2, carbsG: 6.2, fiberG: 2.2, ironMg: 0.7, sodiumMg: 3.0 },
      { foodName: "Aceite vegetal", category: "GRASA", netWeightG: 5, householdMeasure: "1 cucharadita", energyKcal: 44.2, proteinG: 0.0, fatG: 5.0, carbsG: 0.0, fiberG: 0.0, ironMg: 0.0, sodiumMg: 0.0 }
    ]
  },
  {
    code: "REC-PER-07",
    name: "Bowl de Avena con Manzana, Canela y Semillas de Chía",
    category: "DESAYUNO",
    description: "Desayuno saciante rico en betaglucanos (fibra soluble) para reducir el colesterol LDL y regular el tránsito intestinal. Estabiliza la glucosa matutina.",
    prepTimeMinutes: 10,
    servings: 1,
    difficulty: "FACIL",
    tags: "DESAYUNO, CARDIOPROTECTOR, COLESTEROL, ALTO_EN_FIBRA",
    instructionsJson: JSON.stringify([
      "Cocinar las hojuelas de avena con agua, una ramita de canela y clavo de olor durante 5 minutos.",
      "Agregar la leche descremada tibia y mezclar bien.",
      "Servir en un bowl y añadir la manzana picada en cubitos con su cáscara limpia.",
      "Espolvorear las semillas de chía y canela en polvo al gusto."
    ]),
    totalKcal: 318.5,
    totalProteinG: 11.8,
    totalFatG: 6.2,
    totalCarbsG: 54.8,
    totalFiberG: 8.6,
    totalIronMg: 2.5,
    totalZincMg: 1.8,
    totalCalciumMg: 215.0,
    totalSodiumMg: 85.0,
    ingredients: [
      { foodName: "Hojuelas de avena precocida", category: "CEREAL", netWeightG: 45, householdMeasure: "4 cucharadas colmadas (45g)", energyKcal: 166.5, proteinG: 6.1, fatG: 3.2, carbsG: 29.8, fiberG: 4.5, ironMg: 1.8, sodiumMg: 2.0 },
      { foodName: "Manzana picada con cáscara", category: "FRUTA", netWeightG: 100, householdMeasure: "1 unidad pequeña (100g)", energyKcal: 52.0, proteinG: 0.3, fatG: 0.2, carbsG: 13.8, fiberG: 2.4, ironMg: 0.1, sodiumMg: 1.0 },
      { foodName: "Leche descremada fluida", category: "LACTEO", netWeightG: 150, householdMeasure: "3/4 de taza (150ml)", energyKcal: 51.0, proteinG: 5.1, fatG: 0.3, carbsG: 7.2, fiberG: 0.0, ironMg: 0.1, sodiumMg: 75.0 },
      { foodName: "Semillas de chía", category: "GRASA", netWeightG: 10, householdMeasure: "1 cucharada sopera", energyKcal: 49.0, proteinG: 1.7, fatG: 3.1, carbsG: 4.2, fiberG: 3.4, ironMg: 0.8, sodiumMg: 2.0 }
    ]
  },
  {
    code: "REC-PER-08",
    name: "Panqueques de Avena, Plátano de la Isla y Claras",
    category: "DESAYUNO",
    description: "Desayuno proteico sin azúcares añadidos ni harinas refinadas. Dulzura natural proporcionada por el plátano de la isla peruano. Ideal para deportistas y recomposición corporal.",
    prepTimeMinutes: 12,
    servings: 1,
    difficulty: "FACIL",
    tags: "DESAYUNO, HIPERPROTEICO, FITNESS, SIN_AZUCAR_REFINADA",
    instructionsJson: JSON.stringify([
      "En una licuadora o procesador, colocar las claras de huevo, las hojuelas de avena y el plátano maduro.",
      "Licuar hasta obtener una mezcla homogénea y ligeramente espesa.",
      "Calentar una sartén de teflón untada con una gota de aceite y verter porciones de la masa.",
      "Cocinar 2 minutos por lado a fuego medio-bajo hasta dorar.",
      "Servir calientes con un hilo fino de miel de abeja pura."
    ]),
    totalKcal: 338.2,
    totalProteinG: 21.6,
    totalFatG: 3.5,
    totalCarbsG: 56.4,
    totalFiberG: 5.1,
    totalIronMg: 2.2,
    totalZincMg: 1.5,
    totalCalciumMg: 38.0,
    totalSodiumMg: 180.0,
    ingredients: [
      { foodName: "Clara de huevo fresca", category: "PROTEINA", netWeightG: 100, householdMeasure: "3 claras de huevo grandes", energyKcal: 52.0, proteinG: 10.9, fatG: 0.2, carbsG: 0.7, fiberG: 0.0, ironMg: 0.1, sodiumMg: 166.0 },
      { foodName: "Hojuelas de avena", category: "CEREAL", netWeightG: 40, householdMeasure: "3 cucharadas y media", energyKcal: 148.0, proteinG: 5.4, fatG: 2.8, carbsG: 26.5, fiberG: 4.0, ironMg: 1.6, sodiumMg: 2.0 },
      { foodName: "Plátano de la isla maduro", category: "FRUTA", netWeightG: 70, householdMeasure: "1 unidad mediana", energyKcal: 65.8, proteinG: 0.8, fatG: 0.2, carbsG: 16.0, fiberG: 1.8, ironMg: 0.3, sodiumMg: 1.0 },
      { foodName: "Huevo entero (para consistencia)", category: "PROTEINA", netWeightG: 25, householdMeasure: "1/2 unidad batida", energyKcal: 38.8, proteinG: 3.1, fatG: 2.7, carbsG: 0.2, fiberG: 0.0, ironMg: 0.6, sodiumMg: 35.0 },
      { foodName: "Miel de abeja pura", category: "AZUCAR", netWeightG: 10, householdMeasure: "1 cucharadita (10g)", energyKcal: 30.4, proteinG: 0.0, fatG: 0.0, carbsG: 8.2, fiberG: 0.0, ironMg: 0.0, sodiumMg: 1.0 }
    ]
  },
  {
    code: "REC-PER-09",
    name: "Ensalada Fresca de Atún en Agua con Palta Fuerte y Huevo",
    category: "CENA",
    description: "Cena saciante, ligera y prácticamente libre de carbohidratos simples. Grasas monoinsaturadas cardiosaludables de la palta peruana y proteína de rápida asimilación.",
    prepTimeMinutes: 10,
    servings: 1,
    difficulty: "FACIL",
    tags: "CENA, LOW_CARB, KETO_COMPATIBLE, HIPERPROTEICO, DIGESTION_RAPIDA",
    instructionsJson: JSON.stringify([
      "Lavar y desinfectar las hojas de lechuga; trocearlas con las manos y colocarlas como base en un plato hondo.",
      "Drenar la lata de atún en agua y desmenuzarla sobre la lechuga.",
      "Cortar el tomate en gajos y la palta fuerte en dados medianos.",
      "Añadir el huevo duro en cuartos.",
      "Aliñar con zumo de limón fresco, una cucharadita de aceite de oliva, sal marina y orégano seco."
    ]),
    totalKcal: 374.5,
    totalProteinG: 34.2,
    totalFatG: 22.8,
    totalCarbsG: 7.8,
    totalFiberG: 5.2,
    totalIronMg: 3.1,
    totalZincMg: 2.4,
    totalCalciumMg: 72.0,
    totalSodiumMg: 380.0,
    ingredients: [
      { foodName: "Atún en lomitos en agua", category: "PROTEINA", netWeightG: 120, householdMeasure: "1 lata pequeña drenada", energyKcal: 139.2, proteinG: 30.6, fatG: 1.2, carbsG: 0.0, fiberG: 0.0, ironMg: 1.6, sodiumMg: 260.0 },
      { foodName: "Palta fuerte madura", category: "GRASA", netWeightG: 60, householdMeasure: "1/4 de palta mediana", energyKcal: 96.0, proteinG: 1.2, fatG: 9.0, carbsG: 4.2, fiberG: 3.6, ironMg: 0.4, sodiumMg: 4.0 },
      { foodName: "Huevo de gallina sancochado", category: "PROTEINA", netWeightG: 50, householdMeasure: "1 unidad entera", energyKcal: 77.5, proteinG: 6.3, fatG: 5.4, carbsG: 0.4, fiberG: 0.0, ironMg: 1.1, sodiumMg: 70.0 },
      { foodName: "Lechuga romana fresca", category: "VERDURA", netWeightG: 60, householdMeasure: "1 plato hondo lleno", energyKcal: 9.0, proteinG: 0.8, fatG: 0.2, carbsG: 1.6, fiberG: 1.0, ironMg: 0.5, sodiumMg: 12.0 },
      { foodName: "Tomate redondo fresco", category: "VERDURA", netWeightG: 50, householdMeasure: "1/2 unidad", energyKcal: 9.0, proteinG: 0.5, fatG: 0.1, carbsG: 2.0, fiberG: 0.6, ironMg: 0.2, sodiumMg: 4.0 },
      { foodName: "Aceite de oliva extra virgen", category: "GRASA", netWeightG: 5, householdMeasure: "1 cucharadita", energyKcal: 44.2, proteinG: 0.0, fatG: 5.0, carbsG: 0.0, fiberG: 0.0, ironMg: 0.0, sodiumMg: 0.0 }
    ]
  },
  {
    code: "REC-PER-10",
    name: "Mazamorra de Sangrecita con Pasas y Canela",
    category: "MEDIA_TARDE",
    description: "Refrigerio dulce tradicional adaptado por el CENAN para la prevención de anemia infantil y en gestantes. Aceptación sensorial excelente sin sabor ferroso.",
    prepTimeMinutes: 20,
    servings: 1,
    difficulty: "FACIL",
    tags: "MEDIA_TARDE, ANTIANEMICO, PEDIATRICO, DULCE_SALUDABLE",
    instructionsJson: JSON.stringify([
      "Sancochar la sangrecita con canela y clavo de olor; luego licuarla con un poco de agua hasta obtener una textura suave sin grumos.",
      "En una olla, hervir agua con cáscara de naranja, canela en rama y clavo.",
      "Disolver la maicena (fécula de maíz) en agua fría e incorporarla lentamente al agua hirviendo junto con la sangrecita licuada.",
      "Mover constantemente a fuego medio hasta que espese.",
      "Añadir las pasas y una cucharada de azúcar rubia o panela. Servir tibio con canela molida por encima."
    ]),
    totalKcal: 236.4,
    totalProteinG: 15.2,
    totalFatG: 0.8,
    totalCarbsG: 42.4,
    totalFiberG: 1.8,
    totalIronMg: 24.2,
    totalZincMg: 2.1,
    totalCalciumMg: 45.0,
    totalSodiumMg: 75.0,
    ingredients: [
      { foodName: "Sangrecita de pollo cocida y licuada", category: "PROTEINA", netWeightG: 80, householdMeasure: "3 cucharadas colmadas", energyKcal: 60.8, proteinG: 14.6, fatG: 0.2, carbsG: 0.1, fiberG: 0.0, ironMg: 23.6, sodiumMg: 68.0 },
      { foodName: "Fécula de maíz (Maicena)", category: "CEREAL", netWeightG: 20, householdMeasure: "1 cucharada colmada", energyKcal: 72.0, proteinG: 0.1, fatG: 0.0, carbsG: 17.6, fiberG: 0.2, ironMg: 0.1, sodiumMg: 2.0 },
      { foodName: "Pasas morenas", category: "FRUTA", netWeightG: 15, householdMeasure: "1 cucharada sopera", energyKcal: 45.0, proteinG: 0.5, fatG: 0.1, carbsG: 11.9, fiberG: 0.8, ironMg: 0.4, sodiumMg: 4.0 },
      { foodName: "Panela o azúcar morena", category: "AZUCAR", netWeightG: 15, householdMeasure: "1 cucharada sopera rasa", energyKcal: 58.5, proteinG: 0.0, fatG: 0.0, carbsG: 15.0, fiberG: 0.0, ironMg: 0.2, sodiumMg: 1.0 }
    ]
  }
];

async function main() {
  console.log("🌱 Sembrando Recetas Clínicas Peruanas Estandarizadas (CENAN / INS)...");

  for (const r of RECIPES_DATA) {
    const { ingredients, ...recipeData } = r;

    // Buscar si ya existe por código
    const existing = await prisma.recipe.findUnique({
      where: { code: r.code }
    });

    if (existing) {
      console.log(`- Receta existente: ${r.name}`);
      continue;
    }

    const created = await prisma.recipe.create({
      data: {
        ...recipeData,
        ingredients: {
          create: ingredients.map(ing => ({
            foodName: ing.foodName,
            category: ing.category,
            netWeightG: ing.netWeightG,
            householdMeasure: ing.householdMeasure,
            energyKcal: ing.energyKcal,
            proteinG: ing.proteinG,
            fatG: ing.fatG,
            carbsG: ing.carbsG,
            fiberG: ing.fiberG,
            ironMg: ing.ironMg,
            sodiumMg: ing.sodiumMg
          }))
        }
      }
    });

    console.log(`✅ Creada: ${created.name} (${created.totalKcal} kcal - ${ingredients.length} ingredientes)`);
  }

  console.log("✨ Semillas de recetas peruanas completadas exitosamente.");
}

main()
  .catch((e) => {
    console.error("❌ Error sembrando recetas:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
