# 📋 BITÁCORA DE DESARROLLO - SISTEMA DE HISTORIA CLÍNICA NUTRICIONAL PROFESIONAL (NutriClinic / NutriRecord)

---

## 📌 1. Información General del Proyecto
- **Proyecto:** Software Profesional de Registro y Gestión de Historia Clínica Nutricional.
- **Objetivo:** Brindar a profesionales de la nutrición (nutriólogos, dietistas, clínicas nutricionales) una plataforma moderna, segura, ágil y visual para el registro clínico, evaluación antropométrica, cálculo dietético, prescripción de planes de alimentación y seguimiento de pacientes.
- **Fecha de Inicio:** 2026-09-04
- **Estado Actual:** **Fase 5 Completada - Sistema Desplegado en Producción en Google Cloud (Always Free) con Dominio Seguro HTTPS y SSL Oficial (https://nutrirecord.duckdns.org).**

---

## 🎯 2. Alcance Funcional y Módulos Clínicos

El sistema implementa la metodología clínica estandarizada del **Proceso de Atención Nutricional (PAN / NCP)**:

1. **Gestión de Pacientes:**
   - Ficha de identificación demográfica, datos de contacto, ocupación y motivo de consulta.
   - Directorio con buscador en tiempo real por nombre, folio o documento.
2. **Historia Clínica y Consultas Editables:**
   - Registro cronológico de consultas con diagnóstico en formato **PES** (Problema, Etiología, Signos/Síntomas).
   - **Edición completa de cada consulta:** Posibilidad de modificar motivo, notas de evolución, fecha de próximo control y mediciones antropométricas (peso, talla, pliegues, circunferencias).
3. **Calculadora Clínica Integrada al Expediente del Paciente:**
   - Acceso inmediato a la calculadora metabólica y antropométrica dentro de la historia del paciente (`/pacientes/[id]`).
   - Precarga automática de sexo, edad exacta, último peso registrado, talla y pliegues cutáneos.
   - Cálculo en vivo de GEB (Mifflin, Harris-Benedict, FAO/OMS), GET, distribución de macronutrientes (g, % y g/kg), % grasa Faulkner y somatotipo Heath-Carter.
4. **Bases Bromatológicas Oficiales y Tabla de Equivalencias Sugeridas:**
   - **🇵🇪 TPCA (Tabla Peruana de Composición de Alimentos - CENAN / INS 2017):** 928 alimentos oficiales analizados en 100g.
   - **🇵🇪 TAFERA 2016 VF (Tabla Auxiliar para la Formulación y Evaluación de Regímenes Alimentarios - CENAN / INS):**
     - Módulo I: 1,023 porciones evaluadas según unidad de consumo y medida casera con pesos brutos y netos.
     - Módulo II: 165 factores de conversión de cocido a crudo (FC).
   - **⭐ Tabla de Equivalencias Sugeridas y Medidas Caseras (Intercambios en Vivo):**
     - Herramienta interactiva y tabla maestra que calcula las equivalencias proporcionales exactas para cualquier valor prescrito (ej. **10 g de CHO = 48g de papa amarilla, 42g de camote, 17g de pan francés, 38g de arroz cocido, 45g de quinua, 15g de avena**).
     - Incluye la medida casera de referencia estandarizada de la TAFERA y el valor calórico asociado.
     - Soporte para Carbohidratos (CHO), Proteínas de Alto Valor Biológico (Pollo, Sangrecita, Huevo, Pescado bonito, Queso) y Grasas (Aceite de oliva, Palta, Aceituna, Maní).
5. **Seguimiento y Gráficos Evolutivos:**
   - Curvas dinámicas con Recharts (peso, grasa y masa muscular a lo largo del tiempo).

---

## 🔬 3. Investigación y Referencias (Skills y Repositorios)

### 3.1. Repositorios y Documentos Técnicos Oficiales
| Fuente / Proyecto | Institución / Referencia | Utilidad para este Proyecto |
| :--- | :--- | :--- |
| **TPCA 2017** | Instituto Nacional de Salud (INS) / CENAN Perú | Base de datos bromatológica oficial de 928 alimentos peruanos de costa, sierra y selva. |
| **TAFERA 2016 VF** | MINSA / INS / CENAN (Documento técnico 2016) | Estandarización de 1,023 medidas caseras peruanas y 165 factores de conversión cocido/crudo. |
| **OpenEMR** | `github.com/openemr/openemr` | Referente en arquitectura de historias clínicas electrónicas y control de accesos. |
| **OMS Anthro** | `who.int/tools/child-growth-standards` | Tablas de percentiles para evaluación antropométrica. |

---

## 🛠️ 4. Stack Tecnológico Implementado

- **Frontend & Backend (Fullstack):** Next.js 15.1 + React 19 + TypeScript.
- **Estilos:** Tailwind CSS + Lucide React.
- **Base de Datos & ORM:** Prisma ORM con SQLite (`prisma/dev.db`), models: `PeruvianFood`, `TaferaFoodPortion`, `TaferaConversionFactor`, `Patient`, `Consultation`, `AnthropometryRecord`, `DietPlan`.
- **Ingesta de Datos:** Script automatizado en Python con `pymupdf` y `sqlite3` (`ingest_peruvian_data.py`).
- **Visualización:** Recharts.
- **Testing Unitario:** Vitest.

---

## 📅 5. Registro Cronológico de Cambios y Decisiones (Log)

### [2026-09-04] - Fase 0: Inicialización y Definición Arquitectónica
- Creación de bitácora inicial, estructura modular y plan de implementación.

### [2026-09-04] - Fase 1: Implementación del Core Clínico y Plataforma
- Modelado de dominio en TypeScript (`src/types/clinical.ts`).
- Motores metabólicos y antropométricos testeados (8/8 tests exitosos).
- Base de datos relacional inicial y vistas de Dashboard, Pacientes e Historia Clínica con Recharts.

### [2026-09-04] - Fase 2: Ingesta Oficial de TPCA 2017 y TAFERA 2016 VF
- Descarga y extracción de `TAFERA 2016 VF.pdf` (CENAN/INS) y `alimentos.csv` (TPCA 2017).
- Ingesta de 928 alimentos peruanos, 1,023 porciones de consumo y 165 factores de cocción (FC).
- Actualización de `/alimentos` con pestañas interactivas.

### [2026-09-04] - Fase 3: Calculadora Integrada, Edición de Consultas y Tabla de Equivalencias
- **Calculadora Clínica en cada Historia Nutricional:**
  - Creación del componente `PatientClinicalCalculator.tsx`.
  - Integración en `src/app/pacientes/[id]/page.tsx` con datos precargados del paciente en tiempo real (edad, sexo, último peso, talla y pliegues).
- **Opción de Edición en Cada Consulta:**
  - Creación de la Server Action `updateConsultation` en `consultation-actions.ts`.
  - Creación del componente modal `EditConsultationModal.tsx`.
  - Botón "Editar" disponible en cada consulta del historial del paciente para actualizar motivos, diagnósticos PES, evolución y antropometría.
- **Tabla de Equivalencias Sugeridas y Medidas Caseras:**
  - Creación del componente interactivo `SuggestedEquivalencesTable.tsx`.
  - Calculadora dinámica que convierte cualquier cantidad indicada (ej. 10 g de CHO) en gramos exactos de papa blanca, papa amarilla, camote, pan francés, arroz, quinua, avena, yuca, fideos, etc., mostrando la medida casera sugerida según TAFERA.
  - Pestaña 5 dedicada en `/alimentos?tab=equivalencias`.
- **Verificación:** Compilación de producción con `next build` exitosa (4.0s).

### [2026-09-04] - Fase 4: Formulario de Preferencias Alimentarias, Visor Oficial TAFERA y PWA Offline
- **Formulario de Gustos, Preferencias y Hábitos del Paciente:**
  - Modelo relacional `PatientPreferenceSurvey` con token único de acceso seguro y caducidad automática de 30 días.
  - Server Actions en `src/actions/survey-actions.ts` para generación de tokens, envío público y edición clínica.
  - **Página pública para el paciente (`/formulario/[token]`):** Interfaz amigable y mobile-first con selección de alergias, preferencias (favoritos vs. aversiones/rechazos), horarios de comida y hábitos culinarios sin necesidad de contraseña.
  - **Acciones en la Historia Clínica (`/pacientes/[id]`):**
    - Botón **"Enviar Formulario"** con modal para compartir link directo, botón verde de **WhatsApp directo** con mensaje pre-armado y botón de correo electrónico.
    - Botón adyacente **"Editar Formulario"** para que el nutricionista cargue o modifique las respuestas en consulta presencial o videollamada.
    - Componente **`PatientPreferencesCard`** que exhibe de forma visual el perfil de gustos (🟢 Favoritos, 🔴 Alimentos Rechazados, ⚠️ Alergias, Relojes de Horarios de Comida y Rutina diaria).
- **Disponibilidad Total y Acceso Backend:**
  - Endpoint de streaming `src/app/api/documentos/tafera-pdf/route.ts` para visualización y descarga directa del documento oficial de 6.1 MB `TAFERA_2016_VF.pdf`.
  - Nueva pestaña 6 en `/alimentos?tab=pdf` con visor embebido de alta resolución y botones de descarga oficial.
  - Endpoint `src/app/api/backup/route.ts` para respaldo y descarga en 1 clic de la base de datos local SQLite (`dev.db`).
- **PWA (Progressive Web App) y Servidor Súper Ligero:**
  - Configuración `output: 'standalone'` en `next.config.ts` (<100 MB RAM, listo para **Oracle Cloud Always Free** o **Google Cloud VM**).
  - Service Worker en `public/sw.js` con estrategia network-first y caché de contingencia para funcionamiento sin internet en consultorios.
  - Manifiesto PWA en `src/app/manifest.ts` y componente de registro `PwaRegister.tsx` en `layout.tsx` para permitir instalación en Windows, tablets o smartphones.
- **Verificación:** 8/8 tests unitarios pasando, compilación `next build` limpia con 0 errores y servidor de desarrollo activo en `http://localhost:3000`.

### [2026-09-05] - Fase 5: Despliegue en Producción en Google Cloud (Always Free) y Dominio Seguro HTTPS
- **Infraestructura Cloud:**
  - Creación y encendido de máquina virtual `nutriclinic-server` en Google Compute Engine (`e2-micro`, 1 GB RAM, 30 GB SSD persistente, región `us-central1-a`, IP Externa `136.114.156.160`).
  - Configuración de cortafuegos de red para tráfico HTTP (puerto 80) y HTTPS (puerto 443).
  - Puesta en marcha automatizada con `setup-server.sh` configurando 2 GB de memoria Swap, Node.js 20 LTS, Nginx como proxy inverso y PM2 como gestor de procesos 24/7.
- **Dominio Seguro y Certificado SSL:**
  - Registro de subdominio dinámico `nutrirecord.duckdns.org` vinculado a la IP estática del servidor.
  - Generación e instalación de certificado de seguridad oficial Let's Encrypt mediante Certbot con redirección automática HTTP -> HTTPS y renovación automática en segundo plano.
  - URL de acceso en vivo para pacientes y profesionales: **`https://nutrirecord.duckdns.org`**.

---

## 📌 6. Backlog y Próximas Funcionalidades (Anotaciones para Desarrollo Posterior)

### 6.1. Módulo de Formulario de Gustos, Preferencias y Hábitos del Paciente
- **Objetivo Clínico:** Obtener información exhaustiva sobre gustos, aversiones, alergias/intolerancias, hábitos culinarios y horarios de comida del paciente para la formulación personalizada y precisa de su plan de alimentación.
- **Flujo de Interacción:**
  1. **Envío del Formulario:**
     - Botón principal **"Enviar Formulario"** en la ficha/historia clínica del paciente.
     - Métodos de envío:
       - **Vía Correo Electrónico:** Envío directo de invitación con enlace personalizado.
       - **Vía Link Directo / WhatsApp:** Generación de enlace tokenizado único para compartir por WhatsApp o cualquier app de mensajería sin necesidad de que el paciente inicie sesión.
  2. **Edición y Revisión Directa:**
     - Botón adyacente **"Editar Formulario"** al lado del botón de envío. Permite al profesional de nutrición cargar o modificar las respuestas durante la consulta presencial o videollamada.
  3. **Integración con la Historia Clínica:**
     - Los datos completados por el paciente deben consolidarse y visualizarse de manera clara y destacada en el expediente (`/pacientes/[id]`).
     - Impacto directo en el módulo de prescripción dietética: vinculación automática para excluir alimentos no deseados y sugerir alimentos favoritos del catálogo TPCA/TAFERA.

### 6.2. Disponibilidad Total, Lectura Óptima y Acceso Local/Backend a Datos
- **Objetivo Técnico:** Garantizar que toda la información bromatológica (TPCA 2017 y TAFERA 2016 VF), historias clínicas y formularios estén 100% accesibles localmente desde el backend y la base de datos sin depender de conexiones o servicios de terceros externos.
- **Acciones Clave:**
  - Garantizar carga fluida, indexada y visualmente responsiva de las tablas nutricionales.
  - Asegurar que los documentos de referencia técnica (PDF oficial TAFERA y fichas técnicas) estén disponibles para consulta y descarga directa desde el backend local.
  - Diseñar la persistencia en base de datos local (SQLite/PostgreSQL) para funcionamiento offline o en entornos de conectividad limitada.

