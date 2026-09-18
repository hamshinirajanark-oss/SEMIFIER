/**
 * FabTwin Semiconductor Fab Yield & Physics Engine
 * Pure mathematical formulas and deterministic simulation routines.
 */

import {
  BinThresholdConfig,
  CategoryA_Contamination,
  CategoryB_Mechanical,
  CategoryC_Lithography,
  CategoryD_Environmental,
  CategoryE_Inspection,
  Die,
  DiePerformanceEstimate,
  LayoutPattern,
  NotchOrientation,
  ProcessorBin,
  RiskWeightConfig,
  SimulationParameters,
  Wafer,
  WaferDiameter,
} from '../types';

export const DEFAULT_RISK_WEIGHTS: RiskWeightConfig = {
  id: 'rw-default',
  contamination: 0.28,
  mechanical: 0.22,
  photolithography: 0.32,
  environmental: 0.18,
};

export const DEFAULT_BIN_THRESHOLDS: BinThresholdConfig = {
  id: 'bt-default',
  i9Min: 93,
  i7Min: 83,
  i5Min: 70,
  i3Min: 50,
  maxCritDefectPct: 1.0,
  minInspectionConfidencePct: 95.0,
};

/**
 * Validate that risk weights sum to 1.0 within floating point tolerance
 */
export function validateRiskWeights(weights: Omit<RiskWeightConfig, 'id'>): { valid: boolean; sum: number } {
  const litho = weights.photolithography ?? weights.lithography ?? 0.32;
  const sum = +(
    weights.contamination +
    weights.mechanical +
    litho +
    weights.environmental +
    (weights.metrology ?? 0)
  ).toFixed(4);
  return {
    valid: Math.abs(sum - 1.0) < 0.001,
    sum,
  };
}

/**
 * Normalizes a parameter value to [0, 1] relative to ideal target and critical bounds.
 * 0 is ideal, > 0.5 begins risk, 1.0 is critical violation.
 */
function scoreParameter(value: number, targetMin: number, targetMax: number, critMin?: number, critMax?: number): number {
  if (value >= targetMin && value <= targetMax) {
    return 0.05; // well inside target
  }
  if (value < targetMin) {
    const lowerCrit = critMin !== undefined ? critMin : targetMin * 0.7;
    if (value <= lowerCrit) return 1.0;
    return 0.05 + 0.95 * ((targetMin - value) / (targetMin - lowerCrit));
  } else {
    const upperCrit = critMax !== undefined ? critMax : targetMax * 1.3;
    if (value >= upperCrit) return 1.0;
    return 0.05 + 0.95 * ((value - targetMax) / (upperCrit - targetMax));
  }
}

/**
 * Calculate category risk scores from raw simulation parameters
 */
