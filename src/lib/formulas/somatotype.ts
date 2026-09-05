// Cálculo del Somatotipo de Heath & Carter (Endomorfia, Mesomorfia, Ectomorfia y Somatocarta)

export interface SomatotypeInput {
  heightCm: number;
  weightKg: number;
  // Pliegues en mm
  tricepsMm: number;
  subscapularMm: number;
  suprailiacMm: number;
  calfMm?: number;
  // Diámetros óseos en cm (opcional, con valores por defecto estimados)
  humerusBreadthCm?: number;
  femurBreadthCm?: number;
  // Perímetros corregidos en cm
  armGirthFlexedCm?: number;
  calfGirthCm?: number;
}

export interface SomatotypeResult {
  endomorphy: number;
  mesomorphy: number;
  ectomorphy: number;
  xCoord: number;
  yCoord: number;
  classification: string;
}

/**
 * Calcula los componentes del Somatotipo de Heath-Carter
 */
export function calculateHeathCarter(input: SomatotypeInput): SomatotypeResult {
  const {
    heightCm,
    weightKg,
    tricepsMm,
    subscapularMm,
    suprailiacMm,
    humerusBreadthCm = 6.5,
    femurBreadthCm = 9.2,
    armGirthFlexedCm = 30.0,
    calfGirthCm = 36.0,
    calfMm = 12.0,
  } = input;

  // 1. ENDOMORFIA (Adiposidad relativa)
  // Suma de 3 pliegues corregida por estatura: S3 = (triceps + subescapular + suprailiaco) * (170.18 / estatura)
  const sum3 = tricepsMm + subscapularMm + suprailiacMm;
  const s3Corrected = sum3 * (170.18 / heightCm);
  let endomorphy = -0.7182 + 0.1451 * s3Corrected - 0.00068 * Math.pow(s3Corrected, 2) + 0.0000014 * Math.pow(s3Corrected, 3);
  endomorphy = Math.max(0.5, parseFloat(endomorphy.toFixed(1)));

  // 2. MESOMORFIA (Desarrollo músculo-esquelético relativo)
  // Perímetros corregidos restando el pliegue respectivo (en cm)
  const armCorrectedCm = armGirthFlexedCm - (tricepsMm / 10);
  const calfCorrectedCm = calfGirthCm - (calfMm / 10);
  let mesomorphy = (0.858 * humerusBreadthCm) +
                   (0.601 * femurBreadthCm) +
                   (0.188 * armCorrectedCm) +
                   (0.161 * calfCorrectedCm) -
                   (0.131 * heightCm) + 4.5;
  mesomorphy = Math.max(0.5, parseFloat(mesomorphy.toFixed(1)));

  // 3. ECTOMORFIA (Linealidad relativa)
  // Índice Ponderal / Height-Weight Ratio: HWR = Estatura / (Peso ^ (1/3))
  const hwr = heightCm / Math.cbrt(weightKg);
  let ectomorphy = 0.5;

  if (hwr >= 40.75) {
    ectomorphy = 0.732 * hwr - 28.58;
  } else if (hwr > 38.25) {
    ectomorphy = 0.463 * hwr - 17.63;
  } else {
    ectomorphy = 0.1;
  }
  ectomorphy = Math.max(0.1, parseFloat(ectomorphy.toFixed(1)));

  // 4. COORDENADAS PARA LA SOMATOCARTA BIDIMENSIONAL
  // X = Ectomorfia - Endomorfia
  // Y = 2 * Mesomorfia - (Endomorfia + Ectomorfia)
  const xCoord = parseFloat((ectomorphy - endomorphy).toFixed(2));
  const yCoord = parseFloat((2 * mesomorphy - (endomorphy + ectomorphy)).toFixed(2));

  // 5. CLASIFICACIÓN CATEGÓRICA
  let classification = "Central / Equilibrado";
  const diffEndoMeso = Math.abs(endomorphy - mesomorphy);
  const diffEndoEcto = Math.abs(endomorphy - ectomorphy);
  const diffMesoEcto = Math.abs(mesomorphy - ectomorphy);

  if (endomorphy > mesomorphy && endomorphy > ectomorphy) {
    if (mesomorphy > ectomorphy) classification = "Meso-Endomorfo";
    else if (ectomorphy > mesomorphy) classification = "Ecto-Endomorfo";
    else classification = "Endomorfo Equilibrado";
  } else if (mesomorphy > endomorphy && mesomorphy > ectomorphy) {
    if (endomorphy > ectomorphy) classification = "Endo-Mesomorfo";
    else if (ectomorphy > endomorphy) classification = "Ecto-Mesomorfo";
    else classification = "Mesomorfo Equilibrado";
  } else if (ectomorphy > endomorphy && ectomorphy > mesomorphy) {
    if (endomorphy > mesomorphy) classification = "Endo-Ectomorfo";
    else if (mesomorphy > endomorphy) classification = "Meso-Ectomorfo";
    else classification = "Ectomorfo Equilibrado";
  }

  return {
    endomorphy,
    mesomorphy,
    ectomorphy,
    xCoord,
    yCoord,
    classification,
  };
}
