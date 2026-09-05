"use client";

import { useState } from "react";
import { Plus, X, Activity, Calendar, Stethoscope, Save } from "lucide-react";
import { addConsultation } from "./consultation-actions";

interface NewConsultationModalProps {
  patientId: string;
  defaultHeightCm?: number;
}

export default function NewConsultationModal({
  patientId,
  defaultHeightCm = 165,
}: NewConsultationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await addConsultation(patientId, formData);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error al guardar la consulta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition"
      >
        <Plus className="w-4 h-4" />
        Registrar Nueva Consulta
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Encabezado del Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
                Registrar Consulta de Seguimiento / Control
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo de esta Consulta *
                </label>
                <input
                  type="text"
                  name="reasonForVisit"
                  required
                  placeholder="ej. Control mensual, revisión de analítica de lípidos y adherencia a menú."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Antropometría Rápida */}
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-xs text-emerald-800 uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Medición Antropométrica
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Peso Actual (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      name="weightKg"
                      required
                      placeholder="ej. 67.5"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Estatura (cm) *</label>
                    <input
                      type="number"
                      step="0.5"
                      name="heightCm"
                      defaultValue={defaultHeightCm}
                      required
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Cintura (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      name="waistCm"
                      placeholder="ej. 75.0"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Cadera (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      name="hipCm"
                      placeholder="ej. 98.0"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Pliegues para Faulkner (opcional) */}
                <div className="pt-2 border-t border-emerald-100/60">
                  <p className="text-xs text-slate-500 mb-2 font-medium">
                    Pliegues Cutáneos (mm) - Cálculo automático de % Grasa Faulkner:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Tríceps</label>
                      <input
                        type="number"
                        step="0.5"
                        name="tricepsFoldMm"
                        placeholder="mm"
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Subescapular</label>
                      <input
                        type="number"
                        step="0.5"
                        name="subscapularFoldMm"
                        placeholder="mm"
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Suprailíaco</label>
                      <input
                        type="number"
                        step="0.5"
                        name="suprailiacFoldMm"
                        placeholder="mm"
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Abdominal</label>
                      <input
                        type="number"
                        step="0.5"
                        name="abdominalFoldMm"
                        placeholder="mm"
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnóstico Nutricional PES */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diagnóstico Nutricional (Formato PES: Problema, Etiología, Signos/Síntomas)
                </label>
                <textarea
                  name="nutritionalDiagnosisPES"
                  rows={2}
                  placeholder="ej. Ingesta energética insuficiente (P) relacionada con falta de apetito post-entreno (E) evidenciada por pérdida de peso involuntaria de 1.5kg (S)."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                ></textarea>
              </div>

              {/* Notas de Evolución */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notas de Evolución Clínica y Acuerdos
                </label>
                <textarea
                  name="clinicalEvolutionNotes"
                  rows={2}
                  placeholder="ej. Paciente refiere excelente digestión. Se ajustan porciones de carbohidratos en la cena. Se refuerza hidratación de 2L diarios."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                ></textarea>
              </div>

              {/* Próxima Cita */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Fecha Estimada de Próximo Control
                </label>
                <input
                  type="date"
                  name="nextAppointmentDate"
                  className="w-full sm:w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? "Guardando..." : "Guardar Consulta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
