"use client";

import { useState } from "react";
import { getOrCreatePatientSurvey } from "@/actions/survey-actions";
import {
  Send,
  Copy,
  Check,
  MessageCircle,
  Mail,
  X,
  Loader2,
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface SendSurveyModalProps {
  patientId: string;
  patientName: string;
  patientPhone?: string | null;
  patientEmail?: string | null;
}

export default function SendSurveyModal({
  patientId,
  patientName,
  patientPhone,
  patientEmail,
}: SendSurveyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleOpen = async () => {
    setIsOpen(true);
    setLoading(true);
    try {
      const survey = await getOrCreatePatientSurvey(patientId);
      setToken(survey.token);
    } catch (err) {
      console.error("Error al obtener encuesta:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSurveyUrl = () => {
    if (typeof window !== "undefined" && token) {
      return `${window.location.origin}/formulario/${token}`;
    }
    return `/formulario/${token || ""}`;
  };

  const handleCopy = () => {
    const url = getSurveyUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const cleanPhone = patientPhone ? patientPhone.replace(/[^\d+]/g, "") : "";
  const surveyUrl = getSurveyUrl();
  const whatsappText = encodeURIComponent(
    `Hola ${patientName}, te saluda tu nutricionista. Por favor completa este breve cuestionario sobre tus gustos, aversiones y hábitos para preparar tu plan de alimentación personalizado:\n\n${surveyUrl}`
  );
  const whatsappLink = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${whatsappText}`
    : `https://wa.me/?text=${whatsappText}`;

  const mailSubject = encodeURIComponent("Cuestionario de Gustos y Preferencias Nutricionales");
  const mailBody = encodeURIComponent(
    `Estimado/a ${patientName},\n\nPara poder elaborar tu plan de alimentación 100% personalizado y acorde a tus metas y preferencias, te invito a completar el siguiente cuestionario:\n\n${surveyUrl}\n\n¡Muchas gracias!\nTu Nutricionista.`
  );
  const mailtoLink = `mailto:${patientEmail || ""}?subject=${mailSubject}&body=${mailBody}`;

  return (
    <>
      <button
        onClick={handleOpen}
        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
      >
        <Send className="w-4 h-4" />
        <span>Enviar Formulario</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            {/* Cabecera */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-white/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Enviar Formulario al Paciente</h3>
                  <p className="text-xs text-emerald-100">Gustos, aversiones y hábitos para su dieta</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                  <p className="text-xs text-slate-500">Generando enlace seguro para {patientName}...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Enlace Único de Acceso Público (Sin contraseña):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={surveyUrl}
                        className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 truncate focus:outline-none"
                      />
                      <button
                        onClick={handleCopy}
                        className={`px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition flex-shrink-0 cursor-pointer ${
                          copied
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-white" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copiar
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Este link es personal e intransferible. Caduca automáticamente a los 30 días.
                    </p>
                  </div>

                  {/* Canales directos de envío */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* Botón WhatsApp */}
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 transition flex items-center gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold group-hover:text-emerald-900">Enviar por WhatsApp</p>
                        <p className="text-[11px] text-emerald-600 truncate">
                          {patientPhone || "Abrir chat directo"}
                        </p>
                      </div>
                    </a>

                    {/* Botón Correo Electrónico */}
                    <a
                      href={mailtoLink}
                      className="p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 transition flex items-center gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold group-hover:text-blue-900">Enviar por Correo</p>
                        <p className="text-[11px] text-blue-600 truncate">
                          {patientEmail || "Abrir cliente email"}
                        </p>
                      </div>
                    </a>
                  </div>

                  {/* Abrir para probar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>¿Deseas probar cómo lo ve el paciente?</span>
                    <a
                      href={surveyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Abrir vista previa</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </>
              )}
            </div>

            {/* Pie */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