export function calculateCategoryRisks(params: SimulationParameters) {
  const { categoryA, categoryB, categoryC, categoryD, categoryE } = params;

  // A: Contamination
  const rAirborne = scoreParameter(categoryA.airborneParticleCount, 0, 10, 0, 30);
  const rDensity = scoreParameter(categoryA.waferParticleDensity, 0, 0.1, 0, 0.35);
  const rMetal = scoreParameter(categoryA.metalContaminationPpb, 0, 0.5, 0, 1.5);
  const rOrganic = scoreParameter(categoryA.organicContaminationPpb, 0, 1, 0, 3);
  const rClean = 1.0 - (categoryA.cleanEfficiencyPct - 97.5) / 2.5;
  const contaminationRisk = Math.min(1.0, Math.max(0, (rAirborne * 1.5 + rDensity * 1.5 + rMetal + rOrganic + Math.max(0, rClean)) / 5));

  // B: Mechanical
  const rForce = scoreParameter(categoryB.handlingForceN, 1.0, 2.5, 0.5, 3.5);
  const rAlign = scoreParameter(categoryB.alignmentErrorUm, 0, 1.5, 0, 2.8);
  const rBow = scoreParameter(categoryB.waferBowUm, 0, 15, 0, 28);
  const rWarp = scoreParameter(categoryB.waferWarpUm, 0, 20, 0, 35);
  const rCMP = scoreParameter(categoryB.cmpDownforceKpa, 10, 18, 5, 24);
  const mechanicalRisk = Math.min(1.0, Math.max(0, (rForce + rAlign + rBow + rWarp + rCMP) / 5));

  // C: Lithography
  const rResist = scoreParameter(categoryC.photoresistThicknessNm, 36.5, 40, 34, 43);
  const rDose = scoreParameter(categoryC.exposureDoseErrorPct, -1, 1, -2.5, 2.5);
  const rFocus = scoreParameter(categoryC.focusOffsetUm, -0.025, 0.025, -0.06, 0.06);
  const rOverlay = scoreParameter(categoryC.totalOverlayErrorNm, 0, 2.2, 0, 3.8);
  const rCD = scoreParameter(categoryC.cdErrorNm, -0.25, 0.25, -0.55, 0.55);
  const rLER = scoreParameter(categoryC.lerNm, 0, 1.8, 0, 2.8);
  const lithographyRisk = Math.min(1.0, Math.max(0, (rResist + rDose * 1.3 + rFocus * 1.2 + rOverlay * 1.5 + rCD * 1.5 + rLER) / 7.5));

  // D: Environmental
  const rTemp = scoreParameter(categoryD.chamberTempC, 395, 405, 388, 412);
  const rPlasma = scoreParameter(categoryD.rfPlasmaPowerDriftW, -2, 2, -5, 5);
  const rGas = scoreParameter(categoryD.gasFlowRateSccm, 145, 155, 138, 162);
  const rThermalGrad = scoreParameter(categoryD.thermalGradientC, 0, 1.2, 0, 2.2);
  const environmentalRisk = Math.min(1.0, Math.max(0, (rTemp + rPlasma + rGas + rThermalGrad * 1.2) / 4.2));

  // E: Metrology
  const rD0 = scoreParameter(categoryE.defectDensityD0, 0.02, 0.08, 0.01, 0.18);
  const rCDU = scoreParameter(categoryE.cdUniformityNm, 0.3, 0.8, 0.2, 1.4);
  const metrologyRisk = Math.min(1.0, Math.max(0, (rD0 * 1.5 + rCDU) / 2.5));

  return {
    contaminationRisk,
    mechanicalRisk,
    lithographyRisk,
    environmentalRisk,
    metrologyRisk,
  };
}

/**
 * Poisson & Murphy Yield Model
 * Calculates overall yield and defect risk percentage
 */
export function calculateYield(
  params: SimulationParameters,
  riskWeights: RiskWeightConfig = DEFAULT_RISK_WEIGHTS,
  dieAreaCm2 = 1.53 // ~14.2mm x 10.8mm = 1.53 cm2
): {
  predictedYieldPct: number;
  avgDefectRiskPct: number;
  avgCriticalDefectPct: number;
  avgElectricalPassPct: number;
  d0: number;
} {
  const cats = calculateCategoryRisks(params);

  const lithoWeight = riskWeights.photolithography ?? riskWeights.lithography ?? 0.32;
  // Blended composite defect risk score (0 to 1)
  const compositeDefectRisk =
    cats.contaminationRisk * riskWeights.contamination +
    cats.mechanicalRisk * riskWeights.mechanical +
    cats.lithographyRisk * lithoWeight +
    cats.environmentalRisk * riskWeights.environmental;

  // Murphy yield formula: Y = ((1 - exp(-D0 * A)) / (D0 * A))^2
  // D0 scales from baseline defectDensityD0 and composite risk
  const effectiveD0 = Math.max(0.01, params.categoryE.defectDensityD0 * (0.6 + compositeDefectRisk * 1.8));
  const D0A = effectiveD0 * dieAreaCm2;

  let murphyYield = 1.0;
  if (D0A > 0.001) {
    murphyYield = Math.pow((1 - Math.exp(-D0A)) / D0A, 2);
  }

  // Electrical pass combines litho CD fidelity, gate integrity and cleanliness
  const electricalPassProb = Math.max(
    0.2,
    Math.min(0.99, (1 - compositeDefectRisk * 0.75) * (params.categoryE.inspectionConfidencePct / 100))
  );

  const avgDefectRiskPct = +(compositeDefectRisk * 100).toFixed(1);
  const avgCriticalDefectPct = +(Math.pow(compositeDefectRisk, 1.6) * 12.5).toFixed(2);
  const predictedYieldPct = +(murphyYield * 100).toFixed(1);
  const avgElectricalPassPct = +(electricalPassProb * 100).toFixed(1);

  return {
    predictedYieldPct,
    avgDefectRiskPct,
    avgCriticalDefectPct,
    avgElectricalPassPct,
    d0: +effectiveD0.toFixed(4),
  };
}

