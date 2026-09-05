import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const dbPath = path.join(process.cwd(), "prisma", "dev.db");

    if (!fs.existsSync(dbPath)) {
      return new NextResponse("La base de datos dev.db no fue encontrada.", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(dbPath);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `backup-nutriclinic-${dateStr}.db`;

    const headers = new Headers();
    headers.set("Content-Type", "application/x-sqlite3");
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error al generar copia de seguridad:", error);
    return new NextResponse("Error al generar el respaldo de la base de datos.", { status: 500 });
  }
}
