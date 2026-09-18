import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  Award,
  Check,
  CheckCircle2,
  Clock,
  Cpu,
  Flame,
  History,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Die, ProcessorBin } from '../../types';
import { useFab } from '../../context/FabContext';

interface SelectedDiePanelProps {
  die: Die | null;
}

export function SelectedDiePanel({ die }: SelectedDiePanelProps) {
  const { defectSignatures, createProcessTwin, navigate } = useFab();
  const [activeTab, setActiveTab] = useState<'Overview' | 'Performance' | 'Defects' | 'Root Cause' | 'Historical' | 'i9 Factors'>('Overview');
  const [hasRunPerfSim, setHasRunPerfSim] = useState(false);
  const [twinCreated, setTwinCreated] = useState<string | null>(null);

  if (!die) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 text-center text-zinc-500 font-mono text-xs">
        <Cpu className="w-8 h-8 mx-auto mb-2 text-zinc-700 animate-pulse" />
        <p>No die selected.</p>
        <p className="text-[11px] text-zinc-600 mt-1">Click on any die on the 3D wafer disc to inspect telemetry.</p>
      </div>
    );
  }

  const handleCreateTwin = () => {
    const twinName = `Twin_${die.id}_Bin_${die.predictedBin}_${Date.now().toString().slice(-4)}`;
    const twin = createProcessTwin(twinName, `SIM-${die.id}`);
    setTwinCreated(twin.id);
  };

  const matchedSig = defectSignatures.find((s) => s.id === die.matchedSignatureId);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden flex flex-col shadow-xl">
      {/* Panel Header */}
      <div className="p-3.5 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-zinc-100">{die.id}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  die.predictedBin === 'i9'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                    : die.predictedBin === 'i7'
                    ? 'bg-blue-950 text-blue-300 border border-blue-700'
                    : die.predictedBin === 'i5'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : die.predictedBin === 'i3'
                    ? 'bg-amber-950 text-amber-300 border border-amber-700'
                    : 'bg-rose-950 text-rose-300 border border-rose-700'
                }`}
              >
                Bin {die.predictedBin}-Capable
              </span>
            </div>
            <span className="text-[10.5px] font-mono text-zinc-400">
              Zone: <strong className="text-zinc-300">{die.regionStatus}</strong> • Dist: {die.centerDistMm}mm
            </span>
          </div>
        </div>

        <div className="text-right font-mono text-[11px]">
          <span className="text-zinc-500">Confidence: </span>
          <span className="text-emerald-400 font-semibold">{die.modelConfidencePct}%</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center bg-zinc-900/40 border-b border-zinc-800 px-2 overflow-x-auto text-xs font-mono">
        {(['Overview', 'Performance', 'Defects', 'Root Cause', 'Historical', 'i9 Factors'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? 'border-cyan-400 text-cyan-300 bg-zinc-900/80'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[380px] font-mono text-xs text-zinc-300 space-y-4">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'Overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-zinc-900/70 p-2.5 rounded border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">GRID COORDINATES</span>
                <span className="text-sm font-semibold text-zinc-200">
                  X: {die.gridX}, Y: {die.gridY}
                </span>
              </div>
              <div className="bg-zinc-900/70 p-2.5 rounded border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">EDGE DISTANCE</span>
                <span className="text-sm font-semibold text-zinc-200">{die.edgeDistMm} mm</span>
              </div>
              <div className="bg-zinc-900/70 p-2.5 rounded border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">DEFECT RISK</span>
                <span
                  className={`text-sm font-semibold ${
                    die.defectRiskPct > 20 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {die.defectRiskPct}%
                </span>
              </div>
              <div className="bg-zinc-900/70 p-2.5 rounded border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">ELECTRICAL PASS</span>
                <span className="text-sm font-semibold text-cyan-400">
                  {die.electricalPassProbPct}%
                </span>
              </div>
            </div>

            {/* Probability Breakdown Bar */}
            <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400 uppercase tracking-wider">Per-Bin Probability Matrix</span>
                <span className="text-cyan-400">P(i9) = {(die.binProbabilities.i9 * 100).toFixed(1)}%</span>
              </div>

              <div className="w-full h-3 bg-zinc-800 rounded-sm overflow-hidden flex">
                <div
                  style={{ width: `${die.binProbabilities.i9 * 100}%` }}
                  className="bg-cyan-500 h-full"
                  title={`i9: ${(die.binProbabilities.i9 * 100).toFixed(1)}%`}
                />
                <div
                  style={{ width: `${die.binProbabilities.i7 * 100}%` }}
                  className="bg-blue-500 h-full"
                  title={`i7: ${(die.binProbabilities.i7 * 100).toFixed(1)}%`}
                />
                <div
                  style={{ width: `${die.binProbabilities.i5 * 100}%` }}
                  className="bg-emerald-500 h-full"
                  title={`i5: ${(die.binProbabilities.i5 * 100).toFixed(1)}%`}
                />
                <div
                  style={{ width: `${die.binProbabilities.i3 * 100}%` }}
                  className="bg-amber-500 h-full"
                  title={`i3: ${(die.binProbabilities.i3 * 100).toFixed(1)}%`}
                />
                <div
                  style={{ width: `${die.binProbabilities.reject * 100}%` }}
                  className="bg-rose-500 h-full"
                  title={`Reject: ${(die.binProbabilities.reject * 100).toFixed(1)}%`}
                />
              </div>

              <div className="grid grid-cols-5 text-center text-[10px] text-zinc-400 pt-1">
                <div>i9: <span className="text-zinc-200">{(die.binProbabilities.i9 * 100).toFixed(0)}%</span></div>
                <div>i7: <span className="text-zinc-200">{(die.binProbabilities.i7 * 100).toFixed(0)}%</span></div>
                <div>i5: <span className="text-zinc-200">{(die.binProbabilities.i5 * 100).toFixed(0)}%</span></div>
                <div>i3: <span className="text-zinc-200">{(die.binProbabilities.i3 * 100).toFixed(0)}%</span></div>
                <div>Rej: <span className="text-zinc-200">{(die.binProbabilities.reject * 100).toFixed(0)}%</span></div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PERFORMANCE */}
        {activeTab === 'Performance' && (
          <div className="space-y-3">
            <div className="bg-amber-950/40 border border-amber-500/30 p-2.5 rounded text-[11px] text-amber-300 flex items-center justify-between">
              <span>⚠ VIRTUAL PERFORMANCE ESTIMATE — SIMULATION ONLY. Physical automated test equipment (ATE) verification mandatory.</span>
            </div>

            {die.performanceEstimate ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="bg-zinc-900/80 p-2.5 rounded border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">EST. MAX FREQUENCY</span>
                    <span className="text-base font-bold text-cyan-400">
                      {die.performanceEstimate.maxFreqGHz} GHz
                    </span>
                    <span className="text-[9.5px] text-zinc-500 block">Single-core boost</span>
                  </div>
                  <div className="bg-zinc-900/80 p-2.5 rounded border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">ALL-CORE STABLE</span>
                    <span className="text-base font-bold text-zinc-200">
                      {die.performanceEstimate.stableFreqGHz} GHz
                    </span>
                    <span className="text-[9.5px] text-zinc-500 block">Thermal envelope safe</span>
                  </div>
                  <div className="bg-zinc-900/80 p-2.5 rounded border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">STATIC LEAKAGE</span>
                    <span className="text-base font-bold text-amber-400">
                      {die.performanceEstimate.staticLeakageMw} mW
                    </span>
                    <span className="text-[9.5px] text-zinc-500 block">Sub-threshold channel</span>
                  </div>
                  <div className="bg-zinc-900/80 p-2.5 rounded border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">THERMAL MARGIN</span>
                    <span className="text-base font-bold text-emerald-400">
                      +{die.performanceEstimate.thermalMarginC} °C
                    </span>
                    <span className="text-[9.5px] text-zinc-500 block">Tcase headroom</span>
                  </div>
                  <div className="bg-zinc-900/80 p-2.5 rounded border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">PACKAGE POWER</span>
                    <span className="text-base font-bold text-zinc-200">
                      {die.performanceEstimate.powerW} W
                    </span>
                    <span className="text-[9.5px] text-zinc-500 block">PL1 target</span>
                  </div>
                  <div className="bg-zinc-900/80 p-2.5 rounded border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">SYNTHETIC SCORE</span>
                    <span className="text-base font-bold text-cyan-400">
                      {die.performanceEstimate.perfScore}/100
                    </span>
                    <span className="text-[9.5px] text-zinc-500 block">Bin qualification index</span>
                  </div>
                </div>

                <button
                  onClick={() => setHasRunPerfSim(true)}
                  className="w-full py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 rounded text-cyan-300 font-medium flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  {hasRunPerfSim ? 'Re-Run Transistor Gate Delay Monte Carlo' : 'Run Chip Performance Simulation'}
                </button>
              </div>
            ) : (
              <p className="text-zinc-500">Performance estimate unavailable for edge-excluded die.</p>
            )}
          </div>
        )}

        {/* TAB 3: DEFECTS */}
        {activeTab === 'Defects' && (
          <div className="space-y-3">
            <p className="text-[11px] text-zinc-400">
              Per-die defect risk breakdown across the 5 inline fabrication process categories:
            </p>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Photolithography Overlay & Focus</span>
                  <span className="text-zinc-200">{die.defectBreakdown.lithography}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded overflow-hidden">
                  <div className="bg-cyan-400 h-full" style={{ width: `${die.defectBreakdown.lithography}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Contamination (Airborne & Wet Clean)</span>
                  <span className="text-zinc-200">{die.defectBreakdown.contamination}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded overflow-hidden">
                  <div className="bg-amber-400 h-full" style={{ width: `${die.defectBreakdown.contamination}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Mechanical Stress & CMP Dishing</span>
                  <span className="text-zinc-200">{die.defectBreakdown.mechanical}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded overflow-hidden">
                  <div className="bg-purple-400 h-full" style={{ width: `${die.defectBreakdown.mechanical}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Environmental Chamber Thermals</span>
                  <span className="text-zinc-200">{die.defectBreakdown.environmental}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: `${die.defectBreakdown.environmental}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Metrology Calibration Variance</span>
                  <span className="text-zinc-200">{die.defectBreakdown.metrology}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded overflow-hidden">
                  <div className="bg-blue-400 h-full" style={{ width: `${die.defectBreakdown.metrology}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ROOT CAUSE */}
        {activeTab === 'Root Cause' && (
          <div className="space-y-3">
            {matchedSig ? (
              <div className="bg-zinc-900/80 border border-amber-500/40 rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold text-xs">{matchedSig.id} — {matchedSig.category}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-950 border border-amber-800 rounded text-amber-300">
                    {matchedSig.historicalLikelihoodPct}% Match
                  </span>
                </div>
                <h4 className="font-semibold text-zinc-200 text-xs">{matchedSig.title}</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{matchedSig.rootCauseMechanism}</p>
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500">Action: {matchedSig.applied ? 'APPLIED IN FAB' : 'PENDING'}</span>
                  <button
                    onClick={() => navigate('/defect-prevention')}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Open Defect Workbench →
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900/60 p-4 rounded border border-zinc-800 text-center text-zinc-400">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
                <p className="font-semibold text-zinc-200">Zero Critical Defect Signatures</p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Parameters for die {die.id} sit well within nominal 6-sigma process tolerance bounds.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: HISTORICAL */}
        {activeTab === 'Historical' && (
          <div className="space-y-3">
            <p className="text-[11px] text-zinc-400">
              Nearest historical fabrication lots sharing a similar parameter fingerprint for this wafer region:
            </p>
            <div className="space-y-2">
              <div className="bg-zinc-900/70 p-2.5 rounded border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-zinc-200 font-semibold block">LOT-2025-GOLD-01</span>
                  <span className="text-[10px] text-zinc-500">Center Die Macro • i9 Super-Bin Benchmark</span>
                </div>
                <span className="text-cyan-400 font-bold">98.4% match</span>
              </div>
              <div className="bg-zinc-900/70 p-2.5 rounded border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-zinc-200 font-semibold block">LOT-2026-N881</span>
                  <span className="text-[10px] text-zinc-500">Advanced FinFET v4.2 Production Lot</span>
                </div>
                <span className="text-cyan-400 font-bold">94.8% match</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/historical-experience')}
              className="text-xs text-cyan-400 hover:underline pt-1 block"
            >
              Explore Full 1,020+ Historical Records Engine →
            </button>
          </div>
        )}

        {/* TAB 6: i9 FACTORS */}
        {activeTab === 'i9 Factors' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">Why this die qualifies for i9 tier:</span>
              <span className="text-[10px] text-zinc-500">SEMI E10 Compliance</span>
            </div>

            <ul className="space-y-1.5">
              {die.featureInfluence.map((influence, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[11px] text-zinc-300">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{influence}</span>
                </li>
              ))}
            </ul>

            <p className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
              * Statistical influence scores derived from multi-variate process correlation, not direct physical proof of causation.
            </p>

            <div className="pt-2">
              <button
                onClick={handleCreateTwin}
                className="w-full py-2 bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-600/60 rounded text-cyan-200 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                {twinCreated ? 'Twin Baseline Saved!' : 'Create i9 Process Twin Baseline'}
              </button>
              {twinCreated && (
                <div className="mt-2 p-2 bg-emerald-950/60 border border-emerald-500/40 rounded text-[11px] text-emerald-300 flex items-center justify-between">
                  <span>Baseline snapshot created: {twinCreated}</span>
                  <button onClick={() => navigate('/twin-models')} className="underline">
                    View in Models →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
