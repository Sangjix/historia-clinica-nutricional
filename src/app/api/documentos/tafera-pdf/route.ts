import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), "TAFERA_2016_VF.pdf");

    if (!fs.existsSync(filePath)) {
      return new NextResponse("El documento oficial TAFERA 2016 VF no fue encontrado en el servidor.", {
        status: 404,
      });
    }

    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get("download") === "1";

    const fileBuffer = fs.readFileSync(filePath);
    const fileStat = fs.statSync(filePath);

    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Length", fileStat.size.toString());
    headers.set(
      "Content-Disposition",
      isDownload
        ? 'attachment; filename="TAFERA_2016_VF_CENAN_INS.pdf"'
        : 'inline; filename="TAFERA_2016_VF_CENAN_INS.pdf"'
    );
    headers.set("Cache-Control", "public, max-age=86400");

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error al servir PDF de TAFERA:", error);
    return new NextResponse("Error interno del servidor al procesar el archivo.", { status: 500 });
  }
}
