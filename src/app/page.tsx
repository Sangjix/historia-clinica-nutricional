import { db } from "@/lib/db";
import Link from "next/link";
import {
  Users,
  Calendar,
  Activity,
  FileText,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  ChevronRight,
} from "lucide-react";
import { calculateAge, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [patientsCount, consultationsCount, recentPatients, upcomingConsultations] = await Promise.all([
    db.patient.count(),
    db.consultation.count(),
    db.patient.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        consultations: {
          orderBy: { date: "desc" },
          take: 1,
          include: { anthropometry: true },
        },
      },
    }),
    db.consultation.findMany({
      take: 4,
      orderBy: { date: "desc" },
      include: {
        patient: true,
        anthropometry: true,
      },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Saludo y Encabezado de Bienvenida */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Panel de Control Clínico
          </h2>
          <p className="text-sm text-slate-500">
            Resumen general de expedientes de pacientes, consultas y métricas nutricionales.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/calculadora"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition shadow-xs"
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            Calculadora Metabólica
          </Link>
          <Link
            href="/pacientes/nuevo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Registrar Paciente
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pacientes</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{patientsCount}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Activos en clínica
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Consultas Realizadas</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{consultationsCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Historial acumulado</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Próximos Controles</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">2</h3>
            <p className="text-xs text-slate-500 mt-1">Esta semana</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tasa de Adherencia</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">88%</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1">Preservación masa muscular</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Sección en 2 Columnas: Pacientes Recientes y Últimas Consultas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Pacientes Recientes (2 columnas) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-base">Expedientes Clínicos Activos</h3>
            <Link
              href="/pacientes"
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Ver todos ({patientsCount})
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentPatients.map((patient) => {
              const latestConsultation = patient.consultations[0];
              const latestAnthropo = latestConsultation?.anthropometry;
              const age = calculateAge(patient.birthDate);

              return (
                <div
                  key={patient.id}
                  className="p-5 hover:bg-slate-50/80 transition flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-sm border border-slate-200">
                      {patient.firstName[0]}
                      {patient.lastName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/pacientes/${patient.id}`}
                          className="font-semibold text-slate-900 hover:text-emerald-600 transition"
                        >
                          {patient.firstName} {patient.lastName}
                        </Link>
                        <span className="text-xs text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                          {patient.recordNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {age} años • {patient.gender === "MALE" ? "Masculino" : "Femenino"} • {patient.city || "Sin ciudad"}
                      </p>
                    </div>
                  </div>

                  {/* Datos antropométricos clave */}
                  <div className="flex items-center gap-6 text-right">
                    {latestAnthropo ? (
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          {latestAnthropo.weightKg} kg
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          IMC {latestAnthropo.bmi} ({latestAnthropo.bmiClassification.split(" ")[0]})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Sin consulta registrada</span>
                    )}

                    <Link
                      href={`/pacientes/${patient.id}`}
                      className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                      title="Ver Expediente"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {recentPatients.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No hay pacientes registrados aún.</p>
                <Link
                  href="/pacientes/nuevo"
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                >
                  Registrar primer paciente
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Últimas Consultas Realizadas (1 columna) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-base">Últimas Visitas Registradas</h3>
            </div>
            <div className="p-5 space-y-4">
              {upcomingConsultations.map((c) => (
                <div key={c.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {c.patient.firstName} {c.patient.lastName}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {formatDate(c.date)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 italic">
                    "{c.reasonForVisit}"
                  </p>
                  {c.anthropometry && (
                    <div className="flex items-center gap-3 pt-1 text-xs text-emerald-700 font-medium">
                      <span>Peso: {c.anthropometry.weightKg} kg</span>
                      <span>•</span>
                      <span>Grasa: {c.anthropometry.bodyFatPercentage ?? "--"}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 border-t border-slate-100 bg-slate-50/50">
            <Link
              href="/alimentos"
              className="block text-center py-2 px-4 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
            >
              Consultar Catálogo de Alimentos (SMAE)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
