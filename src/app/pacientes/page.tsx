import { db } from "@/lib/db";
import Link from "next/link";
import { Users, Plus, Search, ChevronRight, FileText } from "lucide-react";
import { calculateAge, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PatientsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function PatientsPage({ searchParams }: PatientsPageProps) {
  const { q } = await searchParams;

  const patients = await db.patient.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { recordNumber: { contains: q } },
            { documentId: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    include: {
      consultations: {
        orderBy: { date: "desc" },
        take: 1,
        include: { anthropometry: true },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Directorio de Pacientes</h2>
          <p className="text-sm text-slate-500">
            Búsqueda, gestión y acceso a los expedientes de historia clínica nutricional.
          </p>
        </div>
        <Link
          href="/pacientes/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Registrar Nuevo Paciente
        </Link>
      </div>

      {/* Barra de Filtro y Búsqueda */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <form method="GET" action="/pacientes">
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder="Buscar por nombre, apellido, cédula/DNI o número de expediente..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </form>
        </div>
        {q && (
          <Link
            href="/pacientes"
            className="text-xs text-slate-500 hover:text-slate-800 px-3 py-2 border rounded-lg"
          >
            Limpiar filtro
          </Link>
        )}
      </div>

      {/* Tabla de Expedientes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Expediente</th>
                <th className="px-6 py-3.5">Paciente</th>
                <th className="px-6 py-3.5">Contacto</th>
                <th className="px-6 py-3.5">Último Peso / IMC</th>
                <th className="px-6 py-3.5">Última Visita</th>
                <th className="px-6 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((p) => {
                const latestConsultation = p.consultations[0];
                const anthropo = latestConsultation?.anthropometry;
                const age = calculateAge(p.birthDate);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-medium text-xs text-slate-700">
                      {p.recordNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        <Link href={`/pacientes/${p.id}`} className="hover:text-emerald-600 transition">
                          {p.firstName} {p.lastName}
                        </Link>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {age} años • {p.gender === "MALE" ? "Masculino" : "Femenino"}
                        {p.documentId && ` • Doc: ${p.documentId}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div>{p.phone || "Sin teléfono"}</div>
                      <div className="text-slate-400">{p.email || "Sin email"}</div>
                    </td>
                    <td className="px-6 py-4">
                      {anthropo ? (
                        <div>
                          <span className="font-semibold text-slate-800">{anthropo.weightKg} kg</span>
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                            IMC {anthropo.bmi}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Sin datos</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                      {latestConsultation ? formatDate(latestConsultation.date) : "Sin visitas"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/pacientes/${p.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Historia Clínica
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {patients.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p>No se encontraron expedientes con los criterios indicados.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
