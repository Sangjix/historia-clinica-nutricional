import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Activity,
  FileText,
  Utensils,
  Clock,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Stethoscope,
} from "lucide-react";
import { calculateAge, formatDate } from "@/lib/utils";
import EvolutionChart from "@/components/charts/EvolutionChart";
import NewConsultationModal from "./NewConsultationModal";
import EditConsultationModal from "./EditConsultationModal";
import PatientClinicalCalculator from "@/components/patient/PatientClinicalCalculator";
import SendSurveyModal from "@/components/patient/SendSurveyModal";
import EditSurveyModal from "@/components/patient/EditSurveyModal";
import PatientPreferencesCard from "@/components/patient/PatientPreferencesCard";

export const dynamic = "force-dynamic";

interface PatientPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientPage({ params }: PatientPageProps) {
  const { id } = await params;

  const patient = await db.patient.findUnique({
    where: { id },
    include: {
      preferenceSurvey: true,
      consultations: {
        orderBy: { date: "desc" },
        include: {
          anthropometry: true,
          dietPlan: true,
          biochemical: true,
        },
      },
    },
  });

  if (!patient) {
    notFound();
  }

  const age = calculateAge(patient.birthDate);
  const latestConsultation = patient.consultations[0];
  const latestAnthropo = latestConsultation?.anthropometry;
  const activeDiet = patient.consultations.find((c) => c.dietPlan)?.dietPlan;

