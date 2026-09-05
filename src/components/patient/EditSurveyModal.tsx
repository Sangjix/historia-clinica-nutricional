"use client";

import { useState } from "react";
import { updatePatientSurveyByNutritionist, SurveyFormData } from "@/actions/survey-actions";
import {
  FileEdit,
  X,
  Loader2,
  Check,
  AlertTriangle,
  Heart,
  Ban,
  Clock,
  Coffee,
} from "lucide-react";

interface EditSurveyModalProps {
  patientId: string;
  patientName: string;
  initialSurvey?: any;
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
  { value: "OMNIVORE", label: "Omnívoro" },
  { value: "VEGETARIAN", label: "Vegetariano" },
  { value: "VEGAN", label: "Vegano" },
  { value: "PESCETARIAN", label: "Pescetariano" },
  { value: "OTHER", label: "Otro / Terapéutico" },
];

export default function EditSurveyModal({
  patientId,
  patientName,
  initialSurvey,
}: EditSurveyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const initialAllergies = initialSurvey?.allergiesJson
    ? JSON.parse(initialSurvey.allergiesJson)
    : [];

  const [allergies, setAllergies] = useState<string[]>(initialAllergies);
  const [otherAllergies, setOtherAllergies] = useState(initialSurvey?.otherAllergies || "");
  const [dietType, setDietType] = useState(initialSurvey?.dietType || "OMNIVORE");
  const [favoriteFoods, setFavoriteFoods] = useState(initialSurvey?.favoriteFoods || "");
  const [dislikedFoods, setDislikedFoods] = useState(initialSurvey?.dislikedFoods || "");
  const [cookingHabits, setCookingHabits] = useState(initialSurvey?.cookingHabits || "");
  const [diningOut, setDiningOut] = useState(initialSurvey?.diningOut || "");
  const [waterIntake, setWaterIntake] = useState(initialSurvey?.waterIntake || "");
  const [physicalActivity, setPhysicalActivity] = useState(initialSurvey?.physicalActivity || "");

  const [breakfastTime, setBreakfastTime] = useState(initialSurvey?.breakfastTime || "08:00");
  const [morningSnack, setMorningSnack] = useState(initialSurvey?.morningSnack || "");
  const [lunchTime, setLunchTime] = useState(initialSurvey?.lunchTime || "13:30");
  const [afternoonSnack, setAfternoonSnack] = useState(initialSurvey?.afternoonSnack || "");
  const [dinnerTime, setDinnerTime] = useState(initialSurvey?.dinnerTime || "20:00");
  const [additionalNotes, setAdditionalNotes] = useState(initialSurvey?.additionalNotes || "");

  const toggleAllergy = (allergy: string) => {
    setAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
      await updatePatientSurveyByNutritionist(patientId, formData);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setIsOpen(false);
      }, 1200);
    } catch (err) {
      console.error("Error al actualizar formulario:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
      >
        <FileEdit className="w-4 h-4 text-slate-500" />
        <span>Editar Formulario</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Cabecera */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-emerald-400">
                  <FileEdit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Editar Formulario de Preferencias</h3>
                  <p className="text-xs text-slate-400">Expediente de {patientName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Alergias */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Alergias e Intolerancias Diagnosticadas:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_ALLERGIES.map((allergy) => {
                    const isSelected = allergies.includes(allergy);
                    return (
                      <button
                        type="button"
                        key={allergy}
                        onClick={() => toggleAllergy(allergy)}
                        className={`px-2.5 py-1.5 rounded-lg font-medium border text-xs transition ${
                          isSelected
                            ? "bg-amber-500 text-white border-amber-600 font-semibold"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "} {allergy}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={otherAllergies}
                  onChange={(e) => setOtherAllergies(e.target.value)}
                  placeholder="Otras sensibilidades específicas..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 mt-1"
                />
              </div>

              {/* Tipo de Dieta */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">Tipo de Dieta / Régimen:</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {DIET_TYPES.map((d) => (
                    <button
                      type="button"
                      key={d.value}
                      onClick={() => setDietType(d.value)}
                      className={`p-2 rounded-xl border text-center font-medium transition ${
                        dietType === d.value
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800 font-bold"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Favoritos y Rechazos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    Alimentos Favoritos:
                  </label>
                  <textarea
                    rows={3}
                    value={favoriteFoods}
                    onChange={(e) => setFavoriteFoods(e.target.value)}
                    placeholder="Palta, avena, fresas, pescado bonito..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-rose-800 flex items-center gap-1.5">
                    <Ban className="w-4 h-4 text-rose-600" />
                    Alimentos Rechazados / Aversiones:
                  </label>
                  <textarea
                    rows={3}
                    value={dislikedFoods}
                    onChange={(e) => setDislikedFoods(e.target.value)}
                    placeholder="Vísceras, sangrecita, coliflor, mayonesa..."
                    className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50/30"
                  />
                </div>
              </div>

              {/* Horarios */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Horarios Habituales de Ingesta:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Desayuno</span>
                    <input
                      type="text"
                      value={breakfastTime}
                      onChange={(e) => setBreakfastTime(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Col. Mañana</span>
                    <input
                      type="text"
                      value={morningSnack}
                      onChange={(e) => setMorningSnack(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Almuerzo</span>
                    <input
                      type="text"
                      value={lunchTime}
                      onChange={(e) => setLunchTime(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Col. Tarde</span>
                    <input
                      type="text"
                      value={afternoonSnack}
                      onChange={(e) => setAfternoonSnack(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Cena</span>
                    <input
                      type="text"
                      value={dinnerTime}
                      onChange={(e) => setDinnerTime(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Logística y Cocina */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Coffee className="w-4 h-4 text-indigo-600" />
                  Hábitos de Cocina y Rutina:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={cookingHabits}
                    onChange={(e) => setCookingHabits(e.target.value)}
                    placeholder="Preparación de comidas / Tiempo"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                  <input
                    type="text"
                    value={diningOut}
                    onChange={(e) => setDiningOut(e.target.value)}
                    placeholder="Frecuencia de comer fuera / Delivery"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                  <input
                    type="text"
                    value={waterIntake}
                    onChange={(e) => setWaterIntake(e.target.value)}
                    placeholder="Consumo de agua pura (litros/vasos)"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                  <input
                    type="text"
                    value={physicalActivity}
                    onChange={(e) => setPhysicalActivity(e.target.value)}
                    placeholder="Actividad física o ejercicio"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Notas */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Notas u Observaciones Clínicas:</label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Detalles sobre su respuesta o acuerdos de consulta..."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              {/* Pie de acción */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : savedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      ¡Guardado!
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Guardar Preferencias
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
