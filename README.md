# 🥗 NutriRecord - Sistema Profesional de Historia Clínica Nutricional

Software integral de grado clínico diseñado para profesionales de la nutrición, dietistas y centros de salud metabólica. Desarrollado con una arquitectura moderna Fullstack TypeScript, orientada a la seguridad de datos, precisión antropométrica y agilidad en la consulta diaria.

---

## 🚀 Características Principales

1. **Expediente de Historia Clínica Nutricional:**
   - Ficha de identificación demográfica y contacto de emergencia.
   - Diagnóstico Nutricional estandarizado en formato **PES** (Problema, Etiología, Signos/Síntomas).
   - Historial de consultas cronológicas con notas de evolución clínica.

2. **Evaluación Antropométrica y Composición Corporal:**
   - Cálculo automático de **IMC / BMI** con estratificación de la Organización Mundial de la Salud (OMS).
   - Cálculo de peso ideal teórico (fórmulas de Devine, Hamwi, Lorentz y rango saludable Metropolitano).
   - Estimación de porcentaje de grasa por pliegues cutáneos (**Faulkner 4 pliegues** y **Jackson-Pollock**).
   - Desglose de compartimentos: Masa Grasa (kg), Masa Libre de Grasa (MLG) y Masa Muscular estimada.
   - Evaluación de riesgo cardiometabólico con Índice Cintura-Cadera (ICC) e Índice Cintura-Estatura (ICE).
   - Somatotipo de **Heath-Carter** (Endomorfia, Mesomorfia, Ectomorfia y coordenadas para somatocarta).

3. **Gráficos Evolutivos Interactivos:**
   - Curvas temporales de peso, porcentaje graso y masa muscular a lo largo de las consultas del paciente.

4. **Prescripción Dietoterapéutica y Plan Nutricional:**
   - Cálculo de gasto energético basal (**Mifflin-St Jeor**, **Harris-Benedict 1984**, **Katch-McArdle**, **FAO/OMS**).
   - Ajuste por factor de actividad física, efecto térmico de los alimentos (ETA) y factor de estrés.
   - Cálculo de calorías objetivo según meta (déficit para pérdida de grasa, mantenimiento, superávit para hipertrofia, recomposición).
   - Distribución de macronutrientes en gramos, porcentajes y g/kg de peso corporal.
   - Planificador de tiempos de comida y menú sugerido.

5. **Catálogo Bromatológico de Alimentos:**
   - Sistema de alimentos equivalentes (SMAE / USDA) clasificados por grupos: Cereales, Verduras, Frutas, Leguminosas, Proteínas (POA), Lácteos y Grasas saludables.

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 15 (App Router, Server Actions, React 19).
- **Lenguaje:** TypeScript estricto.
- **Estilos:** Tailwind CSS con paleta clínica y moderna.
- **Base de Datos & ORM:** Prisma ORM con SQLite (local-first, listo para migrar a PostgreSQL si se requiere).
- **Gráficos:** Recharts para visualizaciones dinámicas de composición corporal.
- **Iconografía:** Lucide React.
- **Testing:** Vitest para validación unitaria de ecuaciones matemáticas y antropométricas.

---

## 📦 Instalación y Puesta en Marcha

### 1. Clonar o ingresar a la carpeta del proyecto
```bash
cd "c:\HISTORIA CLINICA"
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Inicializar la Base de Datos SQLite
```bash
npx prisma db push
```

### 4. Poblar con datos de prueba (Pacientes, consultas y alimentos)
```bash
npm run prisma:seed
```

### 5. Ejecutar en modo desarrollo
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 🧪 Pruebas Unitarias Clínicas

Para verificar la exactitud de los algoritmos metabólicos y fórmulas antropométricas:
```bash
npm test
```

---

## 📋 Estructura del Proyecto

```text
HISTORIA CLINICA/
├── BITACORA.md                         # Bitácora viva de desarrollo
├── README.md                           # Guía del sistema
├── prisma/
│   ├── schema.prisma                   # Modelado relacional de datos de salud
│   └── seed.ts                         # Semilla con SMAE y pacientes de prueba
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Layout con sidebar y navegación clínica
│   │   ├── page.tsx                    # Dashboard principal con métricas
│   │   ├── pacientes/
│   │   │   ├── page.tsx                # Directorio y buscador de expedientes
│   │   │   ├── actions.ts              # Server actions de pacientes
│   │   │   ├── nuevo/page.tsx          # Formulario de alta de paciente
│   │   │   └── [id]/                   # Historia Clínica individual
│   │   │       ├── page.tsx            # Vista integral del expediente y consultas
│   │   │       ├── consultation-actions.ts # Registro de nuevas consultas
│   │   │       └── NewConsultationModal.tsx # Modal interactivo de consulta
│   │   ├── calculadora/page.tsx        # Calculadora metabólica y antropométrica
│   │   └── alimentos/page.tsx          # Buscador de catálogo bromatológico
│   ├── components/
│   │   └── charts/
│   │       └── EvolutionChart.tsx      # Gráficos evolutivos de pacientes
│   ├── lib/
│   │   ├── db.ts                       # Singleton de Prisma Client
│   │   ├── utils.ts                    # Utilidades de fechas y clases
│   │   └── formulas/                   # Motores de cálculo nutricional
│   │       ├── bmr-tdee.ts             # Mifflin, Harris-Benedict, Katch-McArdle, TDEE
│   │       ├── body-composition.ts     # IMC, Faulkner, Devine, Hamwi, compartimentos
│   │       ├── somatotype.ts           # Heath-Carter
│   │       └── __tests__/              # Tests unitarios con Vitest
│   └── types/
│       └── clinical.ts                 # Tipos TypeScript para el dominio médico
```
