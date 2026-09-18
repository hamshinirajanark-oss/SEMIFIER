/**
 * FabTwin Global Fab Context & State Store
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  BinThresholdConfig,
  DefectSignature,
  Die,
  LayoutPattern,
  NotchOrientation,
  PhysicalValidationRecord,
  ProcessTwin,
  RiskWeightConfig,
  SimulationParameters,
  SimulationRun,
  User,
  Wafer,
  WaferDiameter,
} from '../types';
import {
  FAB_USERS,
  HISTORICAL_SCENARIOS,
  INITIAL_APPROVED_TWINS,
  INITIAL_DEFECT_SIGNATURES,
} from '../data/fabData';
import {
  calculateBestI9Score,
  calculateYield,
  classifyBin,
  DEFAULT_BIN_THRESHOLDS,
  DEFAULT_RISK_WEIGHTS,
  DEFAULT_SIMULATION_PARAMS,
  generateWaferTwin,
  validateRiskWeights,
} from '../utils/physicsEngine';

export interface CumulativeImpact {
  actionsActivated: number;
  predictedI9GainPct: number;
  grossYieldGainPct: number;
}

interface FabContextType {
  currentRoute: string;
  navigate: (route: string) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  activeWafer: Wafer;
  selectedDie: Die | null;
  selectDie: (die: Die | null) => void;
  simulationRuns: SimulationRun[];
  runSimulation: (
    params: SimulationParameters,
    options?: {
      runName?: string;
      engineer?: string;
      lotId?: string;
      waferId?: string;
      count?: number;
    }
  ) => SimulationRun[];
  defectSignatures: DefectSignature[];
  toggleDefectAction: (signatureId: string) => void;
  toggleDefectSignature: (signatureId: string) => void;
  resetDefectSignatures: () => void;
  cumulativeImpact: CumulativeImpact;
  riskWeights: RiskWeightConfig;
  updateRiskWeights: (weights: Omit<RiskWeightConfig, 'id'>) => { success: boolean; error?: string };
  binThresholds: BinThresholdConfig;
  updateBinThresholds: (thresholds: Partial<BinThresholdConfig>) => void;
  processTwins: ProcessTwin[];
  createProcessTwin: (name: string, sourceRunId: string, customParams?: SimulationParameters) => ProcessTwin;
  validationRecords: PhysicalValidationRecord[];
  addValidationRecord: (record: Omit<PhysicalValidationRecord, 'id' | 'timestamp'>) => void;
  regenerateActiveWafer: (options?: {
    diameter?: WaferDiameter;
    thickness?: number;
    dieSizeX?: number;
    dieSizeY?: number;
    pattern?: LayoutPattern;
    notch?: NotchOrientation;
    edgeExclusion?: number;
    params?: SimulationParameters;
  }) => void;
  exportCsv: () => void;
  seedDemoRuns: () => void;
  switchUserRole: (role: string) => void;
}

const FabContext = createContext<FabContextType | null>(null);

export function FabProvider({ children }: { children: React.ReactNode }) {
  // Navigation: sync with pathname or default to '/'
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      return p && p !== '/' ? p : '/';
    }
    return '/';
  });

  const navigate = (route: string) => {
    setCurrentRoute(route);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', route);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        setCurrentRoute(window.location.pathname || '/');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Current logged in Fab user (defaults to Harini R. Admin)
  const [currentUser, setCurrentUser] = useState<User>(FAB_USERS[0]);

  // Model thresholds & risk weights
  const [riskWeights, setRiskWeights] = useState<RiskWeightConfig>(DEFAULT_RISK_WEIGHTS);
  const [binThresholds, setBinThresholds] = useState<BinThresholdConfig>(DEFAULT_BIN_THRESHOLDS);

  // Active Wafer digital twin
  const [activeWafer, setActiveWafer] = useState<Wafer>(() =>
    generateWaferTwin(
      'LOT-2026-F981',
      'WFR-300-07',
      300,
      775,
      14.2,
      10.8,
      'Standard Grid',
      0,
      3,
      DEFAULT_SIMULATION_PARAMS,
      DEFAULT_RISK_WEIGHTS,
      DEFAULT_BIN_THRESHOLDS
    )
  );

  // Selected Die
  const [selectedDie, setSelectedDie] = useState<Die | null>(() => {
    // default to center die
    return activeWafer.dies.find((d) => d.gridX === 0 && d.gridY === 0) || activeWafer.dies[0] || null;
  });

  // Simulation Runs History (Audit Trail)
  // Initially empty to match clean fresh install spec, but user can click "Seed Demo Lot" or "Run Simulation"
  const [simulationRuns, setSimulationRuns] = useState<SimulationRun[]>([]);

  // Defect Signatures & Cumulative Impact
  const [defectSignatures, setDefectSignatures] = useState<DefectSignature[]>(INITIAL_DEFECT_SIGNATURES);

  const cumulativeImpact: CumulativeImpact = React.useMemo(() => {
    const applied = defectSignatures.filter((s) => s.applied);
    const i9Sum = applied.reduce((acc, s) => acc + s.i9GainPct, 0);
    const yieldSum = applied.reduce((acc, s) => acc + s.yieldGainPct, 0);
    return {
      actionsActivated: applied.length,
      predictedI9GainPct: +Math.min(100, i9Sum).toFixed(1),
      grossYieldGainPct: +Math.min(100, yieldSum).toFixed(1),
    };
  }, [defectSignatures]);

  const toggleDefectAction = (signatureId: string) => {
    setDefectSignatures((prev) =>
      prev.map((sig) => (sig.id === signatureId ? { ...sig, applied: !sig.applied } : sig))
    );
  };

  const resetDefectSignatures = () => {
    setDefectSignatures(INITIAL_DEFECT_SIGNATURES.map((sig) => ({ ...sig, applied: false })));
  };

  const switchUserRole = (targetRole: string) => {
    const matched = FAB_USERS.find((u) => u.role === targetRole) || {
      id: `USR-${targetRole}`,
      name: `${targetRole} User`,
      role: targetRole as any,
      department: 'Semiconductor Operations',
      email: `${targetRole.toLowerCase()}@fab24.internal`,
      privileges: 'Operational Access',
    };
    setCurrentUser(matched);
  };

  // Process Twins
  const [processTwins, setProcessTwins] = useState<ProcessTwin[]>(INITIAL_APPROVED_TWINS);

  // Physical Validation Records
  const [validationRecords, setValidationRecords] = useState<PhysicalValidationRecord[]>([
    {
      id: 'VAL-001',
      lotId: 'LOT-2026-F981',
      waferId: 'WFR-300-07',
      dieId: 'D-0_0',
      simulatedBin: 'i9',
      actualBin: 'i9',
      simulatedPassProbPct: 98.4,
      actualPassOutcome: true,
      actualMaxFreqGHz: 5.92,
      measuredDefectsD0: 0.031,
      metrologySource: 'Advantest ATE',
      inspector: 'Iylamaran V.',
      timestamp: '2026-03-15 11:30',
      calibrated: true,
    },
    {
      id: 'VAL-002',
      lotId: 'LOT-2026-F981',
      waferId: 'WFR-300-07',
      dieId: 'D-+8_+6',
      simulatedBin: 'i7',
      actualBin: 'i7',
      simulatedPassProbPct: 86.2,
      actualPassOutcome: true,
      actualMaxFreqGHz: 5.45,
      measuredDefectsD0: 0.052,
      metrologySource: 'KLA Inline',
      inspector: 'Hariharan S.',
      timestamp: '2026-03-15 11:45',
      calibrated: true,
    },
  ]);

  // Update Risk Weights with strict sum = 1.0 constraint
  const updateRiskWeights = (newWeights: Omit<RiskWeightConfig, 'id'>) => {
    const check = validateRiskWeights(newWeights);
    if (!check.valid) {
      return {
        success: false,
        error: `Validation Failed: Weights must sum exactly to 1.0. Current sum is ${check.sum.toFixed(4)}. Please adjust sliders.`,
      };
    }
    setRiskWeights({
      ...newWeights,
      id: `rw-${Date.now()}`,
    });
    return { success: true };
  };

  // Update Bin Thresholds
  const updateBinThresholds = (thresholds: Partial<BinThresholdConfig>) => {
    setBinThresholds((prev) => ({ ...prev, ...thresholds }));
  };

  // Run Simulation (Single or Batch)
  const runSimulation = (
    params: SimulationParameters,
    options: {
      runName?: string;
      engineer?: string;
      lotId?: string;
      waferId?: string;
      count?: number;
    } = {}
  ): SimulationRun[] => {
    const count = options.count || 1;
    const engineer = options.engineer || currentUser.name;
    const lotId = options.lotId || activeWafer.lotId;
    const waferId = options.waferId || activeWafer.id;
    const baseRunName = options.runName || `FinFET_Run_${Date.now().toString().slice(-4)}`;

    const newRuns: SimulationRun[] = [];

    for (let i = 0; i < count; i++) {
      // Apply realistic stochastic jitter for batch runs
      const jitterFactor = count > 1 ? (Math.random() - 0.5) * 0.08 : 0;
      const jitteredParams: SimulationParameters = {
        categoryA: {
          ...params.categoryA,
          airborneParticleCount: Math.max(0, +(params.categoryA.airborneParticleCount * (1 + jitterFactor)).toFixed(2)),
          waferParticleDensity: Math.max(0, +(params.categoryA.waferParticleDensity * (1 + jitterFactor)).toFixed(3)),
        },
        categoryB: {
          ...params.categoryB,
          handlingForceN: Math.max(0.5, +(params.categoryB.handlingForceN * (1 + jitterFactor * 0.5)).toFixed(2)),
          waferBowUm: Math.max(0, +(params.categoryB.waferBowUm * (1 + jitterFactor)).toFixed(1)),
        },
        categoryC: {
          ...params.categoryC,
          totalOverlayErrorNm: Math.max(0, +(params.categoryC.totalOverlayErrorNm * (1 + jitterFactor)).toFixed(2)),
          cdErrorNm: +(params.categoryC.cdErrorNm + jitterFactor * 0.05).toFixed(3),
        },
        categoryD: {
          ...params.categoryD,
          chamberTempC: +(params.categoryD.chamberTempC + jitterFactor * 1.5).toFixed(1),
        },
        categoryE: {
          ...params.categoryE,
          defectDensityD0: Math.max(0.005, +(params.categoryE.defectDensityD0 * (1 + jitterFactor)).toFixed(4)),
        },
      };

      const yieldRes = calculateYield(jitteredParams, riskWeights);

      // Deterministic bin classification for this run
      const predictedBin = classifyBin(
        yieldRes.avgElectricalPassPct,
        yieldRes.avgCriticalDefectPct,
        jitteredParams.categoryE.inspectionConfidencePct,
        binThresholds
      );

      const i9Prob = predictedBin === 'i9' ? 0.85 + Math.random() * 0.12 : predictedBin === 'i7' ? 0.18 : 0.04;
      const elecPass = yieldRes.avgElectricalPassPct / 100;
      const inspConf = jitteredParams.categoryE.inspectionConfidencePct / 100;
      const critProb = yieldRes.avgCriticalDefectPct / 100;
      const defRisk = yieldRes.avgDefectRiskPct / 100;

      const bestI9Score = calculateBestI9Score(i9Prob, elecPass, inspConf, critProb, defRisk);

      // Estimated bin mix
      const binMix = {
        i9: Math.round(yieldRes.predictedYieldPct * (i9Prob * 0.7)),
        i7: Math.round(yieldRes.predictedYieldPct * (1 - i9Prob * 0.7) * 0.6),
        i5: Math.round(yieldRes.predictedYieldPct * 0.18),
        i3: Math.round(yieldRes.predictedYieldPct * 0.08),
        reject: Math.max(0, 100 - Math.round(yieldRes.predictedYieldPct)),
      };

      const runItem: SimulationRun = {
        id: `SIM-${Date.now()}-${i + 1}`,
        runName: count > 1 ? `${baseRunName}_#${i + 1}` : baseRunName,
        engineerInCharge: engineer,
        lotId,
        waferId,
        dieId: 'D-0_0',
        toolId: 'ASML-EUV-03',
        recipeId: 'REC-FINFET-PROT-v4',
        parameters: jitteredParams,
        results: {
          predictedYieldPct: yieldRes.predictedYieldPct,
          avgDefectRiskPct: yieldRes.avgDefectRiskPct,
          avgCriticalDefectPct: yieldRes.avgCriticalDefectPct,
          avgElectricalPassPct: yieldRes.avgElectricalPassPct,
          binMix,
          bestI9Score,
          predictedBin,
          i9ProbPct: +(i9Prob * 100).toFixed(1),
          modelConfidencePct: +(inspConf * 100).toFixed(1),
        },
        bestI9Score,
        status: 'Complete',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      };

      newRuns.push(runItem);
    }

    setSimulationRuns((prev) => [...newRuns, ...prev]);

    // If single run or first of batch, re-simulate active wafer twin with these parameters
    if (newRuns.length > 0) {
      regenerateActiveWafer({ params: newRuns[0].parameters });
    }

    return newRuns;
  };

  // Seed demo runs for instant testability
  const seedDemoRuns = () => {
    const engineers = ['Harini R.', 'Ismail K.', 'Hariharan S.', 'Muthukumar T.'];
    const lotPrefixes = ['LOT-2026-F981', 'LOT-2026-N014', 'LOT-2026-G102', 'LOT-2026-E441'];
    const demoItems: SimulationRun[] = [];

    const scenarios = [
      { name: 'FinFET_SuperBin_Verification', params: DEFAULT_SIMULATION_PARAMS, bin: 'i9' as const, i9Prob: 0.94, score: 94.2 },
      { name: 'Litho_Overlay_Overdrive_Test', params: DEFAULT_SIMULATION_PARAMS, bin: 'i9' as const, i9Prob: 0.88, score: 89.6 },
      { name: 'CMP_Slurry_Pressure_Sweep', params: DEFAULT_SIMULATION_PARAMS, bin: 'i7' as const, i9Prob: 0.42, score: 78.4 },
      { name: 'Cleanroom_Particle_Audit_Run', params: DEFAULT_SIMULATION_PARAMS, bin: 'i5' as const, i9Prob: 0.15, score: 65.2 },
      { name: 'Thermal_Susceptor_Tuning', params: DEFAULT_SIMULATION_PARAMS, bin: 'i7' as const, i9Prob: 0.38, score: 75.8 },
      { name: 'FinFET_Conservative_Lot_Audit', params: DEFAULT_SIMULATION_PARAMS, bin: 'i9' as const, i9Prob: 0.91, score: 92.1 },
    ];

    scenarios.forEach((sc, idx) => {
      const yieldRes = calculateYield(sc.params, riskWeights);
      demoItems.push({
        id: `SIM-DEMO-00${idx + 1}`,
        runName: sc.name,
        engineerInCharge: engineers[idx % engineers.length],
        lotId: lotPrefixes[idx % lotPrefixes.length],
        waferId: `WFR-300-0${idx + 1}`,
        dieId: 'D-0_0',
        toolId: 'ASML-EUV-03',
        recipeId: 'REC-FINFET-PROT-v4',
        parameters: sc.params,
        results: {
          predictedYieldPct: yieldRes.predictedYieldPct,
          avgDefectRiskPct: yieldRes.avgDefectRiskPct,
          avgCriticalDefectPct: yieldRes.avgCriticalDefectPct,
          avgElectricalPassPct: yieldRes.avgElectricalPassPct,
          binMix: {
            i9: Math.round(yieldRes.predictedYieldPct * sc.i9Prob * 0.7),
            i7: Math.round(yieldRes.predictedYieldPct * 0.25),
            i5: Math.round(yieldRes.predictedYieldPct * 0.1),
            i3: Math.round(yieldRes.predictedYieldPct * 0.05),
            reject: 100 - Math.round(yieldRes.predictedYieldPct),
          },
          bestI9Score: sc.score,
          predictedBin: sc.bin,
          i9ProbPct: +(sc.i9Prob * 100).toFixed(1),
          modelConfidencePct: 98.2,
        },
        bestI9Score: sc.score,
        status: 'Complete',
        createdAt: new Date(Date.now() - (idx + 1) * 3600000).toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      });
    });

    setSimulationRuns((prev) => [...demoItems, ...prev]);
  };

  // Regenerate Active Wafer
  const regenerateActiveWafer = (options: {
    diameter?: WaferDiameter;
    thickness?: number;
    dieSizeX?: number;
    dieSizeY?: number;
    pattern?: LayoutPattern;
    notch?: NotchOrientation;
    edgeExclusion?: number;
    params?: SimulationParameters;
  } = {}) => {
    const diameter = options.diameter || activeWafer.diameterMm;
    const thickness = options.thickness || activeWafer.thicknessUm;
    const dieSizeX = options.dieSizeX || activeWafer.dieSizeX;
    const dieSizeY = options.dieSizeY || activeWafer.dieSizeY;
    const pattern = options.pattern || activeWafer.layoutPattern;
    const notch = options.notch !== undefined ? options.notch : activeWafer.notchOrientationDeg;
    const edgeExclusion = options.edgeExclusion !== undefined ? options.edgeExclusion : activeWafer.edgeExclusionMm;
    const params = options.params || DEFAULT_SIMULATION_PARAMS;

    const w = generateWaferTwin(
      activeWafer.lotId,
      activeWafer.id,
      diameter,
      thickness,
      dieSizeX,
      dieSizeY,
      pattern,
      notch,
      edgeExclusion,
      params,
      riskWeights,
      binThresholds
    );

    setActiveWafer(w);
    // keep center die selected
    const centerDie = w.dies.find((d) => d.gridX === 0 && d.gridY === 0) || w.dies[0] || null;
    setSelectedDie(centerDie);
  };

  // Create Process Twin
  const createProcessTwin = (name: string, sourceRunId: string, customParams?: SimulationParameters): ProcessTwin => {
    const params = customParams || DEFAULT_SIMULATION_PARAMS;
    const yieldRes = calculateYield(params, riskWeights);

    const twin: ProcessTwin = {
      id: `TWIN-${Date.now().toString().slice(-6)}`,
      name,
      sourceRunId,
      version: `${processTwins.length + 4}.0.0-PROD`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      author: `${currentUser.name} (${currentUser.role})`,
      status: 'Candidate',
      riskWeightsSnapshot: { ...riskWeights },
      binCutoffsSnapshot: { ...binThresholds },
      parametersSnapshot: params,
      predictedYieldPct: yieldRes.predictedYieldPct,
      i9CapabilityPct: +(yieldRes.predictedYieldPct * 0.82).toFixed(1),
    };

    setProcessTwins((prev) => [twin, ...prev]);
    return twin;
  };

  // Add validation record
  const addValidationRecord = (record: Omit<PhysicalValidationRecord, 'id' | 'timestamp'>) => {
    const fullRecord: PhysicalValidationRecord = {
      ...record,
      id: `VAL-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setValidationRecords((prev) => [fullRecord, ...prev]);
  };

  // Export CSV
  const exportCsv = () => {
    const headers = [
      'Run ID',
      'Run Name',
      'Engineer',
      'Lot ID',
      'Wafer ID',
      'Predicted Bin',
      'Best i9 Score',
      'i9 Probability %',
      'Predicted Yield %',
      'Avg Defect Risk %',
      'Critical Defect Prob %',
      'Electrical Pass %',
      'Model Confidence %',
      'Airborne Particles (p/m3)',
      'Wafer Particle Density (p/cm2)',
      'CMP Downforce (kPa)',
      'Overlay Error (nm)',
      'CD Error (nm)',
      'Chamber Temp (C)',
      'Defect Density D0 (def/cm2)',
      'Status',
      'Created At',
    ];

    const rows = simulationRuns.map((r) => [
      `"${r.id}"`,
      `"${r.runName}"`,
      `"${r.engineerInCharge}"`,
      `"${r.lotId}"`,
      `"${r.waferId}"`,
      `"${r.results.predictedBin}"`,
      r.bestI9Score,
      r.results.i9ProbPct,
      r.results.predictedYieldPct,
      r.results.avgDefectRiskPct,
      r.results.avgCriticalDefectPct,
      r.results.avgElectricalPassPct,
      r.results.modelConfidencePct,
      r.parameters.categoryA.airborneParticleCount,
      r.parameters.categoryA.waferParticleDensity,
      r.parameters.categoryB.cmpDownforceKpa,
      r.parameters.categoryC.totalOverlayErrorNm,
      r.parameters.categoryC.cdErrorNm,
      r.parameters.categoryD.chamberTempC,
      r.parameters.categoryE.defectDensityD0,
      `"${r.status}"`,
      `"${r.createdAt}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fabtwin_simulation_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <FabContext.Provider
      value={{
        currentRoute,
        navigate,
        currentUser,
        setCurrentUser,
        activeWafer,
        selectedDie,
        selectDie: setSelectedDie,
        simulationRuns,
        runSimulation,
        defectSignatures,
        toggleDefectAction,
        toggleDefectSignature: toggleDefectAction,
        resetDefectSignatures,
        cumulativeImpact,
        riskWeights,
        updateRiskWeights,
        binThresholds,
        updateBinThresholds,
        processTwins,
        createProcessTwin,
        validationRecords,
        addValidationRecord,
        regenerateActiveWafer,
        exportCsv,
        seedDemoRuns,
        switchUserRole,
      }}
    >
      {children}
    </FabContext.Provider>
  );
}

export function useFab() {
  const context = useContext(FabContext);
  if (!context) {
    throw new Error('useFab must be used within a FabProvider');
  }
  return context;
}
