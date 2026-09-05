"use client";

import { useState } from "react";
import { submitPublicSurvey, SurveyFormData } from "@/actions/survey-actions";
import {
  Heart,
  Ban,
  Clock,
  Utensils,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  Coffee,
  Sparkles,
} from "lucide-react";

interface PatientSurveyFormProps {
  token: string;
  patientName: string;
  initialData?: any;
  alreadyCompleted?: boolean;
}

const COMMON_ALLERGIES = [
  "Lactosa / Lácteos",
  "Gluten / Trigo",
  "Mariscos",
  "Pescados",
  "Huevo",
  "Maní / Frutos Secos",
  "Soya",
  "Fructosa",
];

const DIET_TYPES = [
  { value: "OMNIVORE", label: "Omnívoro", desc: "Consumo carnes, vegetales y todo tipo de alimentos" },
  { value: "VEGETARIAN", label: "Vegetariano", desc: "No consumo carnes ni pescados, sí lácteos/huevos" },
  { value: "VEGAN", label: "Vegano", desc: "100% de origen vegetal, sin productos animales" },
  { value: "PESCETARIAN", label: "Pescetariano", desc: "Vegetales y pescados/mariscos" },
  { value: "OTHER", label: "Otro / Específico", desc: "Otro patrón o prescripción médica" },
];