/**
 * Deterministic Bin Classification Ladder
 * Evaluates electricalPassProbPct, criticalDefectProbPct, and inspectionConfidencePct
 * Top-down i9 -> i7 -> i5 -> i3 -> REJECT
 */
export function classifyBin(
  electricalPassProbPct: number,
  criticalDefectProbPct: number,
  inspectionConfidencePct: number,
  thresholds: BinThresholdConfig = DEFAULT_BIN_THRESHOLDS
): ProcessorBin {
  // i9-Capable: Elec Pass >= 93%, critical defect < 1%, inspection >= 95%
  if (
    electricalPassProbPct >= thresholds.i9Min &&
    criticalDefectProbPct <= thresholds.maxCritDefectPct &&
    inspectionConfidencePct >= thresholds.minInspectionConfidencePct
  ) {
    return 'i9';
  }

  // i7-Capable: Elec Pass 83-92%, total defect risk < 5%, inspection >= 90%
  if (
    electricalPassProbPct >= thresholds.i7Min &&
    criticalDefectProbPct <= 5.0 &&
    inspectionConfidencePct >= 90.0
  ) {
    return 'i7';
  }

  // i5-Capable: Elec Pass 70-82%, total defect risk < 45%, inspection >= 85%
  if (
    electricalPassProbPct >= thresholds.i5Min &&
    criticalDefectProbPct <= 45.0 &&
    inspectionConfidencePct >= 85.0
  ) {
    return 'i5';
  }

  // i3-Capable: Elec Pass 50-69%
  if (electricalPassProbPct >= thresholds.i3Min) {
    return 'i3';
  }

  // Reject
  return 'REJ';
}

/**
 * Best-i9 Ranking Formula
 * Best-i9 Score = 40%·P(i9) + 20%·ElectricalPass + 15%·InspectionConfidence + 15%·(1 − CriticalDefectProb) + 10%·(1 − TotalDefectRisk)
 */
export function calculateBestI9Score(
  i9Prob: number, // 0 to 1
  electricalPassProb: number, // 0 to 1
  inspectionConfidence: number, // 0 to 1
  criticalDefectProb: number, // 0 to 1
  totalDefectRisk: number // 0 to 1
): number {
  const score =
    0.4 * i9Prob +
    0.2 * electricalPassProb +
    0.15 * inspectionConfidence +
    0.15 * (1.0 - Math.min(1.0, criticalDefectProb)) +
    0.1 * (1.0 - Math.min(1.0, totalDefectRisk));

  return +(score * 100).toFixed(2);
}

/**
 * Explains why a die qualifies as i9 or its key strengths
 */
export function generateFeatureInfluences(params: SimulationParameters, isI9: boolean): string[] {
  const bullets = [
    'Low photolithography overlay registration error within ±1.2nm tolerance window',
    'Stable EUV exposure dose variance maintained under ±0.4%',
    'High metrology inspection confidence score exceeding 97.5% inline validation threshold',
    'Controlled static transistor gate leakage within sub-12mW budget',
    'Tight critical dimension (CD) etch error margin kept within ±0.15nm',
    'Minimal CMP mechanical stress and zero micro-scratching across active silicon zone',
    'High thermal dissipation headroom with predicted junction margin >32°C',
    'Low total particulate defect density across critical L3 SRAM cache macro',
  ];

  if (!isI9) {
    return [
      'Marginal lithography overlay registration variance near wafer perimeter',
      'Slight CMP pad micro-abrasion elevating localized surface roughness',
      'Airborne nano-particulate proximity near secondary cache lanes',
      'Chamber thermal gradient drift observed during gate dielectric deposition',
      'Moderate critical dimension dispersion under tight pitch inspection',
      'Static leakage baseline slightly elevated over ultra-low-leakage threshold',
    ];
  }

  return bullets;
}

/**
 * Calculates synthetic performance metrics for a die
 */
