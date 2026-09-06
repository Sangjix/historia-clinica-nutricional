"use client";

import { Printer, ArrowLeft, HeartPulse, CheckCircle2, TrendingDown, TrendingUp, Calendar, User } from "lucide-react";
import Link from "next/link";

interface ReportProps {
  patient: {
    id: string;
    recordNumber: string;
    firstName: string;
    lastName: string;
    birthDate: Date | string;
    gender: string;
    phone: string | null;
    email: string | null;
    city: string | null;
    consultations: any[];
  };
}

export default function EvolutionPdfReport({ patient }: ReportProps) {
  const consultations = patient.consultations;
  const initialConsultation = consultations[0];
  const latestConsultation = consultations[consultations.length - 1];

  const initialAnthro = initialConsultation?.anthropometry;
  const latestAnthro = latestConsultation?.anthropometry;

  // Cálculo de diferencias (Antes vs. Después)
  const weightDiff = latestAnthro?.weightKg && initialAnthro?.weightKg
    ? parseFloat((latestAnthro.weightKg - initialAnthro.weightKg).toFixed(1))
    : 0;

  const fatDiff = latestAnthro?.bodyFatPercentage && initialAnthro?.bodyFatPercentage
    ? parseFloat((latestAnthro.bodyFatPercentage - initialAnthro.bodyFatPercentage).toFixed(1))
    : 0;

  const muscleDiff = latestAnthro?.muscleMassKg && initialAnthro?.muscleMassKg
    ? parseFloat((latestAnthro.muscleMassKg - initialAnthro.muscleMassKg).toFixed(1))
    : 0;

  const waistDiff = latestAnthro?.waistCm && initialAnthro?.waistCm
    ? parseFloat((latestAnthro.waistCm - initialAnthro.waistCm).toFixed(1))
    : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Barra de Acciones Superior (Oculta al imprimir) */}
      <div className="print:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <Link
          href={`/pacientes/${patient.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la Historia Clínica
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Guardar como PDF
          </button>
        </div>
      </div>

      {/* DOCUMENTO DEL REPORTE EJECUTIVO (A4 Maquetado) */}
      <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-md max-w-4xl mx-auto print:shadow-none print:border-none print:p-0">
        {/* Encabezado Institucional */}
        <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <HeartPulse className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">NutriRecord</h1>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Centro Especializado de Nutrición Clínica y Composición Corporal
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-gray-400 block uppercase">Informe Clínico Ejecutivo</span>
            <span className="text-sm font-semibold text-gray-800">
              Fecha de Emisión: {new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Datos Generales del Paciente */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-8">
          <div>
            <span className="text-gray-400 block font-medium">Paciente</span>
            <span className="text-sm font-bold text-gray-900 block mt-0.5">
              {patient.firstName} {patient.lastName}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Folio / N° Historia</span>
            <span className="text-sm font-bold text-emerald-700 block mt-0.5">
              {patient.recordNumber}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Sexo y Ciudad</span>
            <span className="text-sm font-bold text-gray-900 block mt-0.5">
              {patient.gender === "MALE" ? "Masculino" : "Femenino"} {patient.city ? `• ${patient.city}` : ""}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Consultas Realizadas</span>
            <span className="text-sm font-bold text-indigo-700 block mt-0.5">
              {consultations.length} {consultations.length === 1 ? "sesión" : "sesiones"}
            </span>
          </div>
        </div>

        {/* Tabla Comparativa de Evolución (Antes vs. Después) */}
        <div className="mb-8">
          <h2 className="text-base font-black text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Evolución de Composición Corporal y Antropometría
          </h2>

          <div className="overflow-hidden border border-gray-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-emerald-700 text-white font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3">Indicador Clínico</th>
                  <th className="p-3 text-center">
                    Cita Inicial ({initialConsultation ? new Date(initialConsultation.date).toLocaleDateString() : "-"})
                  </th>
                  <th className="p-3 text-center">
                    Último Control ({latestConsultation ? new Date(latestConsultation.date).toLocaleDateString() : "-"})
                  </th>
                  <th className="p-3 text-center">Variación Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="p-3 font-bold text-gray-900">Peso Corporal Total</td>
                  <td className="p-3 text-center text-gray-700">{initialAnthro?.weightKg ? `${initialAnthro.weightKg} kg` : "-"}</td>
                  <td className="p-3 text-center font-bold text-gray-900">{latestAnthro?.weightKg ? `${latestAnthro.weightKg} kg` : "-"}</td>
                  <td className="p-3 text-center font-black">
                    <span className={`inline-flex items-center gap-1 ${weightDiff < 0 ? "text-emerald-600" : weightDiff > 0 ? "text-rose-600" : "text-gray-500"}`}>
                      {weightDiff > 0 ? `+${weightDiff} kg` : `${weightDiff} kg`}
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-gray-50 bg-slate-50/50">
                  <td className="p-3 font-bold text-gray-900">Porcentaje de Grasa Corporal (Faulkner / BIA)</td>
                  <td className="p-3 text-center text-gray-700">{initialAnthro?.bodyFatPercentage ? `${initialAnthro.bodyFatPercentage}%` : "-"}</td>
                  <td className="p-3 text-center font-bold text-gray-900">{latestAnthro?.bodyFatPercentage ? `${latestAnthro.bodyFatPercentage}%` : "-"}</td>
                  <td className="p-3 text-center font-black">
                    <span className={`inline-flex items-center gap-1 ${fatDiff < 0 ? "text-emerald-600" : fatDiff > 0 ? "text-rose-600" : "text-gray-500"}`}>
                      {fatDiff < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : fatDiff > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : null}
                      {fatDiff > 0 ? `+${fatDiff}%` : `${fatDiff}%`}
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="p-3 font-bold text-gray-900">Masa Muscular Esquelética (kg)</td>
                  <td className="p-3 text-center text-gray-700">{initialAnthro?.muscleMassKg ? `${initialAnthro.muscleMassKg} kg` : "-"}</td>
                  <td className="p-3 text-center font-bold text-gray-900">{latestAnthro?.muscleMassKg ? `${latestAnthro.muscleMassKg} kg` : "-"}</td>
                  <td className="p-3 text-center font-black">
                    <span className={`inline-flex items-center gap-1 ${muscleDiff > 0 ? "text-emerald-600 font-black" : "text-gray-600"}`}>
                      {muscleDiff > 0 ? `+${muscleDiff} kg` : `${muscleDiff} kg`}
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-gray-50 bg-slate-50/50">
                  <td className="p-3 font-bold text-gray-900">Circunferencia de Cintura</td>
                  <td className="p-3 text-center text-gray-700">{initialAnthro?.waistCm ? `${initialAnthro.waistCm} cm` : "-"}</td>
                  <td className="p-3 text-center font-bold text-gray-900">{latestAnthro?.waistCm ? `${latestAnthro.waistCm} cm` : "-"}</td>
                  <td className="p-3 text-center font-black">
                    <span className={`inline-flex items-center gap-1 ${waistDiff < 0 ? "text-emerald-600" : "text-gray-600"}`}>
                      {waistDiff > 0 ? `+${waistDiff} cm` : `${waistDiff} cm`}
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="p-3 font-bold text-gray-900">Índice de Masa Corporal (IMC)</td>
                  <td className="p-3 text-center text-gray-700">{initialAnthro?.bmi ? `${initialAnthro.bmi}` : "-"}</td>
                  <td className="p-3 text-center font-bold text-gray-900">{latestAnthro?.bmi ? `${latestAnthro.bmi}` : "-"}</td>
                  <td className="p-3 text-center font-bold text-gray-800">{latestAnthro?.bmiClassification || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Diagnóstico PES y Conclusiones del Tratamiento */}
        <div className="mb-8 p-5 bg-emerald-50/60 rounded-xl border border-emerald-200">
          <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            Diagnóstico Nutricional PES & Logros del Tratamiento
          </h3>
          <p className="text-xs text-emerald-950 font-medium leading-relaxed">
            {latestConsultation?.nutritionalDiagnosisPES ||
              "Paciente en proceso de optimización corporal con reducción progresiva de tejido adiposo y preservación de masa libre de grasa."}
          </p>
          {latestConsultation?.clinicalEvolutionNotes && (
            <p className="text-xs text-gray-700 mt-2 pt-2 border-t border-emerald-200/60 italic">
              <strong>Nota de Evolución:</strong> {latestConsultation.clinicalEvolutionNotes}
            </p>
          )}
        </div>

        {/* Recomendaciones Generales para el Paciente */}
        <div className="mb-10 text-xs space-y-2 border-t border-gray-200 pt-5">
          <h4 className="font-bold text-gray-800 uppercase tracking-wider">
            Recomendaciones para el Siguiente Periodo:
          </h4>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>Mantener el consumo diario de agua estructurado y los tiempos de comida acordados en la anamnesis.</li>
            <li>Priorizar los alimentos de intercambio sugeridos de acuerdo a la tabla de equivalencias de la TAFERA.</li>
            <li>Realizar los controles antropométricos y de bioimpedancia en las fechas programadas para validar la preservación de masa muscular.</li>
          </ul>
        </div>

        {/* Firma y Sello del Profesional */}
        <div className="pt-8 border-t border-gray-200 flex justify-between items-end text-xs">
          <div>
            <p className="text-gray-400">NutriRecord Software Clínico Profesional v1.1</p>
            <p className="text-gray-400 text-[10px]">Copia emitida para el paciente y archivo en expediente</p>
          </div>
          <div className="text-center w-56 border-t border-gray-400 pt-2">
            <span className="font-bold text-gray-900 block">Lic. Nutrición Clínica</span>
            <span className="text-gray-500 text-[11px] block">Colegio de Nutricionistas del Perú</span>
          </div>
        </div>
      </div>
    </div>
  );
}
