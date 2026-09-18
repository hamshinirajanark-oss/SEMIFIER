import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useFab } from '../context/FabContext';
import { SimulationParameters } from '../types';
import {
  DEFAULT_SIMULATION_PARAMS,
  HIGH_YIELD_PRESET_PARAMS,
} from '../utils/physicsEngine';

export function NewSimulationView() {
  const { runSimulation, navigate, currentUser, activeWafer } = useFab();

  const [params, setParams] = useState<SimulationParameters>(DEFAULT_SIMULATION_PARAMS);
  const [runName, setRunName] = useState<string>(`FinFET_Sim_${Date.now().toString().slice(-4)}`);
  const [engineer, setEngineer] = useState<string>(currentUser.name);
  const [lotId, setLotId] = useState<string>(activeWafer.lotId);
  const [waferId, setWaferId] = useState<string>(activeWafer.id);
  const [toolId, setToolId] = useState<string>('ASML-EUV-Twin-03');
  const [recipeId, setRecipeId] = useState<string>('REC-FINFET-PROT-v4');

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Quick Preset Handlers
  const handleLoadBaseline = () => {
    setParams(DEFAULT_SIMULATION_PARAMS);
    setRunName(`Twin_Baseline_${Date.now().toString().slice(-4)}`);
  };

  const handleLoadHighYield = () => {
    setParams(HIGH_YIELD_PRESET_PARAMS);
    setRunName(`HighYield_i9_${Date.now().toString().slice(-4)}`);
  };

  // Submit Handler
  const handleRun = (count: number) => {
    setIsRunning(true);
    setSuccessMessage(null);

    setTimeout(() => {
      const runs = runSimulation(params, {
        runName,
        engineer,
        lotId,
        waferId,
        count,
      });

      setIsRunning(false);
      setSuccessMessage(
        `Successfully completed ${count} simulation ${
          count === 1 ? 'run' : 'batch runs'
        }. Best i9 score: ${runs[0].bestI9Score}. Audit trail logged.`
      );
    }, 500);
  };

  return (
    <div className="space-y-5 font-mono text-xs max-w-6xl mx-auto pb-12">
      {/* Header & Quick Fill Actions */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
              New Simulation — 60+ SPC Process Parameter Entry
            </h2>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
            Statistical Process Control (SPC) parameter matrix for physical yield & i9 bin qualification prediction.
          </p>
        </div>

        {/* Quick Fill Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadBaseline}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded font-medium text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            Load i9 Twin Baseline
          </button>
          <button
            type="button"
            onClick={handleLoadHighYield}
            className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/60 rounded font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            High-Yield i9 Preset
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => navigate('/simulations')}
            className="underline text-emerald-200 hover:text-white flex items-center gap-1"
          >
            View History <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 0. Traceability Block */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
        <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          0. Traceability & Hardware Context
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[10.5px] text-zinc-500 block mb-1">RUN NAME</label>
            <input
              type="text"
              value={runName}
              onChange={(e) => setRunName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="text-[10.5px] text-zinc-500 block mb-1">ENGINEER IN CHARGE</label>
            <input
              type="text"
              value={engineer}
              onChange={(e) => setEngineer(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="text-[10.5px] text-zinc-500 block mb-1">LOT ID</label>
            <input
              type="text"
              value={lotId}
              onChange={(e) => setLotId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="text-[10.5px] text-zinc-500 block mb-1">TOOL / RECIPE ID</label>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="text"
                value={toolId}
                onChange={(e) => setToolId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                value={recipeId}
                onChange={(e) => setRecipeId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY A: Contamination Control (9 fields) */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Category A — Contamination Control (9 Parameters)
          </h3>
          <span className="text-[10.5px] text-zinc-500">Weight: 28%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              label: 'Airborne Particle Count',
              unit: 'part/m³ ≥0.1µm',
              target: '0 - 10',
              crit: '< 30 / > 200',
              val: params.categoryA.airborneParticleCount,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryA: { ...p.categoryA, airborneParticleCount: v },
                })),
            },
            {
              label: 'Wafer Particle Density',
              unit: 'part/cm²',
              target: '0 - 0.10',
              crit: '< 0.35 / > 2.5',
              val: params.categoryA.waferParticleDensity,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryA: { ...p.categoryA, waferParticleDensity: v },
                })),
            },
            {
              label: 'Avg Particle Size',
              unit: 'µm',
              target: '0 - 0.15',
              crit: '> 0.35',
              val: params.categoryA.avgParticleSize,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryA: { ...p.categoryA, avgParticleSize: v },
                })),
            },
            {
              label: 'Max Particle Size',
              unit: 'µm',
              target: '0 - 0.50',
              crit: '> 1.20',
              val: params.categoryA.maxParticleSize,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryA: { ...p.categoryA, maxParticleSize: v },
                })),
            },
            {
              label: 'Metal Contamination Fe/Cu/Ni',
              unit: 'ppb',
              target: '0 - 0.50',
              crit: '> 1.50',
              val: params.categoryA.metalContaminationPpb,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryA: { ...p.categoryA, metalContaminationPpb: v },
                })),
            },
            {
              label: 'Organic Contamination',
              unit: 'ppb',
              target: '0 - 1.00',
              crit: '> 3.00',
              val: params.categoryA.organicContaminationPpb,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryA: { ...p.categoryA, organicContaminationPpb: v },
                })),
            },
            {
              label: 'Process Gas Purity Ar/N2/H2',
              unit: '%',
              target: '99.9995 - 100',
              crit: '< 99.9980',
              val: params.categoryA.gasPurityPct,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryA: { ...p.categoryA, gasPurityPct: v },
                })),
            },
            {
              label: 'DI Water Resistivity',
              unit: 'MΩ·cm',
              target: '18.0 - 18.3',
              crit: '< 17.5',
              val: params.categoryA.diWaterResistivity,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryA: { ...p.categoryA, diWaterResistivity: v },
                })),
            },
            {
              label: 'Wafer Clean Efficiency',
              unit: '%',
              target: '99.0 - 100',
              crit: '< 97.5',
              val: params.categoryA.cleanEfficiencyPct,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryA: { ...p.categoryA, cleanEfficiencyPct: v },
                })),
            },
          ].map((field) => (
            <div key={field.label} className="bg-zinc-900/60 border border-zinc-800/80 p-2.5 rounded space-y-1.5">
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-zinc-300 font-semibold truncate">{field.label}</span>
                <span className="text-zinc-500">{field.unit}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9.5px] text-zinc-500 block">SET VALUE</span>
                  <input
                    type="number"
                    step="any"
                    value={field.val}
                    onChange={(e) => field.setter(+e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-100 text-xs font-semibold focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-0.5 text-[9px]">
                  <span className="text-zinc-500 block">CONTROL BAND</span>
                  <div className="text-emerald-400 bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-800/30 truncate">
                    Tgt: {field.target}
                  </div>
                  <div className="text-rose-400 bg-rose-950/40 px-1 py-0.5 rounded border border-rose-800/30 truncate">
                    Crit: {field.crit}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORY B: Mechanical Stress & Damage (6 fields) */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            Category B — Mechanical Stress & Damage (6 Parameters)
          </h3>
          <span className="text-[10.5px] text-zinc-500">Weight: 22%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              label: 'End-Effector Handling Force',
              unit: 'N',
              target: '1.0 - 2.5',
              crit: '> 3.5',
              val: params.categoryB.handlingForceN,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryB: { ...p.categoryB, handlingForceN: v },
                })),
            },
            {
              label: 'Transfer Alignment Error',
              unit: 'µm',
              target: '0 - 1.5',
              crit: '> 2.8',
              val: params.categoryB.alignmentErrorUm,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryB: { ...p.categoryB, alignmentErrorUm: v },
                })),
            },
            {
              label: 'Wafer Bow',
              unit: 'µm',
              target: '0 - 15',
              crit: '> 28',
              val: params.categoryB.waferBowUm,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryB: { ...p.categoryB, waferBowUm: v },
                })),
            },
            {
              label: 'Wafer Warp',
              unit: 'µm',
              target: '0 - 20',
              crit: '> 35',
              val: params.categoryB.waferWarpUm,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryB: { ...p.categoryB, waferWarpUm: v },
                })),
            },
            {
              label: 'CMP Downforce Pressure',
              unit: 'kPa',
              target: '10 - 18',
              crit: '> 24',
              val: params.categoryB.cmpDownforceKpa,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryB: { ...p.categoryB, cmpDownforceKpa: v },
                })),
            },
            {
              label: 'CMP Pad Condition Score',
              unit: 'Index 0-100',
              target: '85 - 100',
              crit: '< 75',
              val: params.categoryB.cmpPadConditionScore,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryB: { ...p.categoryB, cmpPadConditionScore: v },
                })),
            },
          ].map((field) => (
            <div key={field.label} className="bg-zinc-900/60 border border-zinc-800/80 p-2.5 rounded space-y-1.5">
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-zinc-300 font-semibold truncate">{field.label}</span>
                <span className="text-zinc-500">{field.unit}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9.5px] text-zinc-500 block">SET VALUE</span>
                  <input
                    type="number"
                    step="any"
                    value={field.val}
                    onChange={(e) => field.setter(+e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-100 text-xs font-semibold focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-0.5 text-[9px]">
                  <span className="text-zinc-500 block">CONTROL BAND</span>
                  <div className="text-emerald-400 bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-800/30 truncate">
                    Tgt: {field.target}
                  </div>
                  <div className="text-rose-400 bg-rose-950/40 px-1 py-0.5 rounded border border-rose-800/30 truncate">
                    Crit: {field.crit}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORY C: Photolithography & Alignment (6 fields) */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Category C — Photolithography & Alignment (6 Parameters)
          </h3>
          <span className="text-[10.5px] text-zinc-500">Weight: 32%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              label: 'Photoresist Thickness',
              unit: 'nm',
              target: '36.5 - 40.0',
              crit: '< 34 / > 43',
              val: params.categoryC.photoresistThicknessNm,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryC: { ...p.categoryC, photoresistThicknessNm: v },
                })),
            },
            {
              label: 'Exposure Dose Error',
              unit: '%',
              target: '-1.0 to +1.0',
              crit: '< -2.5 / > +2.5',
              val: params.categoryC.exposureDoseErrorPct,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryC: { ...p.categoryC, exposureDoseErrorPct: v },
                })),
            },
            {
              label: 'Scanner Focus Offset',
              unit: 'µm',
              target: '-0.025 to 0.025',
              crit: '< -0.06 / > 0.06',
              val: params.categoryC.focusOffsetUm,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryC: { ...p.categoryC, focusOffsetUm: v },
                })),
            },
            {
              label: 'Total Overlay Error',
              unit: 'nm',
              target: '0 - 2.20',
              crit: '> 3.80',
              val: params.categoryC.totalOverlayErrorNm,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryC: { ...p.categoryC, totalOverlayErrorNm: v },
                })),
            },
            {
              label: 'Critical Dimension (CD) Error',
              unit: 'nm',
              target: '-0.25 to +0.25',
              crit: '< -0.55 / > 0.55',
              val: params.categoryC.cdErrorNm,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryC: { ...p.categoryC, cdErrorNm: v },
                })),
            },
            {
              label: 'Line Edge Roughness (LER 3σ)',
              unit: 'nm',
              target: '0 - 1.80',
              crit: '> 2.80',
              val: params.categoryC.lerNm,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryC: { ...p.categoryC, lerNm: v },
                })),
            },
          ].map((field) => (
            <div key={field.label} className="bg-zinc-900/60 border border-zinc-800/80 p-2.5 rounded space-y-1.5">
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-zinc-300 font-semibold truncate">{field.label}</span>
                <span className="text-zinc-500">{field.unit}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9.5px] text-zinc-500 block">SET VALUE</span>
                  <input
                    type="number"
                    step="any"
                    value={field.val}
                    onChange={(e) => field.setter(+e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-100 text-xs font-semibold focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-0.5 text-[9px]">
                  <span className="text-zinc-500 block">CONTROL BAND</span>
                  <div className="text-emerald-400 bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-800/30 truncate">
                    Tgt: {field.target}
                  </div>
                  <div className="text-rose-400 bg-rose-950/40 px-1 py-0.5 rounded border border-rose-800/30 truncate">
                    Crit: {field.crit}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORY D: Environmental & Process Stability (5 fields) */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Category D — Environmental & Process Stability (5 Parameters)
          </h3>
          <span className="text-[10.5px] text-zinc-500">Weight: 18%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              label: 'Deposition Chamber Temp',
              unit: '°C',
              target: '395 - 405',
              crit: '< 388 / > 412',
              val: params.categoryD.chamberTempC,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryD: { ...p.categoryD, chamberTempC: v },
                })),
            },
            {
              label: 'RF Plasma Power Drift',
              unit: 'W',
              target: '-2.0 to +2.0',
              crit: '< -5.0 / > 5.0',
              val: params.categoryD.rfPlasmaPowerDriftW,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryD: { ...p.categoryD, rfPlasmaPowerDriftW: v },
                })),
            },
            {
              label: 'Precursor Gas Flow Rate',
              unit: 'sccm',
              target: '145 - 155',
              crit: '< 138 / > 162',
              val: params.categoryD.gasFlowRateSccm,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryD: { ...p.categoryD, gasFlowRateSccm: v },
                })),
            },
            {
              label: 'Cleanroom Humidity',
              unit: '%',
              target: '42.0 - 45.0',
              crit: '< 38.0 / > 49.0',
              val: params.categoryD.cleanroomHumidityPct,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryD: { ...p.categoryD, cleanroomHumidityPct: v },
                })),
            },
            {
              label: 'Susceptor Thermal Gradient',
              unit: '°C',
              target: '0 - 1.20',
              crit: '> 2.20',
              val: params.categoryD.thermalGradientC,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryD: { ...p.categoryD, thermalGradientC: v },
                })),
            },
          ].map((field) => (
            <div key={field.label} className="bg-zinc-900/60 border border-zinc-800/80 p-2.5 rounded space-y-1.5">
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-zinc-300 font-semibold truncate">{field.label}</span>
                <span className="text-zinc-500">{field.unit}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9.5px] text-zinc-500 block">SET VALUE</span>
                  <input
                    type="number"
                    step="any"
                    value={field.val}
                    onChange={(e) => field.setter(+e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-100 text-xs font-semibold focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-0.5 text-[9px]">
                  <span className="text-zinc-500 block">CONTROL BAND</span>
                  <div className="text-emerald-400 bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-800/30 truncate">
                    Tgt: {field.target}
                  </div>
                  <div className="text-rose-400 bg-rose-950/40 px-1 py-0.5 rounded border border-rose-800/30 truncate">
                    Crit: {field.crit}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORY E: Inspection & Metrology Quality (3 fields) */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            Category E — Inspection & Metrology Quality (3 Parameters)
          </h3>
          <span className="text-[10.5px] text-zinc-500">Quality Factor</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              label: 'Defect Density (D0)',
              unit: 'def/cm²',
              target: '0.020 - 0.080',
              crit: '> 0.180',
              val: params.categoryE.defectDensityD0,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryE: { ...p.categoryE, defectDensityD0: v },
                })),
            },
            {
              label: 'Critical Dimension Uniformity (3σ)',
              unit: 'nm',
              target: '0.30 - 0.80',
              crit: '> 1.40',
              val: params.categoryE.cdUniformityNm,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryE: { ...p.categoryE, cdUniformityNm: v },
                })),
            },
            {
              label: 'Inspection Confidence Score',
              unit: '%',
              target: '95.0 - 99.9',
              crit: '< 90.0',
              val: params.categoryE.inspectionConfidencePct,
              setter: (v: number) =>
                setParams((p) => ({
                  ...p,
                  categoryE: { ...p.categoryE, inspectionConfidencePct: v },
                })),
            },
          ].map((field) => (
            <div key={field.label} className="bg-zinc-900/60 border border-zinc-800/80 p-2.5 rounded space-y-1.5">
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-zinc-300 font-semibold truncate">{field.label}</span>
                <span className="text-zinc-500">{field.unit}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9.5px] text-zinc-500 block">SET VALUE</span>
                  <input
                    type="number"
                    step="any"
                    value={field.val}
                    onChange={(e) => field.setter(+e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-100 text-xs font-semibold focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-0.5 text-[9px]">
                  <span className="text-zinc-500 block">CONTROL BAND</span>
                  <div className="text-emerald-400 bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-800/30 truncate">
                    Tgt: {field.target}
                  </div>
                  <div className="text-rose-400 bg-rose-950/40 px-1 py-0.5 rounded border border-rose-800/30 truncate">
                    Crit: {field.crit}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Bar: Single Run, Batch 10, Batch 100 */}
      <div className="sticky bottom-4 z-20 bg-zinc-950/95 border border-zinc-800 rounded-lg p-3.5 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-2 text-zinc-400 text-xs">
          <AlertCircle className="w-4 h-4 text-cyan-400" />
          <span>Batch simulations apply stochastic Monte Carlo jitter across all 60+ parameters.</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isRunning}
            onClick={() => handleRun(1)}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Run Single Simulation
          </button>

          <button
            type="button"
            disabled={isRunning}
            onClick={() => handleRun(10)}
            className="px-4 py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-600/60 rounded font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Run Batch of 10
          </button>

          <button
            type="button"
            disabled={isRunning}
            onClick={() => handleRun(100)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-950 to-cyan-950 hover:from-emerald-900 hover:to-cyan-900 text-emerald-300 border border-emerald-500/60 rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Run Batch of 100
          </button>
        </div>
      </div>
    </div>
  );
}