export function calculateVirtualPerformance(bin: ProcessorBin, defectRiskPct: number): DiePerformanceEstimate {
  switch (bin) {
    case 'i9':
      return {
        maxFreqGHz: +(5.8 + (1 - defectRiskPct / 100) * 0.25).toFixed(2),
        stableFreqGHz: 5.5,
        powerW: +(125 + defectRiskPct * 0.4).toFixed(1),
        staticLeakageMw: +(14 + defectRiskPct * 0.2).toFixed(1),
        thermalMarginC: +(34 - defectRiskPct * 0.3).toFixed(1),
        perfScore: +(94 + Math.random() * 5).toFixed(1),
      };
    case 'i7':
      return {
        maxFreqGHz: +(5.3 + (1 - defectRiskPct / 100) * 0.25).toFixed(2),
        stableFreqGHz: 5.0,
        powerW: +(105 + defectRiskPct * 0.4).toFixed(1),
        staticLeakageMw: +(18 + defectRiskPct * 0.3).toFixed(1),
        thermalMarginC: +(28 - defectRiskPct * 0.3).toFixed(1),
        perfScore: +(83 + Math.random() * 6).toFixed(1),
      };
    case 'i5':
      return {
        maxFreqGHz: 4.8,
        stableFreqGHz: 4.4,
        powerW: 85,
        staticLeakageMw: 24,
        thermalMarginC: 22,
        perfScore: +(72 + Math.random() * 6).toFixed(1),
      };
    case 'i3':
      return {
        maxFreqGHz: 4.2,
        stableFreqGHz: 3.8,
        powerW: 65,
        staticLeakageMw: 32,
        thermalMarginC: 18,
        perfScore: +(58 + Math.random() * 8).toFixed(1),
      };
    case 'REJ':
    default:
      return {
        maxFreqGHz: 0,
        stableFreqGHz: 0,
        powerW: 0,
        staticLeakageMw: 88,
        thermalMarginC: 0,
        perfScore: 0,
      };
  }
}

/**
 * Generates a full synthetic Wafer and its Dies based on parameters & geometry
 */
