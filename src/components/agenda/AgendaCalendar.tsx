"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Plus,
  FileDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CalendarCheck,
  Download,
} from "lucide-react";
import { updateAppointmentStatus } from "@/actions/appointment-actions";

interface Room {
  id: string;
  name: string;
  description: string | null;
}

interface Patient {
  id: string;
  recordNumber: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
}

interface AppointmentItem {
  id: string;
  patientId: string;
  date: Date | string;
  durationMinutes: number;
  type: string;
  status: string;
  notes: string | null;
  patient: Patient;
  room: Room | null;
}

// Convierte fecha a formato local YYYY-MM-DD sin desfase UTC
function toLocalDateStr(d: Date | string): string {
  const dt = new Date(d);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Genera URL de Web Intent para Google Calendar (Guardar en 1 clic)
function getGoogleCalendarUrl(app: AppointmentItem): string {
  const start = new Date(app.date);
  const end = new Date(start.getTime() + (app.durationMinutes || 30) * 60000);

  const formatGCal = (d: Date) =>
    d.toISOString().replace(/-|:|\.\d+/g, "");

  const title = `Cita Nutricional: ${app.patient.firstName} ${app.patient.lastName}`;
  const details = `Paciente: ${app.patient.firstName} ${app.patient.lastName}\nTeléfono: ${
    app.patient.phone || "No registrado"
  }\nServicio: ${
    app.type === "FIRST_VISIT"
      ? "Primera Consulta / Evaluación Completa"
      : app.type === "BIA_EVALUATION"
      ? "Evaluación de Bioimpedancia (BIA)"
      : "Control Nutricional"
  }\nNotas: ${app.notes || "Ninguna"}\nConsultorio: ${app.room?.name || "Box Nutricional"}`;
  const location = app.room?.name || "Consultorio Nutricional NutriRecord";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${formatGCal(start)}/${formatGCal(end)}`,
    details: details,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Descarga archivo nativo .ICS para Apple Calendar, Outlook y Windows
function downloadIcsFile(app: AppointmentItem) {
  const start = new Date(app.date);
  const end = new Date(start.getTime() + (app.durationMinutes || 30) * 60000);

  const formatIcs = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NutriRecord//Agenda Clinica 1.1//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${app.id}@nutrirecord.local`,
    `DTSTAMP:${formatIcs(new Date())}`,
    `DTSTART:${formatIcs(start)}`,
    `DTEND:${formatIcs(end)}`,
    `SUMMARY:Cita Nutricional - ${app.patient.firstName} ${app.patient.lastName}`,
    `DESCRIPTION:Servicio: ${app.type}. Paciente: ${app.patient.firstName} ${app.patient.lastName}. Notas: ${
      app.notes || "Ninguna"
    }`,
    `LOCATION:${app.room?.name || "Consultorio Nutricional"}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cita-${app.patient.lastName.replace(/\s+/g, "_")}-${toLocalDateStr(
    app.date
  )}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AgendaCalendar({
  initialAppointments,
  rooms,
  allPatients,
}: {
  initialAppointments: AppointmentItem[];
  rooms: Room[];
  allPatients: { id: string; name: string; recordNumber: string }[];
}) {
  const [appointments, setAppointments] = useState<AppointmentItem[]>(initialAppointments);
  const [viewMode, setViewMode] = useState<"ALL_UPCOMING" | "DAILY">("ALL_UPCOMING");
  const [selectedRoom, setSelectedRoom] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedDate, setSelectedDate] = useState<string>(toLocalDateStr(new Date()));
  const [showNewModal, setShowNewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrado de citas (Soporta vista general y por día específico con fecha local corregida)
  const filteredAppointments = appointments.filter((app) => {
    const appDateStr = toLocalDateStr(app.date);
    const matchesDate = viewMode === "ALL_UPCOMING" || appDateStr === selectedDate;
    const matchesRoom = selectedRoom === "ALL" || app.room?.id === selectedRoom;
    const matchesStatus = selectedStatus === "ALL" || app.status === selectedStatus;
    return matchesDate && matchesRoom && matchesStatus;
  });

  const handleStatusChange = async (
    id: string,
    newStatus: "CONFIRMED" | "ATTENDED" | "CANCELLED" | "NO_SHOW"
  ) => {
    try {
      await updateAppointmentStatus(id, newStatus);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
    } catch (err: any) {
      alert("Error al actualizar estado: " + err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" /> Confirmada
          </span>
        );
      case "ATTENDED":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
            <CheckCircle className="w-3.5 h-3.5" /> Atendida
          </span>
        );
      case "NO_SHOW":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
            <AlertTriangle className="w-3.5 h-3.5" /> Inasistencia (No-Show)
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
            <XCircle className="w-3.5 h-3.5" /> Cancelada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" /> Programada
          </span>
        );
    }
  };

  const openWhatsAppReminder = (app: AppointmentItem) => {
    const patientName = `${app.patient.firstName} ${app.patient.lastName}`;
    const phone = app.patient.phone?.replace(/\D/g, "") || "";
    const dateStr = new Date(app.date).toLocaleDateString("es-PE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const timeStr = new Date(app.date).toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const roomName = app.room?.name || "Consultorio Principal";

    const gcalUrl = getGoogleCalendarUrl(app);

    const msg = `👋 Hola *${patientName}*, te saludamos de NutriRecord / Consultorio Nutricional.\n\n📅 Te recordamos tu cita para el *${dateStr}* a las *${timeStr}* en el *${roomName}*.\n\n⏱️ Tipo: ${
      app.type === "FIRST_VISIT"
        ? "Evaluación Completa"
        : app.type === "BIA_EVALUATION"
        ? "Bioimpedancia (BIA)"
        : "Control Nutricional"
    }.\n\n📅 Puedes agregarla a tu Google Calendar haciendo clic aquí:\n${gcalUrl}\n\n✅ Por favor responde *SÍ* para confirmar tu asistencia o avísanos si necesitas reprogramar. ¡Te esperamos!`;

    const url = phone
      ? `https://wa.me/${phone.startsWith("51") ? phone : "51" + phone}?text=${encodeURIComponent(
          msg
        )}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Selector de Modo de Vista (Todas las Citas vs. Día Específico) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("ALL_UPCOMING")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              viewMode === "ALL_UPCOMING"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            Todas las Citas Agendadas ({appointments.length})
          </button>
          <button
            onClick={() => setViewMode("DAILY")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              viewMode === "DAILY"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Ver por Día Específico
          </button>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Nueva Cita
        </button>
      </div>

      {/* Barra de Filtros y Controles de Fecha */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        {viewMode === "DAILY" ? (
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
            />
            <button
              onClick={() => {
                const d = new Date(selectedDate + "T12:00:00");
                d.setDate(d.getDate() - 1);
                setSelectedDate(toLocalDateStr(d));
              }}
              className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition"
              title="Día anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSelectedDate(toLocalDateStr(new Date()))}
              className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
            >
              Hoy
            </button>
            <button
              onClick={() => {
                const d = new Date(selectedDate + "T12:00:00");
                d.setDate(d.getDate() + 1);
                setSelectedDate(toLocalDateStr(d));
              }}
              className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition"
              title="Día siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Mostrando listado cronológico de todas las citas agendadas
          </div>
        )}

        {/* Filtros por Box y Estado */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">🏢 Todos los Consultorios / Boxes</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="SCHEDULED">🟡 Programadas</option>
            <option value="CONFIRMED">🟢 Confirmadas</option>
            <option value="ATTENDED">🔵 Atendidas</option>
            <option value="NO_SHOW">🔴 Inasistencias (No-Show)</option>
            <option value="CANCELLED">⚪ Canceladas</option>
          </select>
        </div>
      </div>

      {/* Listado de Citas */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-600" />
            {viewMode === "ALL_UPCOMING"
              ? `Citas Registradas en el Sistema (${filteredAppointments.length})`
              : `Citas del Día (${filteredAppointments.length})`}
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            {viewMode === "DAILY" ? `Fecha: ${selectedDate}` : "Vista Global"}
          </span>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Clock className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-gray-600 font-medium">
              {viewMode === "DAILY"
                ? `No hay citas programadas para el día ${selectedDate}.`
                : "No hay citas que coincidan con los filtros seleccionados."}
            </p>
            {viewMode === "DAILY" && appointments.length > 0 && (
              <p className="text-xs text-emerald-700 font-semibold">
                Tienes {appointments.length} citas registradas en otras fechas.{" "}
                <button
                  onClick={() => setViewMode("ALL_UPCOMING")}
                  className="underline hover:text-emerald-900"
                >
                  Ver todas las citas
                </button>
              </p>
            )}
            <div>
              <button
                onClick={() => setShowNewModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs sm:text-sm font-semibold rounded-xl transition"
              >
                <Plus className="w-4 h-4" /> Programar Cita Ahora
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredAppointments.map((app) => {
              const dt = new Date(app.date);
              const dateFormatted = dt.toLocaleDateString("es-PE", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              const timeStr = dt.toLocaleTimeString("es-PE", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const gcalUrl = getGoogleCalendarUrl(app);

              return (
                <div
                  key={app.id}
                  className="p-5 hover:bg-gray-50 transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Caja de Fecha y Hora */}
                    <div className="px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-center min-w-[95px] flex-shrink-0">
                      <span className="text-xs font-bold text-emerald-700 block uppercase">
                        {dateFormatted}
                      </span>
                      <span className="text-base font-black block mt-0.5">{timeStr}</span>
                      <span className="text-[11px] font-semibold text-emerald-600 block">
                        {app.durationMinutes} min
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <Link
                          href={`/pacientes/${app.patientId}`}
                          className="text-base font-bold text-gray-900 hover:text-emerald-600 transition flex items-center gap-1.5"
                        >
                          {app.patient.firstName} {app.patient.lastName}
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                        </Link>
                        {getStatusBadge(app.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-1.5">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          Folio: {app.patient.recordNumber}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {app.room?.name || "Sin Box Asignado"}
                        </span>
                        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {app.type === "FIRST_VISIT"
                            ? "Primera Evaluación"
                            : app.type === "BIA_EVALUATION"
                            ? "Bioimpedancia (BIA)"
                            : "Control Nutricional"}
                        </span>
                      </div>

                      {app.notes && (
                        <p className="text-xs text-gray-600 mt-1.5 italic bg-gray-50 p-2 rounded-lg">
                          Nota: {app.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acciones y Botones de Guardar en Calendario Personal */}
                  <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto justify-end">
                    {/* Botón WhatsApp Recordatorio */}
                    <button
                      onClick={() => openWhatsAppReminder(app)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm transition"
                      title="Enviar recordatorio por WhatsApp con enlace a Google Calendar"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Recordatorio WA
                    </button>

                    {/* Botón Guardar en Google Calendar (1 Clic) */}
                    <a
                      href={gcalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition"
                      title="Abrir y guardar directamente en tu Google Calendar personal"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
                      Google Cal
                    </a>

                    {/* Botón Descargar archivo .ICS (Apple / Outlook / Windows) */}
                    <button
                      onClick={() => downloadIcsFile(app)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 transition"
                      title="Descargar archivo .ics para agregar a Apple Calendar, Outlook o el calendario nativo del móvil"
                    >
                      <Download className="w-3.5 h-3.5 text-gray-500" />
                      .ICS
                    </button>

                    {/* Botón Confirmar */}
                    {app.status !== "CONFIRMED" && app.status !== "ATTENDED" && (
                      <button
                        onClick={() => handleStatusChange(app.id, "CONFIRMED")}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg transition"
                      >
                        Confirmar
                      </button>
                    )}

                    {/* Botón Asistió */}
                    {app.status !== "ATTENDED" && (
                      <button
                        onClick={() => handleStatusChange(app.id, "ATTENDED")}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold rounded-lg transition"
                      >
                        Atendida
                      </button>
                    )}

                    {/* Botón No-Show */}
                    {app.status !== "NO_SHOW" && (
                      <button
                        onClick={() => handleStatusChange(app.id, "NO_SHOW")}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition"
                      >
                        No-Show
                      </button>
                    )}

                    {/* Enlace directo a Historia Clínica */}
                    <Link
                      href={`/pacientes/${app.patientId}`}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition"
                    >
                      Historia ABCD
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Nueva Cita */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-600" />
              Agendar Nueva Cita
            </h3>

            <form
              action={async (formData) => {
                setIsSubmitting(true);
                try {
                  const { createAppointment } = await import("@/actions/appointment-actions");
                  await createAppointment(formData);
                  setShowNewModal(false);
                  window.location.reload();
                } catch (err: any) {
                  alert(err.message || "Error al agendar cita.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Paciente *
                </label>
                <select
                  name="patientId"
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Selecciona un paciente...</option>
                  {allPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Folio: {p.recordNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Consultorio / Box Físico
                </label>
                <select
                  name="roomId"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Sin box específico / Asignar después</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={toLocalDateStr(new Date())}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Hora *
                  </label>
                  <input
                    type="time"
                    name="time"
                    defaultValue="09:00"
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Servicio
                  </label>
                  <select
                    name="type"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="FOLLOW_UP">Control Nutricional</option>
                    <option value="FIRST_VISIT">Primera Consulta / Evaluación</option>
                    <option value="BIA_EVALUATION">Evaluación BIA Exclusiva</option>
                    <option value="CLINICAL_SUPPORT">Soporte Nutricional Clínico</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Duración
                  </label>
                  <select
                    name="durationMinutes"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">60 minutos</option>
                    <option value="15">15 minutos (BIA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Notas adicionales
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Motivo breve, requerimiento de ayuno o análisis..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Guardar Cita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
