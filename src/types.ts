/**
 * FabTwin Semiconductor Fab Yield Simulation & 3D Digital Twin
 * Core Type Definitions
 */

export type ProcessorBin = 'i9' | 'i7' | 'i5' | 'i3' | 'REJ';

export type UserRole = 'Engineer' | 'ProcessManager' | 'Admin';

export interface UserPermissions {
  canEditProcessParams: boolean;
  canRunSimulations: boolean;
  canReviewHistoricalData: boolean;
  canManageUsers: boolean;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  email: string;
  privileges: string;
  permissions?: UserPermissions;
}

export type WaferDiameter = 200 | 300 | 450;
export type LayoutPattern = 'Standard Grid' | 'Staggered Hex' | 'Radial Concentric';
export type NotchOrientation = 0 | 90 | 180;
export type ViewMode = '3D View' | 'Top Flat' | 'Side Cut';

export type VisualizationMode =
  | 'Bin Capability Map'
  | 'Total Defect Risk Density Heatmap'
  | 'i9 Super-Bin Probability Gradient'
  | 'Lithography CD Error'
  | 'Mechanical Stress & Wafer Bowing Tensor'
  | 'Predicted Thermal & Static Leakage'
  | 'Twin Drift vs Lot Reference Base';

export interface DiePerformanceEstimate {
  maxFreqGHz: number;
  stableFreqGHz: number;
  powerW: number;
  staticLeakageMw: number;
  thermalMarginC: number;
  perfScore: number;
}

export interface DieDefectBreakdown {
  contamination: number;
  mechanical: number;
  lithography: number;
  environmental: number;
  metrology: number;
}

export interface Die {
  id: string;
  waferId: string;
  gridX: number;
  gridY: number;
  centerDistMm: number;
  edgeDistMm: number;
  regionStatus: 'Center' | 'Mid-Radius' | 'Edge Zone' | 'Excluded Edge';
  isExcluded: boolean;
  predictedBin: ProcessorBin;
  binProbabilities: {
    i9: number;
    i7: number;
    i5: number;
    i3: number;
    reject: number;
  };
  defectRiskPct: number;
  criticalDefectProbPct: number;
  electricalPassProbPct: number;
  modelConfidencePct: number;
  cdErrorNm: number;
  mechanicalStressMpa: number;
  staticLeakageMw: number;
  thermalMarginC: number;
  twinDriftSigma: number;
  defectBreakdown: DieDefectBreakdown;
  performanceEstimate: DiePerformanceEstimate | null;
  featureInfluence: string[];
  matchedSignatureId?: string;
}

export interface Wafer {
  id: string;
  lotId: string;
  diameterMm: WaferDiameter;
  thicknessUm: number;
  dieSizeX: number;
  dieSizeY: number;
  layoutPattern: LayoutPattern;
  notchOrientationDeg: NotchOrientation;
  edgeExclusionMm: number;
  totalDies: number;
  validDies: number;
  edgeExcludedDies: number;
  predictedYieldPct: number;
  avgDefectRiskPct: number;
  avgCriticalDefectPct: number;
  avgElectricalPassPct: number;
  binDistribution: {
    i9: number;
    i7: number;
    i5: number;
    i3: number;
    reject: number;
  };
  dies: Die[];
}

export interface CategoryA_Contamination {
  airborneParticleCount: number; // particles/m3 >=0.1um, target 0-10, crit <30/>200
  waferParticleDensity: number; // particles/cm2, target 0-0.1, crit <0.35/>2.5
  avgParticleSize: number; // um, target 0-0.15, crit <0.35
  maxParticleSize: number; // um, target 0-0.5, crit <1.2
  metalContaminationPpb: number; // ppb, target 0-0.5, crit <1.5
  organicContaminationPpb: number; // ppb, target 0-1, crit <3.0
  gasPurityPct: number; // %, target 99.9995-100, crit <99.998
  diWaterResistivity: number; // MOhm*cm, target 18-18.3, crit <17.5
  cleanEfficiencyPct: number; // %, target 99-100, crit <97.5
}

export interface CategoryB_Mechanical {
  handlingForceN: number; // N, target 1-2.5, crit >3.5
  alignmentErrorUm: number; // um, target 0-1.5, crit >2.8
  waferBowUm: number; // um, target 0-15, crit >28
  waferWarpUm: number; // um, target 0-20, crit >35
  cmpDownforceKpa: number; // kPa, target 10-18, crit >24
  cmpPadConditionScore: number; // 0-100, target 85-100, crit <75
}

export interface CategoryC_Lithography {
  photoresistThicknessNm: number; // nm, target 36.5-40, crit <34/>43
  exposureDoseErrorPct: number; // %, target -1 to 1, crit <-2.5/>2.5
  focusOffsetUm: number; // um, target -0.025 to 0.025, crit <-0.06/>0.06
  totalOverlayErrorNm: number; // nm, target 0-2.2, crit >3.8
  cdErrorNm: number; // nm, target -0.25 to 0.25, crit <-0.55/>0.55
  lerNm: number; // Line Edge Roughness 3-sigma, nm, target 0-1.8, crit >2.8
}