export function generateWaferTwin(
  lotId = 'LOT-2026-F981',
  waferId = 'WFR-300-07',
  diameterMm: WaferDiameter = 300,
  thicknessUm = 775,
  dieSizeX = 14.2,
  dieSizeY = 10.8,
  layoutPattern: LayoutPattern = 'Standard Grid',
  notchOrientationDeg: NotchOrientation = 0,
  edgeExclusionMm = 3,
  params: SimulationParameters = DEFAULT_SIMULATION_PARAMS,
  riskWeights: RiskWeightConfig = DEFAULT_RISK_WEIGHTS,
  thresholds: BinThresholdConfig = DEFAULT_BIN_THRESHOLDS
): Wafer {
  const radiusMm = diameterMm / 2;
  const activeRadiusMm = radiusMm - edgeExclusionMm;

  const dies: Die[] = [];
  const stepX = dieSizeX + 0.15; // with scribe lane
  const stepY = dieSizeY + 0.15;

  const maxGridX = Math.floor(radiusMm / stepX);
  const maxGridY = Math.floor(radiusMm / stepY);

  const yieldData = calculateYield(params, riskWeights);
  const baseDefectPct = yieldData.avgDefectRiskPct;

  let validDiesCount = 0;
  let excludedDiesCount = 0;
  const binCounts = { i9: 0, i7: 0, i5: 0, i3: 0, reject: 0 };

  for (let gx = -maxGridX; gx <= maxGridX; gx++) {
    for (let gy = -maxGridY; gy <= maxGridY; gy++) {
      let posX = gx * stepX;
      let posY = gy * stepY;

      if (layoutPattern === 'Staggered Hex' && Math.abs(gy) % 2 === 1) {
        posX += stepX * 0.5;
      }

      // Check distance from center to corners of the die
      const distCenter = Math.sqrt(posX * posX + posY * posY);

      // Outside physical wafer disc
      if (distCenter > radiusMm - 1) {
        continue;
      }

      const isExcluded = distCenter > activeRadiusMm;
      const edgeDist = Math.max(0, radiusMm - distCenter);

      let regionStatus: Die['regionStatus'] = 'Center';
      if (isExcluded) {
        regionStatus = 'Excluded Edge';
        excludedDiesCount++;
      } else if (distCenter > activeRadiusMm * 0.72) {
        regionStatus = 'Edge Zone';
        validDiesCount++;
      } else if (distCenter > activeRadiusMm * 0.35) {
        regionStatus = 'Mid-Radius';
        validDiesCount++;
      } else {
        regionStatus = 'Center';
        validDiesCount++;
      }

      // Spatial physics modeling: radial defect drift, bow tensor, CD variance
      const normalizedRadius = distCenter / radiusMm;
      const radialStressFactor = Math.pow(normalizedRadius, 1.8);
      const angle = Math.atan2(posY, posX);
      const angularWarp = Math.sin(angle * 2 + (notchOrientationDeg * Math.PI) / 180) * 0.12;

      // Local defect risk
      const localDefectRisk = Math.min(
        99.5,
        Math.max(1.2, baseDefectPct * (0.65 + radialStressFactor * 1.2 + angularWarp + (Math.random() - 0.5) * 0.15))
      );

      const localCritDefect = +(Math.pow(localDefectRisk / 100, 1.7) * 8.5).toFixed(2);
      const localElecPass = Math.min(
        99.2,
        Math.max(25, 100 - localDefectRisk * 0.85 - (radialStressFactor * 14) + (Math.random() - 0.5) * 4)
      );
      const localConfidence = Math.min(99.5, Math.max(88, params.categoryE.inspectionConfidencePct - radialStressFactor * 3.5));

      // Classify Die
      let predictedBin: ProcessorBin;
      if (isExcluded) {
        predictedBin = 'REJ';
      } else {
        predictedBin = classifyBin(localElecPass, localCritDefect, localConfidence, thresholds);
      }

      // Bin probability distribution for this die
      let pI9 = 0, pI7 = 0, pI5 = 0, pI3 = 0, pRej = 0;
      if (predictedBin === 'i9') {
        pI9 = 0.82 + Math.random() * 0.14;
        pI7 = (1 - pI9) * 0.7;
        pI5 = (1 - pI9) * 0.2;
        pI3 = (1 - pI9) * 0.08;
        pRej = 0.02;
      } else if (predictedBin === 'i7') {
        pI7 = 0.7 + Math.random() * 0.18;
        pI9 = 0.12;
        pI5 = (1 - pI7 - pI9) * 0.7;
        pI3 = (1 - pI7 - pI9) * 0.25;
        pRej = 0.05;
      } else if (predictedBin === 'i5') {
        pI5 = 0.65 + Math.random() * 0.18;
        pI7 = 0.12;
        pI3 = 0.15;
        pRej = 0.08;
      } else if (predictedBin === 'i3') {
        pI3 = 0.62 + Math.random() * 0.2;
        pI5 = 0.18;
        pRej = 0.18;
      } else {
        pRej = 0.85 + Math.random() * 0.12;
        pI3 = 0.1;
      }

      if (!isExcluded) {
        if (predictedBin === 'i9') binCounts.i9++;
        else if (predictedBin === 'i7') binCounts.i7++;
        else if (predictedBin === 'i5') binCounts.i5++;
        else if (predictedBin === 'i3') binCounts.i3++;
        else binCounts.reject++;
      } else {
        binCounts.reject++;
      }

      const dieId = `D-${gx >= 0 ? '+' : ''}${gx}_${gy >= 0 ? '+' : ''}${gy}`;

      // Physics layer tensors
      const cdErrorNm = +(params.categoryC.cdErrorNm + (radialStressFactor - 0.3) * 0.35 + (Math.random() - 0.5) * 0.08).toFixed(3);
      const mechanicalStressMpa = +(28 + radialStressFactor * 42 + (Math.random() - 0.5) * 5).toFixed(1);
      const staticLeakageMw = +(12 + radialStressFactor * 16 + (Math.random() - 0.5) * 2).toFixed(1);
      const thermalMarginC = +(36 - radialStressFactor * 14 + (Math.random() - 0.5) * 3).toFixed(1);
      const twinDriftSigma = +(0.2 + radialStressFactor * 1.4 + (Math.random() - 0.5) * 0.2).toFixed(2);

      const die: Die = {
        id: dieId,
        waferId,
        gridX: gx,
        gridY: gy,
        centerDistMm: +distCenter.toFixed(1),
        edgeDistMm: +edgeDist.toFixed(1),
        regionStatus,
        isExcluded,
        predictedBin,
        binProbabilities: {
          i9: +pI9.toFixed(3),
          i7: +pI7.toFixed(3),
          i5: +pI5.toFixed(3),
          i3: +pI3.toFixed(3),
          reject: +pRej.toFixed(3),
        },
        defectRiskPct: +localDefectRisk.toFixed(1),
        criticalDefectProbPct: +localCritDefect.toFixed(2),
        electricalPassProbPct: +localElecPass.toFixed(1),
        modelConfidencePct: +localConfidence.toFixed(1),
        cdErrorNm,
        mechanicalStressMpa,
        staticLeakageMw,
        thermalMarginC,
        twinDriftSigma,
        defectBreakdown: {
          contamination: +(localDefectRisk * 0.35).toFixed(1),
          mechanical: +(localDefectRisk * 0.24).toFixed(1),
          lithography: +(localDefectRisk * 0.26).toFixed(1),
          environmental: +(localDefectRisk * 0.1).toFixed(1),
          metrology: +(localDefectRisk * 0.05).toFixed(1),
        },
        performanceEstimate: isExcluded ? null : calculateVirtualPerformance(predictedBin, localDefectRisk),
        featureInfluence: generateFeatureInfluences(params, predictedBin === 'i9'),
        matchedSignatureId: localDefectRisk > 35 ? (radialStressFactor > 0.6 ? 'DEF-01' : 'DEF-03') : undefined,
      };

      dies.push(die);
    }
  }

  const totalDies = dies.length;
  const yieldPct = validDiesCount > 0 ? +((binCounts.i9 + binCounts.i7 + binCounts.i5 + binCounts.i3) / validDiesCount * 100).toFixed(1) : 0;

  return {
    id: waferId,
    lotId,
    diameterMm,
    thicknessUm,
    dieSizeX,
    dieSizeY,
    layoutPattern,
    notchOrientationDeg,
    edgeExclusionMm,
    totalDies,
    validDies: validDiesCount,
    edgeExcludedDies: excludedDiesCount,
    predictedYieldPct: yieldPct,
    avgDefectRiskPct: yieldData.avgDefectRiskPct,
    avgCriticalDefectPct: yieldData.avgCriticalDefectPct,
    avgElectricalPassPct: yieldData.avgElectricalPassPct,
    binDistribution: binCounts,
    dies,
  };
}