export default function PatientSurveyForm({
  token,
  patientName,
  initialData,
  alreadyCompleted = false,
}: PatientSurveyFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados del formulario
  const initialAllergies = initialData?.allergiesJson
    ? JSON.parse(initialData.allergiesJson)
    : [];

  const [allergies, setAllergies] = useState<string[]>(initialAllergies);
  const [otherAllergies, setOtherAllergies] = useState(initialData?.otherAllergies || "");
  const [dietType, setDietType] = useState(initialData?.dietType || "OMNIVORE");
  const [favoriteFoods, setFavoriteFoods] = useState(initialData?.favoriteFoods || "");
  const [dislikedFoods, setDislikedFoods] = useState(initialData?.dislikedFoods || "");
  const [cookingHabits, setCookingHabits] = useState(initialData?.cookingHabits || "");
  const [diningOut, setDiningOut] = useState(initialData?.diningOut || "");
  const [waterIntake, setWaterIntake] = useState(initialData?.waterIntake || "");
  const [physicalActivity, setPhysicalActivity] = useState(initialData?.physicalActivity || "");

  const [breakfastTime, setBreakfastTime] = useState(initialData?.breakfastTime || "08:00");
  const [morningSnack, setMorningSnack] = useState(initialData?.morningSnack || "");
  const [lunchTime, setLunchTime] = useState(initialData?.lunchTime || "13:30");
  const [afternoonSnack, setAfternoonSnack] = useState(initialData?.afternoonSnack || "");
  const [dinnerTime, setDinnerTime] = useState(initialData?.dinnerTime || "20:00");
  const [additionalNotes, setAdditionalNotes] = useState(initialData?.additionalNotes || "");

  const toggleAllergy = (allergy: string) => {
    setAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData: SurveyFormData = {
      allergies,
      otherAllergies,
      dietType,
      favoriteFoods,
      dislikedFoods,
      cookingHabits,
      diningOut,
      waterIntake,
      physicalActivity,
      breakfastTime,
      morningSnack,
      lunchTime,
      afternoonSnack,
      dinnerTime,
      additionalNotes,
    };

    try {
      await submitPublicSurvey(token, formData);
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error al enviar el formulario. Por favor reintenta.");
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-emerald-100 shadow-xl text-center max-w-xl mx-auto my-8 space-y-5">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">¡Respuestas Enviadas con Éxito!</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Muchas gracias, <strong className="text-emerald-700 font-semibold">{patientName}</strong>. 
          Tu nutricionista ha recibido tus gustos, aversiones y hábitos para diseñar un plan de alimentación 100% adaptado a tus metas.
        </p>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
          Ya puedes cerrar esta ventana con total tranquilidad.
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsSubmitted(false)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            ¿Deseas corregir o cambiar alguna respuesta? Modificar datos
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto my-6">
      {/* Mensaje de Bienvenida */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="w-32 h-32" />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs inline-block">
            Cuestionario Nutricional
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Hola, {patientName} 👋
          </h1>
          <p className="text-emerald-50 text-sm md:text-base max-w-xl">
            Cuéntanos sobre tus preferencias y estilo de vida. Esta información será la base para que tu nutricionista elabore tu menú y plan de alimentación personalizado.
          </p>
        </div>
      </div>

      {alreadyCompleted && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-bold">Formulario previamente registrado</p>
            <p className="text-emerald-700 mt-0.5">
              Tus respuestas anteriores se encuentran cargadas abajo. Puedes revisarlas, hacer las modificaciones necesarias y volver a guardarlas.
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECCIÓN 1: Alergias e Intolerancias */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-slate-900">1. Alergias e Intolerancias Alimentarias</h2>
        </div>
        <p className="text-xs text-slate-500">
          Selecciona si tienes alguna intolerancia o alergia médica diagnosticada:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {COMMON_ALLERGIES.map((allergy) => {
            const isSelected = allergies.includes(allergy);
            return (
              <button
                type="button"
                key={allergy}
                onClick={() => toggleAllergy(allergy)}
                className={`text-xs px-3 py-2.5 rounded-xl font-medium border text-left transition ${
                  isSelected
                    ? "bg-amber-500 text-white border-amber-600 shadow-xs font-semibold"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {isSelected ? "✓ " : "+ "} {allergy}
              </button>
            );
          })}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Otras alergias, sensibilidades o alimentos que te caen mal:
          </label>
          <input
            type="text"
            value={otherAllergies}
            onChange={(e) => setOtherAllergies(e.target.value)}
            placeholder="Ej. Me inflama la cebolla cruda, reflujo con el pimiento..."
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* SECCIÓN 2: Patrón, Favoritos y Aversiones */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Utensils className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">2. Gustos, Preferencias y Alimentos Rechazados</h2>
        </div>

        {/* Tipo de Dieta */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Tipo de alimentación que sigues o deseas seguir:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DIET_TYPES.map((type) => (
              <label
                key={type.value}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                  dietType === type.value
                    ? "border-emerald-600 bg-emerald-50/70"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="dietType"
                  value={type.value}
                  checked={dietType === type.value}
                  onChange={(e) => setDietType(e.target.value)}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">{type.label}</p>
                  <p className="text-[11px] text-slate-500">{type.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Alimentos Favoritos */}
        <div>
          <label className="block text-xs font-semibold text-emerald-800 mb-1 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />
            Alimentos Favoritos / Que te gustaría incluir frecuentemente:
          </label>
          <p className="text-[11px] text-slate-400 mb-1.5">
            Menciona frutas, verduras, carnes, granos o desayunos que disfrutes mucho.
          </p>
          <textarea
            rows={3}
            value={favoriteFoods}
            onChange={(e) => setFavoriteFoods(e.target.value)}
            placeholder="Ej. Palta, avena, fresas, pollo a la plancha, pescado bonito, café, chocolate oscuro..."
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>

        {/* Alimentos Rechazados */}
        <div>
          <label className="block text-xs font-semibold text-rose-800 mb-1 flex items-center gap-1.5">
            <Ban className="w-4 h-4 text-rose-600" />
            Alimentos que NO te gustan o que NO comerías bajo ningún motivo:
          </label>
          <p className="text-[11px] text-slate-400 mb-1.5">
            Tu nutricionista los excluirá de tu plan de alimentación.
          </p>
          <textarea
            rows={3}
            value={dislikedFoods}
            onChange={(e) => setDislikedFoods(e.target.value)}
            placeholder="Ej. Hígado, sangrecita, coliflor sancochada, apio, mayonesa..."
            className="w-full text-xs p-3 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-rose-50/30"
          />
        </div>
      </div>

      {/* SECCIÓN 3: Horarios Habituales */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">3. Tus Horarios Habituales de Comida</h2>
        </div>
        <p className="text-xs text-slate-500">
          Indica aproximadamente a qué hora realizas tus comidas en tu día a día:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Desayuno</label>
            <input
              type="text"
              value={breakfastTime}
              onChange={(e) => setBreakfastTime(e.target.value)}
              placeholder="08:00 AM"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-center"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Colación Mañana</label>
            <input
              type="text"
              value={morningSnack}
              onChange={(e) => setMorningSnack(e.target.value)}
              placeholder="11:00 AM"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-center"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Almuerzo</label>
            <input
              type="text"
              value={lunchTime}
              onChange={(e) => setLunchTime(e.target.value)}
              placeholder="01:30 PM"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-center"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Colación Tarde</label>
            <input
              type="text"
              value={afternoonSnack}
              onChange={(e) => setAfternoonSnack(e.target.value)}
              placeholder="05:00 PM"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-center"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cena</label>
            <input
              type="text"
              value={dinnerTime}
              onChange={(e) => setDinnerTime(e.target.value)}
              placeholder="08:30 PM"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-center"
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: Cocina y Estilo de Vida */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Coffee className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">4. Hábitos de Cocina y Rutina Diaria</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ¿Quién cocina y cuánto tiempo dispones para preparar alimentos?
            </label>
            <input
              type="text"
              value={cookingHabits}
              onChange={(e) => setCookingHabits(e.target.value)}
              placeholder="Ej. Yo mismo, unos 20-30 min / Llevo táper a la oficina..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ¿Con qué frecuencia comes fuera de casa o pides delivery?
            </label>
            <input
              type="text"
              value={diningOut}
              onChange={(e) => setDiningOut(e.target.value)}
              placeholder="Ej. Solo fines de semana / 2 veces por semana almuerzo menú..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Consumo aproximado de agua pura al día:
            </label>
            <input
              type="text"
              value={waterIntake}
              onChange={(e) => setWaterIntake(e.target.value)}
              placeholder="Ej. 1.5 a 2 litros / 4 vasos al día..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Actividad física o ejercicio actual:
            </label>
            <input
              type="text"
              value={physicalActivity}
              onChange={(e) => setPhysicalActivity(e.target.value)}
              placeholder="Ej. Gimnasio 3 veces x semana / Caminata diaria 30 min..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Comentarios o detalles adicionales para tu nutricionista:
          </label>
          <textarea
            rows={2}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Cualquier otra información importante sobre tus hábitos..."
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Botón de Envío */}
      <div className="text-center pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 mx-auto disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Guardando tus respuestas...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              {alreadyCompleted
                ? "Guardar y Actualizar Cuestionario"
                : "Enviar Cuestionario a mi Nutricionista"}
            </>
          )}
        </button>
        <p className="text-[11px] text-slate-400 mt-2">
          Tus datos se enviarán de forma confidencial y segura a tu expediente clínico.
        </p>
      </div>
    </form>
  );
}
