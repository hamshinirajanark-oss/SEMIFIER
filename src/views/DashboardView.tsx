import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Copy,
  Cpu,
  Disc3,
  GitCompare,
  History,
  Play,
  PlusCircle,
  ShieldAlert,
  SlidersHorizontal,
  Trophy,
  Zap,
} from 'lucide-react';
import { useFab } from '../context/FabContext';

export function DashboardView() {
  const {
    activeWafer,
    simulationRuns,
    defectSignatures,
    cumulativeImpact,
    navigate,
    seedDemoRuns,
  } = useFab();

  const validDies = activeWafer.validDies || 1;
  const i9Rate = ((activeWafer.binDistribution.i9 / validDies) * 100).toFixed(1);
  const i7Rate = ((activeWafer.binDistribution.i7 / validDies) * 100).toFixed(1);

  return (
    <div className="space-y-5 font-mono">
      {/* Top Banner with Quick Seed if 0 simulations */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-950 border border-zinc-800 rounded-lg p-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <h2 className="text-base font-bold text-zinc-100 uppercase tracking-wide">
              Fab Yield Telemetry & Process Health Overview
            </h2>
          </div>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Real-time digital twin inference for Lot {activeWafer.lotId} • FinFET Advanced 3nm Node
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {simulationRuns.length === 0 && (
            <button
              onClick={seedDemoRuns}
              className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 rounded text-cyan-300 text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              Seed Demo Simulations
            </button>
          )}
          <button
            onClick={() => navigate('/simulations/new')}
            className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 rounded text-emerald-300 text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            + New Simulation
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5">
          <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Simulations Run</span>
          <span className="text-2xl font-bold text-zinc-100">{simulationRuns.length}</span>
          <span className="text-[10px] text-zinc-500 block mt-1">Audit trail logged</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5">
          <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Predicted Yield</span>
          <span className="text-2xl font-bold text-emerald-400">{activeWafer.predictedYieldPct}%</span>
          <span className="text-[10px] text-zinc-500 block mt-1">Poisson-Murphy</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5">
          <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">i9 Super-Bin Rate</span>
          <span className="text-2xl font-bold text-cyan-400">{i9Rate}%</span>
          <span className="text-[10px] text-zinc-500 block mt-1">
            {activeWafer.binDistribution.i9} dies qualified
          </span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5">
          <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">i7 High-Bin Rate</span>
          <span className="text-2xl font-bold text-blue-400">{i7Rate}%</span>
          <span className="text-[10px] text-zinc-500 block mt-1">
            {activeWafer.binDistribution.i7} dies qualified
          </span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5">
          <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Defect Risk D0</span>
          <span className="text-2xl font-bold text-amber-400">{activeWafer.avgDefectRiskPct}%</span>
          <span className="text-[10px] text-zinc-500 block mt-1">
            Crit: {activeWafer.avgCriticalDefectPct}%
          </span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5">
          <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Applied Fixes</span>
          <span className="text-2xl font-bold text-emerald-400">
            +{cumulativeImpact.predictedI9GainPct}%
          </span>
          <span className="text-[10px] text-zinc-500 block mt-1">
            {cumulativeImpact.actionsActivated}/5 actions active
          </span>
        </div>
      </div>

      {/* Center Layout: Mini Wafer Preview + Category Health Radar + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Mini Wafer Card (4 cols) */}
        <div className="lg:col-span-4 bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-bold text-xs text-zinc-200 flex items-center gap-2 uppercase tracking-wider">
              <Disc3 className="w-4 h-4 text-cyan-400" />
              Active Wafer Map
            </span>
            <button
              onClick={() => navigate('/')}
              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
            >
              Open 3D Twin <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Mini Wafer SVG Grid Preview */}
          <div className="w-full h-48 bg-zinc-900/60 rounded-md border border-zinc-800/80 relative flex items-center justify-center overflow-hidden">
            <svg viewBox="-160 -160 320 320" className="w-44 h-44">
              {/* Wafer boundary */}
              <circle cx="0" cy="0" r="148" fill="#18181b" stroke="#27272a" strokeWidth="2" />
              <circle cx="0" cy="0" r="138" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" />
              {/* Notch */}
              <rect x="-3" y="144" width="6" height="5" fill="#38bdf8" />
              {/* Sample dies */}
              {activeWafer.dies.slice(0, 180).map((d, i) => {
                const step = 14.5;
                const x = d.gridX * step;
                const y = d.gridY * step;
                const fill =
                  d.predictedBin === 'i9'
                    ? '#06b6d4'
                    : d.predictedBin === 'i7'
                    ? '#3b82f6'
                    : d.predictedBin === 'i5'
                    ? '#10b981'
                    : d.predictedBin === 'i3'
                    ? '#f59e0b'
                    : '#ef4444';

                return (
                  <rect
                    key={i}
                    x={x - 6}
                    y={y - 5}
                    width="12"
                    height="10"
                    rx="1"
                    fill={fill}
                    opacity="0.85"
                  />
                );
              })}
            </svg>
            <span className="absolute bottom-2 left-2 text-[10px] text-zinc-500 bg-zinc-950/80 px-1.5 py-0.5 rounded border border-zinc-800">
              300mm Standard Grid
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Lot Serial:</span>
              <span className="text-zinc-200">{activeWafer.lotId}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Wafer Index:</span>
              <span className="text-zinc-200">{activeWafer.id}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Die Dimensions:</span>
              <span className="text-zinc-200">{activeWafer.dieSizeX} × {activeWafer.dieSizeY} mm</span>
            </div>
          </div>
        </div>

        {/* 5-Category Process Health Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-bold text-xs text-zinc-200 flex items-center gap-2 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-emerald-400" />
              Category Defect Pressure
            </span>
            <span className="text-[10px] text-zinc-500">SEMI E10</span>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-zinc-400">Photolithography Overlay (32%)</span>
                <span className="text-cyan-400 font-semibold">96.2% Pass</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: '96.2%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-zinc-400">Contamination Control (28%)</span>
                <span className="text-amber-400 font-semibold">91.5% Pass</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded overflow-hidden">
                <div className="h-full bg-amber-400" style={{ width: '91.5%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-zinc-400">Mechanical & CMP Downforce (22%)</span>
                <span className="text-purple-400 font-semibold">94.8% Pass</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded overflow-hidden">
                <div className="h-full bg-purple-400" style={{ width: '94.8%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-zinc-400">Environmental Chamber Temp (18%)</span>
                <span className="text-emerald-400 font-semibold">98.1% Pass</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded overflow-hidden">
                <div className="h-full bg-emerald-400" style={{ width: '98.1%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-zinc-400">Inline Metrology Confidence</span>
                <span className="text-blue-400 font-semibold">97.4% Pass</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded overflow-hidden">
                <div className="h-full bg-blue-400" style={{ width: '97.4%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Closed-Loop Defect Signatures & Drift Alert (4 cols) */}
        <div className="lg:col-span-4 bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-bold text-xs text-zinc-200 flex items-center gap-2 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Active Defect Prevention Feed
            </span>
            <button
              onClick={() => navigate('/defect-prevention')}
              className="text-[11px] text-cyan-400 hover:underline"
            >
              Workbench →
            </button>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {defectSignatures.slice(0, 3).map((sig) => (
              <div
                key={sig.id}
                className="bg-zinc-900/70 p-2.5 rounded border border-zinc-800 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400">{sig.id} • {sig.category}</span>
                  <span
                    className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono ${
                      sig.applied
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {sig.applied ? 'APPLIED (+i9)' : `${sig.historicalLikelihoodPct}% RISK`}
                  </span>
                </div>
                <p className="text-zinc-300 text-[11px] font-sans truncate">{sig.title}</p>
                <div className="text-[10px] text-zinc-500 flex justify-between pt-0.5">
                  <span>Gain: +{sig.i9GainPct}% i9 / +{sig.yieldGainPct}% yield</span>
                  <button
                    onClick={() => navigate('/defect-prevention')}
                    className="text-cyan-400 hover:underline"
                  >
                    Review Fix
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Module Navigation Quick Cards */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Quick Launch Modules
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            {
              title: '3D Wafer Twin',
              sub: 'Interactive Disc & Raycasting',
              route: '/',
              icon: Disc3,
              color: 'text-cyan-400',
            },
            {
              title: 'New Simulation',
              sub: '60+ SPC Process Inputs',
              route: '/simulations/new',
              icon: PlusCircle,
              color: 'text-emerald-400',
            },
            {
              title: 'Bin Analysis',
              sub: 'Threshold Simulator & Curve',
              route: '/bin-analysis',
              icon: SlidersHorizontal,
              color: 'text-blue-400',
            },
            {
              title: 'Best Candidate',
              sub: 'i9 Multi-Factor Leaderboard',
              route: '/best-candidate',
              icon: Trophy,
              color: 'text-amber-400',
            },
            {
              title: 'What-If Engine',
              sub: 'Side-by-Side Baseline Delta',
              route: '/what-if',
              icon: GitCompare,
              color: 'text-purple-400',
            },
            {
              title: 'Validation Loop',
              sub: 'ATE & Metrology Ingest',
              route: '/validation',
              icon: CheckCircle2,
              color: 'text-rose-400',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.title}
                onClick={() => navigate(card.route)}
                className="bg-zinc-950 border border-zinc-800/90 hover:border-cyan-500/50 hover:bg-zinc-900/80 p-3 rounded-lg text-left transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <Icon className={`w-4 h-4 ${card.color} mb-2 group-hover:scale-110 transition-transform`} />
                  <h4 className="text-xs font-bold text-zinc-200">{card.title}</h4>
                  <p className="text-[10px] text-zinc-500 font-sans mt-0.5">{card.sub}</p>
                </div>
                <div className="mt-2 text-[10px] text-zinc-500 group-hover:text-cyan-400 flex items-center gap-1">
                  <span>Enter</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