export interface CategoryD_Environmental {
  chamberTempC: number; // C, target 395-405, crit <388/>412
  rfPlasmaPowerDriftW: number; // W, target -2 to 2, crit <-5/>5
  gasFlowRateSccm: number; // sccm, target 145-155, crit <138/>162
  cleanroomHumidityPct: number; // %, target 42-45, crit <38/>49
  thermalGradientC: number; // C, target 0-1.2, crit >2.2
}

export interface CategoryE_Inspection {
  defectDensityD0: number; // def/cm2, target 0.02-0.08, crit >0.18
  cdUniformityNm: number; // 3-sigma, nm, target 0.3-0.8, crit >1.4
  inspectionConfidencePct: number; // %, target 95-99.9, crit <90
}

export interface SimulationParameters {
  categoryA: CategoryA_Contamination;
  categoryB: CategoryB_Mechanical;
  categoryC: CategoryC_Lithography;
  categoryD: CategoryD_Environmental;
  categoryE: CategoryE_Inspection;
}

export interface SimulationRun {
  id: string;
  runName: string;
  engineerInCharge: string;
  lotId: string;
  waferId: string;
  dieId: string;
  toolId: string;
  recipeId: string;
  parameters: SimulationParameters;
  results: {
    predictedYieldPct: number;
    avgDefectRiskPct: number;
    avgCriticalDefectPct: number;
    avgElectricalPassPct: number;
    binMix: {
      i9: number;
      i7: number;
      i5: number;
      i3: number;
      reject: number;
    };
    bestI9Score: number;
    predictedBin: ProcessorBin;
    i9ProbPct: number;
    modelConfidencePct: number;
  };
  bestI9Score: number;
  status: 'Complete' | 'Failed' | 'In Progress';
  createdAt: string;
}

export interface DefectResponsibleParam {
  name: string;
  currentValue: number | string;
  targetValue: number | string;
  unit: string;
}

export interface DefectSignature {
  id: string;
  category: 'Lithography' | 'Mechanical' | 'Contamination' | 'Environmental' | 'Inspection';
  historicalLikelihoodPct: number;
  title: string;
  rootCauseMechanism: string;
  responsibleParams: DefectResponsibleParam[];
  recommendedAction: string;
  i9GainPct: number;
  yieldGainPct: number;
  applied: boolean;
  toolTarget?: string;
  subtitle?: string;
  rootCause?: string;
  action?: string;
}

export interface HistoricalFactorRow {
  param: string;
  category: string;
  currentValue: string;
  i9Baseline: string;
  toleranceMin: string;
  toleranceMax: string;
  deviationPct: number;
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'WARNING' | 'CRITICAL';
  impactWeight: 'CRITICAL' | 'VERY_HIGH' | 'HIGH' | 'MODERATE';
  evidenceLotCount: number;
}

export interface HistoricalRecord {
  id: string;
  scenarioName: string;
  matchedLotIds: string[];
  similarityPct: number;
  cohortI9QualPct: number;
  defectIncidentRatePct: number;
  verdict: string;
  matchedSignatures: string[];
  factorProfile: HistoricalFactorRow[];
}

export interface ProcessTwin {
  id: string;
  name: string;
  sourceRunId: string;
  version: string;
  createdAt: string;
  author: string;
  status: 'Active Baseline' | 'Candidate' | 'Archived';
  riskWeightsSnapshot: RiskWeightConfig;
  binCutoffsSnapshot: BinThresholdConfig;
  parametersSnapshot: SimulationParameters;
  predictedYieldPct: number;
  i9CapabilityPct: number;
}

export interface BinThresholdConfig {
  id: string;
  i9Min: number; // default 93
  i7Min: number; // default 83
  i5Min: number; // default 70
  i3Min: number; // default 50
  maxCritDefectPct: number; // default 1
  minInspectionConfidencePct: number; // default 95
}

export interface RiskWeightConfig {
  id?: string;
  contamination: number; // 0.28
  mechanical: number; // 0.22
  photolithography?: number; // 0.32
  lithography?: number; // 0.32 alias
  environmental: number; // 0.18
  metrology?: number; // 0.0
}

export type RiskWeights = RiskWeightConfig;

export interface PhysicalValidationRecord {
  id: string;
  lotId: string;
  waferId: string;
  dieId: string;
  simulatedBin: ProcessorBin;
  actualBin: ProcessorBin;
  simulatedPassProbPct: number;
  actualPassOutcome: boolean;
  actualMaxFreqGHz: number;
  measuredDefectsD0: number;
  metrologySource: 'KLA Inline' | 'TEL Inspector' | 'ASML Metrology' | 'Advantest ATE';
  inspector: string;
  timestamp: string;
  calibrated: boolean;
}
