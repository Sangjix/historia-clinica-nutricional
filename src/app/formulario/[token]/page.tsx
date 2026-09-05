import { getPublicSurvey } from "@/actions/survey-actions";
import { notFound } from "next/navigation";
import PatientSurveyForm from "./PatientSurveyForm";
import { Apple, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

interface SurveyPageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicSurveyPage({ params }: SurveyPageProps) {
  const { token } = await params;
  const survey = await getPublicSurvey(token);

  if (!survey) {
    notFound();
  }

  const patientName = `${survey.patient.firstName} ${survey.patient.lastName}`;
  const isCompleted = survey.status === "COMPLETED";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Barra superior de marca institucional */}
      <header className="max-w-3xl mx-auto flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
            <Apple className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">NutriClinic</h2>
            <p className="text-[11px] text-slate-400">Atención Nutricional Profesional</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Formulario Confidencial</span>
        </div>
      </header>

      <main>
        <PatientSurveyForm
          token={token}
          patientName={patientName}
          initialData={survey}
          alreadyCompleted={isCompleted}
        />
      </main>

      <footer className="max-w-3xl mx-auto mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400 space-y-1">
        <p>NutriClinic • Sistema de Historia Clínica y Prescripción Nutricional</p>
        <p className="text-[10px]">Tus datos están protegidos bajo estricto secreto profesional y confidencialidad médica.</p>
      </footer>
    </div>
  );
}
