import Link from "next/link";
import { ArrowLeft, UserPlus, FileText, Activity } from "lucide-react";
import { createPatient } from "../actions";

export default function NewPatientPage() {
  const suggestedRecord = `EXP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <Link
          href="/pacientes"
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Apertura de Expediente Clínico
          </h2>
          <p className="text-sm text-slate-500">
            Registro inicial de datos demográficos y antecedentes del paciente.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form action={createPatient} className="space-y-6">
        {/* 1. Datos de Identificación */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-semibold text-slate-800 text-base">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            1. Datos de Identificación y Contacto
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                N° de Expediente / Folio *
              </label>
              <input
                type="text"
                name="recordNumber"
                defaultValue={suggestedRecord}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nombres *
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="ej. Mariana"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Apellidos *
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="ej. Silva Castro"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                name="birthDate"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Sexo Biológico *
              </label>
              <select
                name="gender"
                required
                defaultValue="FEMALE"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="FEMALE">Femenino</option>
                <option value="MALE">Masculino</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Cédula / DNI / Identificación
              </label>
              <input
                type="text"
                name="documentId"
                placeholder="ej. 12345678-X"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Teléfono / WhatsApp
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="ej. +54 9 11 5555-1234"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                placeholder="ej. paciente@email.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Ciudad / Residencia
              </label>
              <input
                type="text"
                name="city"
                placeholder="ej. Madrid / Buenos Aires"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Ocupación / Profesión
              </label>
              <input
                type="text"
                name="occupation"
                placeholder="ej. Arquitecto / Horario rotativo"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Contacto de Emergencia y Parentesco
              </label>
              <input
                type="text"
                name="emergencyNotes"
                placeholder="ej. Carlos Silva (Hermano) - 555-9876"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Consulta Inicial y Antropometría Rápida (Opcional) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-semibold text-slate-800 text-base">
            <Activity className="w-5 h-5 text-emerald-600" />
            2. Primera Visita y Medición Inicial (Opcional)
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Motivo Principal de Consulta
            </label>
            <textarea
              name="initialReason"
              rows={2}
              placeholder="ej. Reeducación nutricional, pérdida de grasa corporal y control de digestiones pesadas."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Peso Inicial (kg)
              </label>
              <input
                type="number"
                step="0.1"
                name="initialWeight"
                placeholder="ej. 72.5"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Estatura / Talla Inicial (cm)
              </label>
              <input
                type="number"
                step="0.5"
                name="initialHeight"
                placeholder="ej. 168.0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/pacientes"
            className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-medium transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition"
          >
            Crear Expediente e Iniciar Consulta
          </button>
        </div>
      </form>
    </div>
  );
}
