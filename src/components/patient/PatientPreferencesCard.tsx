import {
  Heart,
  Ban,
  Clock,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Coffee,
  Droplets,
  Activity,
  Utensils,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import SendSurveyModal from "./SendSurveyModal";
import EditSurveyModal from "./EditSurveyModal";

interface PatientPreferencesCardProps {
  patientId: string;
  patientName: string;
  patientPhone?: string | null;
  patientEmail?: string | null;
  survey: any | null;
}

export default function PatientPreferencesCard({
  patientId,
  patientName,
  patientPhone,
  patientEmail,
  survey,
}: PatientPreferencesCardProps) {
  const isCompleted = survey?.status === "COMPLETED";
  const hasData = isCompleted || !!survey?.favoriteFoods || !!survey?.dislikedFoods;

  const allergies: string[] = survey?.allergiesJson
    ? JSON.parse(survey.allergiesJson)
    : [];

  const dietLabels: Record<string, string> = {
    OMNIVORE: "Omnívoro",
    VEGETARIAN: "Vegetariano",
    VEGAN: "Vegano",
    PESCETARIAN: "Pescetariano",
    OTHER: "Otro",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Encabezado de la Tarjeta */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shadow-2xs">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Preferencias y Hábitos Alimentarios
              </h3>
              {isCompleted ? (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Respondido {survey?.completedAt ? `(${formatDate(survey.completedAt)})` : ""}
                </span>
              ) : survey ? (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  Pendiente de respuesta
                </span>
              ) : (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  Sin cuestionario enviado
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Información del paciente para la formulación personalizada de su menú y régimen dietético
            </p>
          </div>
        </div>

        {/* Botones de Acción juntos */}
        <div className="flex items-center gap-2">
          <SendSurveyModal
            patientId={patientId}
            patientName={patientName}
            patientPhone={patientPhone}
            patientEmail={patientEmail}
          />
          <EditSurveyModal
            patientId={patientId}
            patientName={patientName}
            initialSurvey={survey}
          />
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {!hasData ? (
          <div className="py-8 text-center max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Utensils className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Aún no se han registrado las preferencias de {patientName}
            </p>
            <p className="text-xs text-slate-500">
              Puedes enviarle el cuestionario por <strong>WhatsApp</strong> o <strong>correo</strong> para que lo responda desde su móvil, o cargarlo tú mismo haciendo clic en <strong>"Editar Formulario"</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-6 text-xs">
            {/* Fila 1: Alergias y Tipo de Dieta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Alergias */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
                <p className="font-bold text-amber-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Alergias / Intolerancias
                </p>
                {allergies.length > 0 || survey?.otherAllergies ? (
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap gap-1">
                      {allergies.map((a) => (
                        <span
                          key={a}
                          className="px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-900 font-semibold text-[11px]"
                        >
                          ⚠️ {a}
                        </span>
                      ))}
                    </div>
                    {survey?.otherAllergies && (
                      <p className="text-amber-800 text-[11px] pt-1 border-t border-amber-200/60">
                        {survey.otherAllergies}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-amber-700/80 italic text-[11px]">
                    No refiere alergias alimentarias diagnosticadas.
                  </p>
                )}
              </div>

              {/* Alimentos Favoritos */}
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <p className="font-bold text-emerald-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                  <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                  Alimentos Favoritos (Priorizar)
                </p>
                <p className="text-emerald-950 font-medium leading-relaxed">
                  {survey?.favoriteFoods || "No especificado"}
                </p>
              </div>

              {/* Alimentos Rechazados */}
              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2">
                <p className="font-bold text-rose-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                  <Ban className="w-4 h-4 text-rose-600" />
                  Rechazos / Aversiones (Excluir)
                </p>
                <p className="text-rose-950 font-medium leading-relaxed">
                  {survey?.dislikedFoods || "No especificado"}
                </p>
              </div>
            </div>

            {/* Fila 2: Horarios de Comida */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Horarios Habituales de Ingesta
                </p>
                {survey?.dietType && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold text-[11px]">
                    Patrón: {dietLabels[survey.dietType] || survey.dietType}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-center">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Desayuno</p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    {survey?.breakfastTime || "--:--"}
                  </p>
                </div>

                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Col. Mañana</p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    {survey?.morningSnack || "--:--"}
                  </p>
                </div>

                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Almuerzo</p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    {survey?.lunchTime || "--:--"}
                  </p>
                </div>

                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Col. Tarde</p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    {survey?.afternoonSnack || "--:--"}
                  </p>
                </div>

                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Cena</p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    {survey?.dinnerTime || "--:--"}
                  </p>
                </div>
              </div>
            </div>

            {/* Fila 3: Rutina y Hábitos */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <Coffee className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Cocina / Tiempo</p>
                  <p className="text-slate-700 font-medium mt-0.5">
                    {survey?.cookingHabits || "No indicado"}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <Utensils className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Comidas fuera / Delivery</p>
                  <p className="text-slate-700 font-medium mt-0.5">
                    {survey?.diningOut || "No indicado"}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <Droplets className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Agua pura diaria</p>
                  <p className="text-slate-700 font-medium mt-0.5">
                    {survey?.waterIntake || "No indicado"}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <Activity className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Actividad física</p>
                  <p className="text-slate-700 font-medium mt-0.5">
                    {survey?.physicalActivity || "No indicada"}
                  </p>
                </div>
              </div>
            </div>

            {survey?.additionalNotes && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                <span className="font-bold text-slate-700">Notas adicionales: </span>
                {survey.additionalNotes}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
