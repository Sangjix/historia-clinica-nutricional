import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import {
  Users,
  LayoutDashboard,
  Calculator,
  Apple,
  Settings,
  Activity,
  HeartPulse,
  Calendar,
  FileText,
} from "lucide-react";
import PwaRegister from "@/components/pwa/PwaRegister";

export const metadata: Metadata = {
  title: "NutriRecord | Software de Historia Clínica Nutricional",
  description: "Plataforma profesional para la gestión de historias clínicas nutricionales, antropometría y dietoterapia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
        <PwaRegister />
        {/* Barra Lateral / Sidebar */}
        <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between shadow-sm">
          <div>
            {/* Logo y Encabezado */}
            <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-lg leading-tight">NutriRecord</h1>
                <p className="text-xs text-emerald-600 font-medium">Historia Clínica Pro</p>
              </div>
            </div>

            {/* Menú de Navegación */}
            <nav className="p-4 space-y-1.5">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium text-sm transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                Panel Principal
              </Link>
              <Link
                href="/pacientes"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium text-sm transition-colors"
              >
                <Users className="w-4 h-4 text-slate-500" />
                Pacientes y Expedientes
              </Link>
              <Link
                href="/calculadora"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium text-sm transition-colors"
              >
                <Calculator className="w-4 h-4 text-slate-500" />
                Calculadora Clínica
              </Link>
              <Link
                href="/alimentos"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium text-sm transition-colors"
              >
                <Apple className="w-4 h-4 text-slate-500" />
                Alimentos y Equivalentes
              </Link>
            </nav>
          </div>

          {/* Pie de Sidebar con Perfil Profesional */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                DR
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-800 truncate">Dra. Nutrición</p>
                <p className="text-xs text-slate-500 truncate">Consultorio Activo</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Contenedor Principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Barra Superior / Header */}
          <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>
                {new Date().toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Base de Datos Local Conectada
              </span>
              <Link
                href="/pacientes/nuevo"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition-colors"
              >
                <Users className="w-4 h-4" />
                Nuevo Paciente
              </Link>
            </div>
          </header>

          {/* Área de Contenido con Scroll */}
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
