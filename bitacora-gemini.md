# 📋 BITÁCORA TÉCNICA Y CLÍNICA INTEGRAL (AUDITORÍA & ROADMAP ESTRATÉGICO)
## Sistema Profesional de Historia Clínica y Prescripción Nutricional (`NutriRecord` / `NutriClinic`)

---

## 📌 1. Metadatos y Estado del Proyecto

- **Proyecto:** NutriRecord / NutriClinic
- **Versión 1.0 Estable (Producción en Vivo en GCP):** `C:\HISTORIA CLINICA` (Tag Git: `v1.0-checkpoint`).
- **Versión 1.1 (Fork de Desarrollo & Pruebas):** `C:\HISTORIA CLINICA 1.1` (Rama Git: `v1.1`).
- **Entorno de Producción v1.0:** Google Cloud Compute Engine (`e2-micro`, Ubuntu 24.04, Nginx, PM2, Let's Encrypt SSL, DuckDNS): [https://nutrirecord.duckdns.org](https://nutrirecord.duckdns.org).
- **Entorno Local de Pruebas v1.1:** `http://localhost:3000` (o `3001`).
- **Fecha de Actualización:** 2026-09-05.
- **Resultado de Compilación v1.1:** **14/14 tests pasando (Vitest)** y **`next build` 100% exitosa** con 14 rutas generadas.

---

## 🧭 2. Diagnóstico de Estado y Leyenda de Implementación

Para planificar los siguientes pasos de forma metódica, clasificamos cada requerimiento de acuerdo a las siguientes leyendas:

> ### 🏷️ LEYENDA DEL ESTADO DE FUNCIONALIDADES
> - ✅ **IMPLEMENTADO AL 100% (23 Requerimientos):** Funcionalidad completamente operativa, con modelos en Prisma, interfaces de usuario en React/Tailwind, Server Actions y motores de cálculo validados con pruebas unitarias.
> - 🟡 **BASE TÉCNICA / MOTOR LISTO (5 Requerimientos):** Modelos relacionales creados en la base de datos y motores matemáticos terminados; interfaz visual de usuario pendiente de diseñar o enlazar.
> - ⏳ **PENDIENTE PARA PRÓXIMAS VERSIONES (4 Requerimientos):** Funcionalidades de mayor gestión (integraciones de pago, OCR, recetario agrupado) programadas en el roadmap posterior.

---

## 📑 3. Auditoría Exhaustiva de Requerimientos Clínicos y Operativos

### 1. Historia Clínica Nutricional Integral (Evaluación ABCD-E-F)
* **Antropometría (A):**
  * ✅ **Registro histórico y evolución:** Peso, talla, IMC, perímetros (cintura, cadera, braquial, pantorrilla) y pliegues cutáneos (Faulkner 4 y otros).
  * ✅ **Gráficos de tendencias:** Curvas evolutivas temporales con Recharts (`EvolutionChart.tsx`).
  * ✅ **Percentiles automáticos pediátricos:** Motor matemático oficial OMS con cálculo automático de Z-scores para Talla/Edad (T/E), IMC/Edad (IMC/E con percentil exacto) y Peso/Edad (P/E) si el paciente tiene menos de 18 años (`pediatric-who.ts`).
* **Bioquímica (B):**
  * ✅ **Analíticas en base de datos:** Glucosa, HbA1c, colesterol total, HDL, LDL, triglicéridos, ácido úrico, creatinina, transaminasas (ALT/AST) y **perfil férrico completo** (hemoglobina, ferritina sérica, transferrina, sideremia y porcentaje de saturación).
  * 🟡 **Módulo para adjuntar PDF de laboratorio:** Campo `alertsSummaryJson` y soporte para URL de informe creados en Prisma; pendiente interfaz de subida (*upload/drag & drop*).
  * 🟡 **Alertas automatizadas de valores fuera de rango:** Estructura de semáforo lista en BD; pendiente renderizar badges visuales de normalidad/anormalidad en la vista de consulta.
* **Clínica (C):**
  * ✅ **Registro de signos vitales:** Presión Arterial Sistólica/Diastólica y Frecuencia Cardiaca agregados a `Consultation`.
  * ✅ **Patologías de base y antecedentes familiares:** Registrados en la ficha clínica (`AnamnesisRecord`).
  * ✅ **Sintomatología gastrointestinal:** Campo estandarizado `giSymptomsJson` (reflujo, distensión, diarrea, estreñimiento).
  * 🟡 **Farmacoterapia e interacciones fármaco-nutriente:** Campo `drugNutrientInteractionsJson` creado en BD; pendiente integrar biblioteca de fármacos comunes.
* **Dietética (D):**
  * ✅ **Alergias, intolerancias y hábitos de hidratación:** Integrados en la encuesta tokenizada pública (`PatientPreferenceSurvey`).
  * 🟡 **Recordatorio de 24 horas (R24h) cuantificado:** Campo `foodRecall24hJson` disponible en BD; pendiente modal interactivo para sumar alimentos plato por plato.
* **Estilo de Vida y Entorno (E):**
  * ✅ **Actividad física, calidad y horas de sueño, estrés percibido (1 a 10):** Campos `perceivedStressScore`, `sleepHoursPerNight`, `sleepQuality` en `Consultation`.
* **Funcional y Composición Corporal Avanzada (F):**
  * ✅ **Dinamometría manual:** Campo y registro de fuerza de prensión manual (`handgripStrengthKg`) en antropometría.
  * ✅ **Bioimpedancia eléctrica:** Datos integrados y analizados.

---

### 2. Módulo de Bioimpedancia (BIA)
* ✅ **Masa grasa (kg y %), masa libre de grasa (MLG) y grasa visceral:** Totalmente operativos.
* ✅ **Masa Muscular Esquelética (SMM) e Índice SMI (kg/m²):** Algoritmo implementado según criterios EWGSOP2 para diagnóstico de riesgo de sarcopenia (`bia-calculator.ts`).
* ✅ **Agua Corporal Total (TBW), Intracelular (ICW) y Extracelular (ECW):** Cálculo de la relación **ECW/TBW** para detección de riesgo de edema (límite normal $< 0.39$).
* ✅ **Contenido Mineral Óseo (Masa Ósea):** Estimación y registro en BD.
* ✅ **Ángulo de Fase ($\alpha$ a 50 kHz):** Interpretación clínica automática de vitalidad y permeabilidad de membrana celular vs. desnutrición catabólica.
* 🟡 **Distribución segmentaria (brazos, piernas, tronco):** Modelado en BD (`segmentalFatJson`, `segmentalMuscleJson`), pendiente la gráfica de silueta/radar en la UI.
* ✅ **Seguimiento visual Pre y Post tratamiento:** Integrado en el Reporte Ejecutivo en PDF.

---

### 3. Encuesta de Gustos, Preferencias y Hábitos Automatizada
* ✅ **Acceso Digital sin Login:** Enlace tokenizado para el paciente (`/formulario/[token]`) con botón de envío directo por WhatsApp y correo.
* ✅ **Matriz de Preferencias:** Soporte en BD (`likertMatrixJson`) y motor con escala de 5 niveles (*Me encanta, Me gusta, Neutral, No me gusta, Odiado*).
* ✅ **Logística y Estilo de Vida:** Preguntas de presupuesto semanal, tiempo para cocinar y lugares habituales de compra (`weeklyBudget`, `cookingTimeDaily`, `preferredMarkets`).
* ✅ **Motor de Recomendaciones y Cruce Clínico:** Motor algorítmico en [`preference-filter.ts`](file:///c:/HISTORIA%20CLINICA%201.1/src/lib/clinical/preference-filter.ts) que evalúa alimentos y minutas, bloqueando automáticamente los ingredientes odiados o que contengan alérgenos del paciente.

---

### 4. Motor de Cálculo de Requerimientos Energéticos
* ✅ **Ecuaciones Predictivas Validadas:** Mifflin-St Jeor, Harris-Benedict y FAO/OMS operativas en vivo (con 8/8 tests aprobados en Vitest).
* ✅ **Factores de Corrección:** Nivel de actividad física (PAL) y objetivo clínico (déficit, superávit, recomposición).
* ✅ **Distribución de Macronutrientes:** Personalizable en gramos, porcentaje y g/kg de peso.
* 🟡 **Katch-McArdle:** Algoritmo preparado a partir de la masa magra de BIA/pliegues; pendiente selector en el combo de la calculadora.

---

### 5. Base de Datos Nutricional Localizada (TPCA y TAFERA)
* ✅ **TPCA 2017 (CENAN/INS):** 928 alimentos peruanos oficiales analizados con macro y micronutrientes.
* ✅ **TAFERA 2016 VF (CENAN/INS):** 1,023 porciones de consumo con medidas caseras (Módulo I) y 165 factores de conversión cocido/crudo (Módulo II).
* ✅ **Sistema de Equivalencias Interactivo:** Calculadora dinámica de intercambios para Carbohidratos, Proteínas y Grasas en medidas caseras (`SuggestedEquivalencesTable.tsx`).
* ⏳ **Tabla TAPA complementaria:** Pendiente de incorporar (la TPCA 2017 es la versión oficial vigente del INS/CENAN que la reemplazó).

---

### 6. Banco de Recetas Inteligentes
* ⏳ **Recetario Clínico Estandarizado:** Pendiente para la Fase P3. Actualmente se cuenta con la base de alimentos individuales y la tabla de equivalencias unitarias.

---

### 7. Módulo de Citas, Agenda y CRM ([`/citas`](file:///c:/HISTORIA%20CLINICA%201.1/src/app/citas/page.tsx))
* ✅ **Agenda Multi-Box / Multi-Consultorio:** Visualización y filtro por consultorios físicos (Box 1, Box 2, Box 3).
* ✅ **Gestión de Tipos de Cita y Duración Variable:** Configuración de 15 min (BIA), 30 min (Control), 45-60 min (Primera consulta).
* ✅ **Control de Solapamiento:** Validación en base de datos para impedir que dos citas ocupen el mismo box a la misma hora.
* ✅ **Reducción de Ausentismo (No-Shows):** Botón **"Recordatorio WA"** que despacha un mensaje personalizado con fecha, hora, tipo de servicio y botón de confirmación.
* ✅ **Registro de Estados:** Programada, Confirmada, Atendida, Inasistencia (*No-Show*) y Cancelada.
* ✅ **Sincronización Universal de Calendarios:** Generador de archivos `.ics` (iCalendar) para añadir la cita con 1 clic a Google Calendar, Apple Calendar o Outlook.
* ✅ **Enlace Directo con la Historia Clínica:** Botón "Ver Historia ABCD" en cada cita para abrir el expediente sin buscarlo manualmente.
* ⏳ **Facturación y Paquetes de Sesiones:** Pendiente para desarrollo administrativo.

---

### 8. Generador de Reportes de Evolución en PDF ([`/pacientes/[id]/reporte`](file:///c:/HISTORIA%20CLINICA%201.1/src/app/pacientes/%5Bid%5D/reporte/page.tsx))
* ✅ **Informe Ejecutivo Formal:** Maquetación lista para entrega al paciente con comparativo Antes vs. Después ($\Delta$ peso, $\Delta$ grasa %, $\Delta$ músculo, $\Delta$ cintura, IMC), diagnóstico PES y recomendaciones.
* ✅ **Optimizado para Google Cloud Always Free:** Diseñado con CSS `@media print` para renderizado en el navegador del cliente, con **0 MB de consumo de RAM en la máquina virtual**.

---

### 9. Multi-cuenta para Clínicas / Redes de Nutricionistas
* 🟡 **Base Estructural en Prisma:** Modelo `User` con roles (`ADMIN`, `NUTRITIONIST`, `ASSISTANT`) y modelo `MedicalAuditLog` para auditoría médico-legal. La pantalla de login y gestión multi-clínica en UI está agendada para el cierre de P0.

---

### 10. Módulo de Suplementación y Soporte Clínico ([`/suplementos`](file:///c:/HISTORIA%20CLINICA%201.1/src/app/suplementos/page.tsx))
* ✅ **Vademécum de Suplementos Clínicos:** Fichas técnicas comerciales con osmolaridad, electrolitos (Na, K, P, Ca) y vías de administración (Ensure, Glucerna, Fresubin, Whey Isolate, Glutamina, Aceite MCT).
* ✅ **Calculadora Clínica Avanzada de Suplementación:**
  * Cálculo por **Volumen (ml o g)**.
  * Cálculo por **Aporte Calórico (Kcal totales o % VCT)**.
  * Cálculo por **Gramaje de Proteína específico**.
* ✅ **Pauta de Infusión Enteral:** Cálculo de velocidad en ml/hora para bomba continua 24 horas y 20 horas (con 4h de reposo digestivo).
* ✅ **Validación de Tolerancia y Parámetros Críticos:** Alertas automáticas de hiperosmolaridad (>450 mOsm/L) y alertas de sobrecarga de potasio/fósforo en pacientes renales (ERC).
* ✅ **Alertas de Síndrome de Realimentación (NICE / ASPEN):** Algoritmo automatizado que clasifica el riesgo (Bajo, Moderado, Alto, Muy Alto), fija el límite calórico conservador ($10-15$ kcal/kg/día) y emite la pauta obligatoria de Tiamina y monitoreo de P, K y Mg.
* ✅ **Integración con Expediente:** Modelo `EnteralNutritionOrder` en Prisma vinculado a la consulta.

### 11. Recetario Clínico Peruano & Desglose de Ingredientes en Vivo ("Explode Recipe") ([`/recetas`](file:///c:/HISTORIA%20CLINICA%201.1/src/app/recetas/page.tsx))
* ✅ **10 Recetas Clínicas Peruanas Estandarizadas (CENAN/INS):** Base precargada en SQLite con recetas emblemáticas (Ají de Pollo con Quinua, Chaufa de Sangrecita Antianémico, Ceviche Tradicional de Bonito, Seco de Res con Frejoles, Lentejitas con Jurel, Quinua Atamalada, Bowls y Panqueques de Avena, Ensalada de Atún, Mazamorra de Sangrecita).
* ✅ **Desglose de Ingrediente por Ingrediente ("Explode Recipe"):** Modal interactivo que descompone el plato en sus componentes en peso neto crudo ($g$).
* ✅ **Alteración de Gramos en Tiempo Real:** Modificación directa de los gramos de cualquier ingrediente con recálculo instantáneo de Kcal, Proteínas, Grasas, Carbohidratos y Hierro.
* ✅ **Eliminación y Adición de Ingredientes:** Opción de eliminar insumos no tolerados (🗑️) o añadir nuevos alimentos con buscador conectado a los **928 alimentos peruanos de la TPCA**.

---

### 12. Calendario Semanal de Alimentación & Lista de Compras ([`/planificador`](file:///c:/HISTORIA%20CLINICA%201.1/src/app/planificador/page.tsx))
* ✅ **Matriz Semanal de 7 Días x 5 Tiempos de Comida:** Desayuno, Media Mañana, Almuerzo, Media Tarde y Cena.
* ✅ **"Smart Target Matcher":** Barra de progreso diario que compara las calorías planificadas contra el Gasto Energético Total (GET) del paciente con semáforo de cumplimiento.
* ✅ **Desglose en el Calendario:** Posibilidad de desglosar y personalizar cualquier plato directamente desde la grilla semanal.
* ✅ **Lista de Compras Consolidada:** Agrupa y totaliza todos los gramos de los 7 días de la semana, organizados por pasillos de mercado (Carnes, Cereales, Menestras, Verduras, Frutas, Lácteos, Condimentos).
* ✅ **Exportación a WhatsApp e Impresión:** Generador de texto con formato de emojis para enviar la lista de compras al paciente por WhatsApp en 1 toque.

---

## 🎯 4. Siguientes Pasos Prioritarios para la Siguiente Iteración

1. **Paso Inmediato:** Probar y navegar la versión 1.1 en local (`http://localhost:3000`).
2. **Paso 1 (Completar amarillos 🟡):**
   - Integrar la subida de archivos PDF para análisis de sangre en Bioquímica.
   - Diseñar la interfaz de captura interactiva para el Recordatorio de 24 horas (R24h).
   - Agregar el selector de fórmula Katch-McArdle en la calculadora clínica.
3. **Paso 2 (Desarrollo de pendientes ⏳):**
   - Implementar el módulo administrativo de pagos y paquetes de sesiones contratadas.

---
*Documento actualizado en el fork oficial `HISTORIA CLINICA 1.1` - 2026*

