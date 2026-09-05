"use client";

import { Download, ExternalLink, Database, BookOpen, ShieldCheck, FileText } from "lucide-react";

export default function TaferaPdfViewer() {
  return (
    <div className="space-y-6">
      {/* Tarjeta de Control y Acceso Total */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Autónomo en Servidor Local
            </span>
            <span className="text-xs text-slate-400">Tamaño: 6.1 MB</span>
          </div>
          <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Documento Técnico Oficial TAFERA (CENAN / INS 2016 VF)
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Este documento contiene la versión final completa de la Tabla Auxiliar para la Formulación y Evaluación de Regímenes Alimentarios, con todas las fotos, porciones, unidades de consumo y factores de conversión de cocinado.
          </p>
        </div>

        {/* Acciones de Descarga y Respaldo */}
        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
          <a
            href="/api/documentos/tafera-pdf?download=1"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PDF</span>
          </a>

          <a
            href="/api/documentos/tafera-pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white font-semibold text-xs border border-slate-600 transition flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Nueva Ventana</span>
          </a>

          <a
            href="/api/backup"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
            title="Copia exacta e instantánea de la base de datos SQLite con todos los pacientes e historias"
          >
            <Database className="w-4 h-4" />
            <span>Respaldo DB</span>
          </a>
        </div>
      </div>

      {/* Guía Rápida de Secciones Oficiales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <p className="font-bold text-slate-800 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            Módulo I: Medidas Caseras
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Porciones estandarizadas, fotografías oficiales, pesos brutos y netos de 1,023 alimentos.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <p className="font-bold text-slate-800 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-600" />
            Módulo II: Factores de Cocción
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            165 factores (FC) para transformar gramos cocidos a crudos en la prescripción dietética.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <p className="font-bold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Disponibilidad Offline
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            El archivo está integrado en el servidor local. No requiere internet para su lectura.
          </p>
        </div>
      </div>

      {/* Visor Nativo Embebido */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <iframe
          src="/api/documentos/tafera-pdf"
          title="Documento Oficial TAFERA 2016 VF"
          className="w-full h-[850px] rounded-xl border border-slate-200 bg-slate-50"
        />
      </div>
    </div>
  );
}