  // Preparar datos ordenados cronológicamente para la gráfica evolutiva
  const chartData = [...patient.consultations]
    .reverse()
    .filter((c) => c.anthropometry)
    .map((c) => ({
      date: formatDate(c.date),
      weightKg: c.anthropometry!.weightKg,
      fatPercentage: c.anthropometry!.bodyFatPercentage,
      muscleMassKg: c.anthropometry!.muscleMassKg,
      bmi: c.anthropometry!.bmi,
    }));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Barra de Navegación Superior */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/pacientes"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {patient.firstName} {patient.lastName}
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                {patient.recordNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Expediente Clínico Nutricional • Creado el {formatDate(patient.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SendSurveyModal
            patientId={patient.id}
            patientName={`${patient.firstName} ${patient.lastName}`}
            patientPhone={patient.phone}
            patientEmail={patient.email}
          />
          <EditSurveyModal
            patientId={patient.id}
            patientName={`${patient.firstName} ${patient.lastName}`}
            initialSurvey={patient.preferenceSurvey}
          />
          <NewConsultationModal
            patientId={patient.id}
            defaultHeightCm={latestAnthropo?.heightCm || 165}
          />
        </div>
      </div>

      {/* Ficha Resumen del Paciente */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Columna 1: Avatar y Datos Básicos */}
        <div className="flex items-center gap-4 md:border-r border-slate-100 pr-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-emerald-200 flex-shrink-0">
            {patient.firstName[0]}
            {patient.lastName[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {age} años ({formatDate(patient.birthDate)})
            </p>
            <p className="text-xs text-slate-500">
              {patient.gender === "MALE" ? "Sexo Masculino" : "Sexo Femenino"}
            </p>
            {patient.documentId && (
              <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {patient.documentId}</p>
            )}
          </div>
        </div>

        {/* Columna 2: Contacto y Ubicación */}
        <div className="space-y-1.5 text-xs text-slate-600 md:border-r border-slate-100 pr-4 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{patient.phone || "Sin teléfono registrado"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{patient.email || "Sin email registrado"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{patient.city || "Sin ciudad"}</span>
          </div>
        </div>

        {/* Columna 3: Ocupación y Emergencias */}
        <div className="space-y-1.5 text-xs text-slate-600 md:border-r border-slate-100 pr-4 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{patient.occupation || "Ocupación no especificada"}</span>
          </div>
          {patient.emergencyNotes && (
            <div className="text-slate-500 text-xs bg-slate-50 p-2 rounded border border-slate-100 mt-1">
              <span className="font-semibold text-slate-700">Emergencia: </span>
              {patient.emergencyNotes}
            </div>
          )}
        </div>

        {/* Columna 4: Estado Antropométrico Actual */}
        <div className="flex flex-col justify-center items-start md:items-end">
          {latestAnthropo ? (
            <div className="text-left md:text-right">
              <div className="text-2xl font-bold text-slate-900">{latestAnthropo.weightKg} kg</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  IMC {latestAnthropo.bmi}
                </span>
                <span className="text-xs text-slate-500">{latestAnthropo.bmiClassification}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Estatura: {latestAnthropo.heightCm} cm
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-400">Sin antropometría registrada</div>
          )}
        </div>
      </div>

      {/* Tarjetas de Composición Corporal de la Última Consulta */}
      {latestAnthropo && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Peso Actual</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">{latestAnthropo.weightKg}</span>
              <span className="text-xs text-slate-400">kg</span>
            </div>
            {latestAnthropo.idealWeightKg && (
              <p className="text-xs text-slate-400 mt-1">Teórico: {latestAnthropo.idealWeightKg} kg</p>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">% Grasa Corporal</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-amber-600">
                {latestAnthropo.bodyFatPercentage ?? "--"}
              </span>
              <span className="text-xs text-slate-400">%</span>
            </div>
            {latestAnthropo.fatMassKg && (
              <p className="text-xs text-slate-400 mt-1">Masa grasa: {latestAnthropo.fatMassKg} kg</p>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Masa Magra / Muscular</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-blue-600">
                {latestAnthropo.muscleMassKg ?? latestAnthropo.leanMassKg ?? "--"}
              </span>
              <span className="text-xs text-slate-400">kg</span>
            </div>
            {latestAnthropo.leanMassKg && (
              <p className="text-xs text-slate-400 mt-1">MLG total: {latestAnthropo.leanMassKg} kg</p>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cintura y Cadera</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">
                {latestAnthropo.waistCm ?? "--"}
              </span>
              <span className="text-xs text-slate-400">cm</span>
            </div>
            {latestAnthropo.waistHipRatio && (
              <p className="text-xs text-slate-400 mt-1">ICC: {latestAnthropo.waistHipRatio}</p>
            )}
          </div>
        </div>
      )}

      {/* 🍽️ Preferencias y Hábitos Alimentarios (Cuestionario y Rechazos/Favoritos) */}
      <PatientPreferencesCard
        patientId={patient.id}
        patientName={`${patient.firstName} ${patient.lastName}`}
        patientPhone={patient.phone}
        patientEmail={patient.email}
        survey={patient.preferenceSurvey}
      />

      {/* 🧮 Calculadora Clínica Integrada al Expediente del Paciente */}
      <PatientClinicalCalculator
        patientId={patient.id}
        patientName={`${patient.firstName} ${patient.lastName}`}
        gender={patient.gender as any}
        ageYears={age}
        initialWeightKg={latestAnthropo?.weightKg || 65}
        initialHeightCm={latestAnthropo?.heightCm || 165}
        initialFolds={{
          triceps: latestAnthropo?.tricepsFoldMm,
          subscapular: latestAnthropo?.subscapularFoldMm,
          suprailiac: latestAnthropo?.suprailiacFoldMm,
          abdominal: latestAnthropo?.abdominalFoldMm,
        }}
      />

      {/* Gráfico de Evolución Temporal */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Evolución Antropométrica Temporal</h3>
            <p className="text-xs text-slate-500">
              Tendencia de Peso corporal (kg), Grasa (%) y Masa Muscular estimada en cada consulta.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            {chartData.length} Controles Registrados
          </span>
        </div>

        <EvolutionChart data={chartData} />
      </div>

      {/* Plan Nutricional Activo (si existe) */}
      {activeDiet && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xs overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{activeDiet.title}</h3>
                <p className="text-xs text-emerald-800 font-medium">
                  Objetivo: {activeDiet.goal} • {activeDiet.targetCaloriesKcal} kcal/día
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="px-3 py-1 rounded-lg bg-white border border-emerald-200 text-slate-700">
                🥩 Prot: {activeDiet.proteinGrams}g
              </span>
              <span className="px-3 py-1 rounded-lg bg-white border border-emerald-200 text-slate-700">
                🍞 Carbs: {activeDiet.carbsGrams}g
              </span>
              <span className="px-3 py-1 rounded-lg bg-white border border-emerald-200 text-slate-700">
                🥑 Grasas: {activeDiet.fatGrams}g
              </span>
            </div>
          </div>

          {/* Menús y tiempos de comida */}
          <div className="p-6 space-y-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Distribución de Tiempos de Comida Sugeridos
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {JSON.parse(activeDiet.mealsJson || "[]").map((meal: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span className="text-emerald-700 font-bold">{meal.name}</span>
                    <span className="text-slate-400 font-mono">{meal.time}</span>
                  </div>
                  <p className="text-xs text-slate-600">{meal.suggestedMenu}</p>
                </div>
              ))}
            </div>

            {/* Guías y Suplementación */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {activeDiet.generalGuidelines && (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-slate-700">
                  <span className="font-semibold text-blue-900 block mb-1">Pautas y Recomendaciones:</span>
                  {activeDiet.generalGuidelines}
                </div>
              )}
              {activeDiet.supplementsNotes && (
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-slate-700">
                  <span className="font-semibold text-amber-900 block mb-1">Suplementación Indicada:</span>
                  {activeDiet.supplementsNotes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Historial Cronológico de Consultas */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Historial Cronológico de Consultas</h3>
            <p className="text-xs text-slate-500">
              Registro médico de visitas, diagnósticos PES y notas clínicas.
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {patient.consultations.length} {patient.consultations.length === 1 ? "consulta" : "consultas"}
          </span>
        </div>

        <div className="space-y-6">
          {patient.consultations.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-xl border border-slate-200 bg-slate-50/30 hover:bg-slate-50 transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    #{c.consultationNumber}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {c.reasonForVisit}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(c.date)}
                  </span>
                  <EditConsultationModal consultation={c} />
                </div>
              </div>

              {/* Diagnóstico PES */}
              {c.nutritionalDiagnosisPES && (
                <div className="text-xs bg-emerald-50/70 text-emerald-950 p-3 rounded-lg border border-emerald-100">
                  <span className="font-bold text-emerald-800 block mb-0.5">Diagnóstico Nutricional (PES):</span>
                  {c.nutritionalDiagnosisPES}
                </div>
              )}

              {/* Notas de evolución */}
              {c.clinicalEvolutionNotes && (
                <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-800 block mb-0.5">Evolución Clínica:</span>
                  {c.clinicalEvolutionNotes}
                </div>
              )}

              {/* Mediciones de la consulta */}
              {c.anthropometry && (
                <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-600 font-medium">
                  <span className="bg-white px-2.5 py-1 rounded border border-slate-200">
                    Peso: <strong className="text-slate-900">{c.anthropometry.weightKg} kg</strong>
                  </span>
                  <span className="bg-white px-2.5 py-1 rounded border border-slate-200">
                    IMC: <strong className="text-slate-900">{c.anthropometry.bmi}</strong>
                  </span>
                  {c.anthropometry.bodyFatPercentage && (
                    <span className="bg-white px-2.5 py-1 rounded border border-slate-200 text-amber-700">
                      Grasa: <strong>{c.anthropometry.bodyFatPercentage}%</strong>
                    </span>
                  )}
                  {c.anthropometry.waistCm && (
                    <span className="bg-white px-2.5 py-1 rounded border border-slate-200">
                      Cintura: <strong>{c.anthropometry.waistCm} cm</strong>
                    </span>
                  )}
                  {c.nextAppointmentDate && (
                    <span className="text-emerald-700 font-medium ml-auto flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Próxima Cita: {formatDate(c.nextAppointmentDate)}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
