import React from 'react';
import {
  Activity,
  CheckCircle2,
  Cpu,
  Layers,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react';
import { useFab } from '../context/FabContext';

export function DefectPreventionView() {
  const {
    defectSignatures,
    toggleDefectSignature,
    resetDefectSignatures,
    cumulativeImpact,
  } = useFab();

  return (
    <div className="space-y-5 font-mono text-xs max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
              Closed-Loop Defect Prevention & Process Optimization Workbench
            </h2>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
            Prescriptive engineering countermeasures targeting known baseline defect signatures.
          </p>
        </div>

        <button
          onClick={resetDefectSignatures}
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          Reset All Fixes
        </button>
      </div>

      {/* Cumulative Impact Bar (Top) */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-zinc-950 to-cyan-950/50 border border-emerald-500/60 rounded-lg p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
          <span className="font-bold text-xs text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Cumulative Optimization Yield Impact
          </span>
          <span className="text-xs text-zinc-400">
            Active Countermeasures:{' '}
            <strong className="text-emerald-400">
              {cumulativeImpact.actionsActivated} / {defectSignatures.length}
            </strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-zinc-900/70 p-2.5 rounded border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 block">PREDICTED i9 YIELD GAIN</span>
            <span className="text-xl font-bold text-cyan-400">
              +{cumulativeImpact.predictedI9GainPct}%
            </span>
            <span className="text-[10px] text-zinc-500 block">Super-bin qualification boost</span>
          </div>

          <div className="bg-zinc-900/70 p-2.5 rounded border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 block">OVERALL FUNCTIONAL YIELD GAIN</span>
            <span className="text-xl font-bold text-emerald-400">
              +{cumulativeImpact.grossYieldGainPct}%
            </span>
            <span className="text-[10px] text-zinc-500 block">Total wafer line yield</span>
          </div>

          <div className="bg-zinc-900/70 p-2.5 rounded border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 block">ESTIMATED REVENUE UPLIFT</span>
            <span className="text-xl font-bold text-amber-400">
              +${(cumulativeImpact.predictedI9GainPct * 480).toLocaleString()} / lot
            </span>
            <span className="text-[10px] text-zinc-500 block">Based on $750 i9 ASP margin</span>
          </div>
        </div>
      </div>

      {/* 5 Defect Signature Action Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
          <Wrench className="w-3.5 h-3.5 text-cyan-400" />
          Targeted Defect Signatures & Countermeasures
        </h3>

        <div className="space-y-3">
          {defectSignatures.map((sig) => (
            <div
              key={sig.id}
              className={`p-4 rounded-lg border transition-all ${
                sig.applied
                  ? 'bg-zinc-950 border-emerald-500/60 shadow-md shadow-emerald-950/20'
                  : 'bg-zinc-950/90 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={sig.applied}
                    onChange={() => toggleDefectSignature(sig.id)}
                    className="w-4 h-4 mt-0.5 accent-emerald-500 rounded cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-zinc-100">{sig.title}</span>
                      <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-800 font-mono">
                        {sig.id} • {sig.category}
                      </span>
                      {sig.toolTarget && (
                        <span className="text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.2 rounded border border-zinc-800">
                          {sig.toolTarget}
                        </span>
                      )}
                    </div>
                    {sig.subtitle && (
                      <p className="text-[11.5px] text-zinc-400 font-sans mt-0.5">{sig.subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block">IMPACT PREDICTION</span>
                    <span className="text-xs font-bold text-emerald-400">
                      +{sig.i9GainPct}% i9 • +{sig.yieldGainPct}% Yield
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-[10.5px] font-bold ${
                      sig.applied
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    {sig.applied ? 'APPLIED' : 'ADVISORY'}
                  </span>
                </div>
              </div>

              {/* Body: Root Cause & Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 text-[11px] font-sans">
                <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80 space-y-1">
                  <span className="font-bold text-amber-400 font-mono text-[10px] uppercase block">
                    Root Cause Physics
                  </span>
                  <p className="text-zinc-300 leading-relaxed">{sig.rootCause || sig.rootCauseMechanism}</p>
                </div>

                <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80 space-y-1">
                  <span className="font-bold text-emerald-400 font-mono text-[10px] uppercase block">
                    Corrective Recipe Setpoint Adjustment
                  </span>
                  <p className="text-zinc-300 leading-relaxed">{sig.action || sig.recommendedAction}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
