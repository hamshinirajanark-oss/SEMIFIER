import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  GitCompare,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useFab } from '../context/FabContext';
import { DEFAULT_SIMULATION_PARAMS } from '../utils/physicsEngine';

export function WhatIfAnalysisView() {
  const { activeWafer, runSimulation, navigate } = useFab();

  // 4 interactive sliders
  const [overlayDelta, setOverlayDelta] = useState<number>(-0.6); // nm reduction
  const [thermalDelta, setThermalDelta] = useState<number>(-0.4); // °C reduction
  const [particleDelta, setParticleDelta] = useState<number>(-8); // part/m3 reduction
  const [cmpDelta, setCmpDelta] = useState<number>(-2.0); // kPa reduction

  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [appliedMsg, setAppliedMsg] = useState<string | null>(null);

  // Calculate projected yields
  const baselineYield = activeWafer.predictedYieldPct;
  const baselineI9Yield = parseFloat(
    ((activeWafer.binDistribution.i9 / (activeWafer.validDies || 1)) * 100).toFixed(1)
  );
  const baselineDefectRisk = activeWafer.avgDefectRiskPct;

  // Physics projection estimation
  const overlayBenefit = Math.abs(overlayDelta) * 2.2;
  const thermalBenefit = Math.abs(thermalDelta) * 3.5;
  const particleBenefit = (Math.abs(particleDelta) / 15) * 2.8;
  const cmpBenefit = (Math.abs(cmpDelta) / 4) * 1.5;

  const totalI9Gain = parseFloat((overlayBenefit + thermalBenefit + particleBenefit + cmpBenefit).toFixed(1));
  const totalYieldGain = parseFloat((totalI9Gain * 0.55).toFixed(1));
  const defectReduction = parseFloat((totalI9Gain * 0.45).toFixed(1));

  const projectedI9Yield = Math.min(65.0, parseFloat((baselineI9Yield + totalI9Gain).toFixed(1)));
  const projectedYield = Math.min(99.0, parseFloat((baselineYield + totalYieldGain).toFixed(1)));
  const projectedDefectRisk = Math.max(1.0, parseFloat((baselineDefectRisk - defectReduction).toFixed(1)));

  const handleApplyToActiveTwin = () => {
    setIsApplying(true);
    setTimeout(() => {
      // Modify params according to deltas
      const newParams = {
        ...DEFAULT_SIMULATION_PARAMS,
        categoryC: {
          ...DEFAULT_SIMULATION_PARAMS.categoryC,
          totalOverlayErrorNm: Math.max(
            0.5,
            DEFAULT_SIMULATION_PARAMS.categoryC.totalOverlayErrorNm + overlayDelta
          ),
        },
        categoryD: {
          ...DEFAULT_SIMULATION_PARAMS.categoryD,
          thermalGradientC: Math.max(
            0.2,
            DEFAULT_SIMULATION_PARAMS.categoryD.thermalGradientC + thermalDelta
          ),
        },
        categoryA: {
          ...DEFAULT_SIMULATION_PARAMS.categoryA,
          airborneParticleCount: Math.max(
            1,
            DEFAULT_SIMULATION_PARAMS.categoryA.airborneParticleCount + particleDelta
          ),
        },
        categoryB: {
          ...DEFAULT_SIMULATION_PARAMS.categoryB,
          cmpDownforceKpa: Math.max(
            10,
            DEFAULT_SIMULATION_PARAMS.categoryB.cmpDownforceKpa + cmpDelta
          ),
        },
      };

      runSimulation(newParams, {
        runName: `WhatIf_Optimized_${Date.now().toString().slice(-4)}`,
        count: 1,
      });

      setIsApplying(false);
      setAppliedMsg('Successfully applied What-If optimized parameters as new active Wafer Twin.');
    }, 500);
  };

  const handleResetSliders = () => {
    setOverlayDelta(0);
    setThermalDelta(0);
    setParticleDelta(0);
    setCmpDelta(0);
  };

  return (
    <div className="space-y-5 font-mono text-xs max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
              What-If Yield Simulation & Process Delta Engine
            </h2>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
            Evaluate hypothetical recipe tuning setpoints against active baseline twin before fab deployment.
          </p>
        </div>

        <button
          onClick={handleResetSliders}
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          Reset Setpoints
        </button>
      </div>

      {appliedMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{appliedMsg}</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="underline text-emerald-200 hover:text-white flex items-center gap-1"
          >
            View in 3D <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Baseline Wafer */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-bold text-xs text-zinc-300 uppercase tracking-wider">
              Baseline Wafer Twin ({activeWafer.id})
            </span>
            <span className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">
              CURRENT
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-2">
            <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block">i9 SUPER-BIN</span>
              <span className="text-xl font-bold text-zinc-200">{baselineI9Yield}%</span>
            </div>
            <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block">OVERALL YIELD</span>
              <span className="text-xl font-bold text-zinc-200">{baselineYield}%</span>
            </div>
            <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block">DEFECT RISK</span>
              <span className="text-xl font-bold text-zinc-200">{baselineDefectRisk}%</span>
            </div>
          </div>

          <div className="space-y-1.5 text-zinc-400 text-[11px] pt-1">
            <div className="flex justify-between">
              <span>Litho Overlay Error:</span>
              <span className="text-zinc-200">1.85 nm</span>
            </div>
            <div className="flex justify-between">
              <span>Susceptor Gradient:</span>
              <span className="text-zinc-200">0.82 °C</span>
            </div>
            <div className="flex justify-between">
              <span>Airborne Particles:</span>
              <span className="text-zinc-200">12 part/m³</span>
            </div>
            <div className="flex justify-between">
              <span>CMP Downforce:</span>
              <span className="text-zinc-200">14.2 kPa</span>
            </div>
          </div>
        </div>

        {/* Card 2: What-If Optimized Wafer */}
        <div className="bg-zinc-950 border border-purple-500/50 rounded-lg p-4 space-y-3 shadow-lg shadow-purple-950/20">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-bold text-xs text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Hypothetical Optimized Twin
            </span>
            <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-700 font-semibold">
              PROJECTED
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-2">
            <div className="bg-purple-950/30 p-2.5 rounded border border-purple-800/40">
              <span className="text-[10px] text-purple-300 block">i9 SUPER-BIN</span>
              <span className="text-xl font-bold text-cyan-300">{projectedI9Yield}%</span>
              <span className="text-[10px] text-emerald-400 block font-semibold">
                +{totalI9Gain}%
              </span>
            </div>
            <div className="bg-purple-950/30 p-2.5 rounded border border-purple-800/40">
              <span className="text-[10px] text-purple-300 block">OVERALL YIELD</span>
              <span className="text-xl font-bold text-emerald-300">{projectedYield}%</span>
              <span className="text-[10px] text-emerald-400 block font-semibold">
                +{totalYieldGain}%
              </span>
            </div>
            <div className="bg-purple-950/30 p-2.5 rounded border border-purple-800/40">
              <span className="text-[10px] text-purple-300 block">DEFECT RISK</span>
              <span className="text-xl font-bold text-amber-300">{projectedDefectRisk}%</span>
              <span className="text-[10px] text-emerald-400 block font-semibold">
                -{defectReduction}%
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-zinc-400 text-[11px] pt-1">
            <div className="flex justify-between">
              <span>Adjusted Overlay:</span>
              <span className="text-cyan-300 font-semibold">
                {(1.85 + overlayDelta).toFixed(2)} nm ({overlayDelta > 0 ? `+${overlayDelta}` : overlayDelta} nm)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Adjusted Thermal:</span>
              <span className="text-cyan-300 font-semibold">
                {(0.82 + thermalDelta).toFixed(2)} °C ({thermalDelta > 0 ? `+${thermalDelta}` : thermalDelta} °C)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Adjusted Particles:</span>
              <span className="text-cyan-300 font-semibold">
                {Math.max(1, 12 + particleDelta)} part/m³ ({particleDelta > 0 ? `+${particleDelta}` : particleDelta})
              </span>
            </div>
            <div className="flex justify-between">
              <span>Adjusted CMP:</span>
              <span className="text-cyan-300 font-semibold">
                {(14.2 + cmpDelta).toFixed(1)} kPa ({cmpDelta > 0 ? `+${cmpDelta}` : cmpDelta} kPa)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Interactive Adjustment Sliders */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="font-bold text-xs text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            Interactive Recipe Tuning Sliders
          </span>
          <span className="text-[10.5px] text-zinc-500">Live Mathematical Sensitivity</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Slider 1: Overlay Error */}
          <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-zinc-300">1. Scanner Overlay Delta</span>
              <span className="text-cyan-400 font-bold bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                {overlayDelta > 0 ? `+${overlayDelta}` : overlayDelta} nm
              </span>
            </div>
            <input
              type="range"
              min="-1.5"
              max="0.5"
              step="0.05"
              value={overlayDelta}
              onChange={(e) => setOverlayDelta(+e.target.value)}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>-1.5 nm (ASML high-order corr)</span>
              <span>0 nm</span>
              <span>+0.5 nm</span>
            </div>
          </div>

          {/* Slider 2: Susceptor Thermal Gradient */}
          <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-zinc-300">2. Susceptor Thermal Gradient Delta</span>
              <span className="text-purple-400 font-bold bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                {thermalDelta > 0 ? `+${thermalDelta}` : thermalDelta} °C
              </span>
            </div>
            <input
              type="range"
              min="-0.8"
              max="0.4"
              step="0.05"
              value={thermalDelta}
              onChange={(e) => setThermalDelta(+e.target.value)}
              className="w-full accent-purple-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>-0.8 °C (Zone lamp tune)</span>
              <span>0 °C</span>
              <span>+0.4 °C</span>
            </div>
          </div>

          {/* Slider 3: Airborne Particle Count */}
          <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-zinc-300">3. Airborne Particles Delta</span>
              <span className="text-amber-400 font-bold bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                {particleDelta > 0 ? `+${particleDelta}` : particleDelta} part/m³
              </span>
            </div>
            <input
              type="range"
              min="-15"
              max="5"
              step="1"
              value={particleDelta}
              onChange={(e) => setParticleDelta(+e.target.value)}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>-15 part/m³ (ULPA purge)</span>
              <span>0 part/m³</span>
              <span>+5 part/m³</span>
            </div>
          </div>

          {/* Slider 4: CMP Downforce */}
          <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-zinc-300">4. CMP Downforce Delta</span>
              <span className="text-emerald-400 font-bold bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                {cmpDelta > 0 ? `+${cmpDelta}` : cmpDelta} kPa
              </span>
            </div>
            <input
              type="range"
              min="-4.0"
              max="2.0"
              step="0.2"
              value={cmpDelta}
              onChange={(e) => setCmpDelta(+e.target.value)}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>-4.0 kPa (Gentle polish)</span>
              <span>0 kPa</span>
              <span>+2.0 kPa</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-zinc-800 flex justify-end">
          <button
            onClick={handleApplyToActiveTwin}
            disabled={isApplying}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-950 to-cyan-950 hover:from-purple-900 hover:to-cyan-900 text-cyan-300 border border-cyan-500/60 rounded font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            {isApplying ? 'Re-synthesizing FinFET Twin...' : 'Apply as New Active Wafer Twin'}
          </button>
        </div>
      </div>
    </div>
  );
}
