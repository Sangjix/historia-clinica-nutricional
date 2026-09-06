"use client";

import React, { useState } from "react";
import {
  X,
  ShoppingCart,
  Printer,
  Copy,
  Check,
  Share2,
  ListChecks,
} from "lucide-react";
import { ConsolidatedGroceryCategory } from "@/actions/mealplan-actions";

interface GroceryListModalProps {
  isOpen: boolean;
  onClose: () => void;
  planTitle: string;
  categories: ConsolidatedGroceryCategory[];
}

export default function GroceryListModal({
  isOpen,
  onClose,
  planTitle,
  categories,
}: GroceryListModalProps) {
  const [copied, setCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleCheck = (name: string) => {
    setCheckedItems((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const generateWhatsAppText = () => {
    let text = `🛒 *LISTA DE COMPRAS SEMANAL - NUTRIRECORD*\n`;
    text += `📋 *Plan:* ${planTitle}\n`;
    text += `📅 Generado según tu prescripción nutricional personalizada\n\n`;

    for (const cat of categories) {
      text += `${cat.icon} *${cat.categoryName.toUpperCase()}*\n`;
      for (const item of cat.items) {
        text += ` • ${item.foodName}: *${item.householdEstimate}*\n`;
      }
      text += `\n`;
    }

    text += `💡 *Recomendación:* Prioriza insumos frescos de estación y pesaje neto crudo. ¡Buen provecho!`;
    return encodeURIComponent(text);
  };

  const handleCopyText = () => {
    let plain = `LISTA DE COMPRAS SEMANAL - NUTRIRECORD\nPlan: ${planTitle}\n\n`;
    for (const cat of categories) {
      plain += `${cat.icon} ${cat.categoryName}\n`;
      for (const item of cat.items) {
        plain += ` - ${item.foodName}: ${item.householdEstimate}\n`;
      }
      plain += `\n`;
    }

    navigator.clipboard.writeText(plain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const text = generateWhatsAppText();
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  const totalIngredients = categories.reduce((acc, cat) => acc + cat.items.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Lista de Compras Consolidada</h3>
              <p className="text-xs text-emerald-100">
                {planTitle} • {totalIngredients} insumos calculados para la semana
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Botones de Acción Rápida */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Toca cualquier insumo para tacharlo durante tus compras:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-xs transition"
              title="Compartir por WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              Enviar a WhatsApp
            </button>
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "¡Copiado!" : "Copiar Texto"}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
          </div>
        </div>

        {/* Lista Categorizada con Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 print:p-0">
          {categories.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-slate-600">No hay ingredientes registrados aún.</p>
              <p className="text-xs text-slate-400 mt-1">
                Asigna recetas a los días del calendario para consolidar tu lista de compras.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.categoryKey}
                  className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <span className="text-lg">{cat.icon}</span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 uppercase tracking-wide">
                      {cat.categoryName}
                    </h4>
                    <span className="ml-auto text-[11px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      {cat.items.length}
                    </span>
                  </div>

                  <ul className="space-y-1.5">
                    {cat.items.map((item) => {
                      const isChecked = !!checkedItems[item.foodName];
                      return (
                        <li
                          key={item.foodName}
                          onClick={() => toggleCheck(item.foodName)}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer select-none transition ${
                            isChecked
                              ? "bg-slate-200/60 text-slate-400 line-through"
                              : "bg-white hover:bg-emerald-50 text-slate-700 shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                            />
                            <span className="font-medium">{item.foodName}</span>
                          </div>
                          <span className="font-bold text-emerald-800 ml-2">
                            {item.householdEstimate}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <span>* Pesos expresados en neto crudo según la Tabla Peruana de Composición de Alimentos.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