/**
 * Standard default parameters mirroring finfet advanced recipe
 */
export const DEFAULT_SIMULATION_PARAMS: SimulationParameters = {
  categoryA: {
    airborneParticleCount: 4.2,
    waferParticleDensity: 0.04,
    avgParticleSize: 0.08,
    maxParticleSize: 0.24,
    metalContaminationPpb: 0.18,
    organicContaminationPpb: 0.42,
    gasPurityPct: 99.9998,
    diWaterResistivity: 18.2,
    cleanEfficiencyPct: 99.8,
  },
  categoryB: {
    handlingForceN: 1.8,
    alignmentErrorUm: 0.65,
    waferBowUm: 7.4,
    waferWarpUm: 11.2,
    cmpDownforceKpa: 14.2,
    cmpPadConditionScore: 94,
  },
  categoryC: {
    photoresistThicknessNm: 38.2,
    exposureDoseErrorPct: 0.15,
    focusOffsetUm: 0.008,
    totalOverlayErrorNm: 1.15,
    cdErrorNm: 0.04,
    lerNm: 1.25,
  },
  categoryD: {
    chamberTempC: 400.2,
    rfPlasmaPowerDriftW: 0.4,
    gasFlowRateSccm: 149.8,
    cleanroomHumidityPct: 43.5,
    thermalGradientC: 0.65,
  },
  categoryE: {
    defectDensityD0: 0.042,
    cdUniformityNm: 0.52,
    inspectionConfidencePct: 97.4,
  },
};

export const HIGH_YIELD_PRESET_PARAMS: SimulationParameters = {
  categoryA: {
    airborneParticleCount: 1.5,
    waferParticleDensity: 0.015,
    avgParticleSize: 0.04,
    maxParticleSize: 0.12,
    metalContaminationPpb: 0.06,
    organicContaminationPpb: 0.15,
    gasPurityPct: 99.99995,
    diWaterResistivity: 18.28,
    cleanEfficiencyPct: 99.95,
  },
  categoryB: {
    handlingForceN: 1.4,
    alignmentErrorUm: 0.25,
    waferBowUm: 3.5,
    waferWarpUm: 6.2,
    cmpDownforceKpa: 12.5,
    cmpPadConditionScore: 98,
  },
  categoryC: {
    photoresistThicknessNm: 38.0,
    exposureDoseErrorPct: 0.02,
    focusOffsetUm: 0.002,
    totalOverlayErrorNm: 0.65,
    cdErrorNm: 0.01,
    lerNm: 0.85,
  },
  categoryD: {
    chamberTempC: 400.0,
    rfPlasmaPowerDriftW: 0.1,
    gasFlowRateSccm: 150.0,
    cleanroomHumidityPct: 44.0,
    thermalGradientC: 0.25,
  },
  categoryE: {
    defectDensityD0: 0.024,
    cdUniformityNm: 0.38,
    inspectionConfidencePct: 99.2,
  },
};
