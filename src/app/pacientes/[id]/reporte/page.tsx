import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import EvolutionPdfReport from "@/components/reports/EvolutionPdfReport";

export const revalidate = 0;

export default async function ReportePacientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const patient = await db.patient.findUnique({
    where: { id },
    include: {
      consultations: {
        include: {
          anthropometry: true,
          biochemical: true,
          dietPlan: true,
        },
        orderBy: {
          consultationNumber: "asc",
        },
      },
    },
  });

  if (!patient) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto py-4">
      <EvolutionPdfReport patient={patient} />
    </div>
  );
}
