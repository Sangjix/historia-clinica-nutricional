"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getAppointments(filters?: {
  startDate?: string;
  endDate?: string;
  roomId?: string;
  status?: string;
}) {
  const whereClause: any = {};

  if (filters?.roomId) {
    whereClause.roomId = filters.roomId;
  }
  if (filters?.status) {
    whereClause.status = filters.status;
  }
  if (filters?.startDate && filters?.endDate) {
    whereClause.date = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate),
    };
  }

  const appointments = await db.appointment.findMany({
    where: whereClause,
    include: {
      patient: true,
      room: true,
      nutritionist: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  return appointments;
}

export async function getConsultationRooms() {
  return await db.consultationRoom.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function createAppointment(formData: FormData) {
  const patientId = formData.get("patientId") as string;
  const roomId = (formData.get("roomId") as string) || null;
  const dateStr = formData.get("date") as string;
  const timeStr = formData.get("time") as string;
  const durationMinutes = parseInt((formData.get("durationMinutes") as string) || "30", 10);
  const type = (formData.get("type") as string) || "FOLLOW_UP";
  const notes = (formData.get("notes") as string) || null;

  if (!patientId || !dateStr || !timeStr) {
    throw new Error("El paciente, la fecha y la hora son obligatorios.");
  }

  const fullDate = new Date(`${dateStr}T${timeStr}:00`);

  // Verificación básica de conflicto de box
  if (roomId) {
    const conflict = await db.appointment.findFirst({
      where: {
        roomId,
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
        date: {
          gte: new Date(fullDate.getTime() - 15 * 60000),
          lte: new Date(fullDate.getTime() + durationMinutes * 60000),
        },
      },
    });
    if (conflict) {
      throw new Error("El consultorio/box seleccionado ya tiene una cita reservada en ese horario.");
    }
  }

  const appointment = await db.appointment.create({
    data: {
      patientId,
      roomId,
      date: fullDate,
      durationMinutes,
      type,
      notes,
      status: "SCHEDULED",
    },
  });

  revalidatePath("/citas");
  revalidatePath(`/pacientes/${patientId}`);
  return appointment;
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: "CONFIRMED" | "ATTENDED" | "CANCELLED" | "NO_SHOW",
  cancellationReason?: string
) {
  const updated = await db.appointment.update({
    where: { id: appointmentId },
    data: {
      status,
      cancellationReason: cancellationReason || null,
      whatsappConfirmedAt: status === "CONFIRMED" ? new Date() : undefined,
    },
  });

  revalidatePath("/citas");
  return updated;
}

// Generador de mensaje interactivo de WhatsApp para reducción de Ausentismo (No-Shows)
export async function getWhatsAppReminderData(appointmentId: string) {
  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: true,
      room: true,
    },
  });

  if (!appointment) throw new Error("Cita no encontrada.");

  const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
  const phone = appointment.patient.phone?.replace(/\D/g, "") || "";
  const dateStr = new Date(appointment.date).toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const timeStr = new Date(appointment.date).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const roomName = appointment.room?.name || "Consultorio Principal";

  const message = `👋 Hola *${patientName}*, te saludamos de NutriRecord / Consultorio Nutricional.\n\n📅 Te recordamos tu próxima cita programada para el *${dateStr}* a las *${timeStr}* en el *${roomName}*.\n\n⏱️ Tipo de servicio: ${appointment.type === "FIRST_VISIT" ? "Primera Consulta / Evaluación Completa" : appointment.type === "BIA_EVALUATION" ? "Evaluación de Bioimpedancia (BIA)" : "Control Nutricional"}.\n\n✅ Por favor, responde con *SÍ* para confirmar tu asistencia o avísanos con anticipación si necesitas reprogramar para liberar el turno. ¡Te esperamos!`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = phone
    ? `https://wa.me/${phone.startsWith("51") ? phone : "51" + phone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;

  return {
    patientName,
    phone,
    whatsappUrl,
    messageText: message,
  };
}

// Generador de archivo universal .ics para Apple Calendar, Google Calendar y Outlook
export async function generateIcsCalendarInvite(appointmentId: string) {
  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: { patient: true, room: true },
  });

  if (!appointment) throw new Error("Cita no encontrada.");

  const start = new Date(appointment.date);
  const end = new Date(start.getTime() + appointment.durationMinutes * 60000);

  const formatIcsDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NutriRecord//Agenda Clinica 1.1//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${appointment.id}@nutrirecord.local`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:Cita Nutricional: ${appointment.patient.firstName} ${appointment.patient.lastName}`,
    `DESCRIPTION:Cita de ${appointment.type} en NutriRecord. Notas: ${appointment.notes || "Ninguna"}`,
    `LOCATION:${appointment.room?.name || "Consultorio Nutricional"}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return icsContent;
}
