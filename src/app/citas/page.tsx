import { db } from "@/lib/db";
import AgendaCalendar from "@/components/agenda/AgendaCalendar";

export const revalidate = 0; // Datos siempre frescos

export default async function CitasPage() {
  const [appointments, rooms, patients] = await Promise.all([
    db.appointment.findMany({
      include: {
        patient: true,
        room: true,
      },
      orderBy: {
        date: "asc",
      },
    }),
    db.consultationRoom.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    db.patient.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        recordNumber: true,
      },
      orderBy: {
        lastName: "asc",
      },
    }),
  ]);

  const allPatients = patients.map((p) => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    recordNumber: p.recordNumber,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Agenda y Gestión de Citas Multi-Box
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Control de disponibilidad por consultorio físico, reducción de inasistencias (No-Shows) y despacho automatizado de recordatorios vía WhatsApp.
        </p>
      </div>

      <AgendaCalendar
        initialAppointments={appointments}
        rooms={rooms}
        allPatients={allPatients}
      />
    </div>
  );
}
