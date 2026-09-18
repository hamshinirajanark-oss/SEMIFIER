import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Cpu,
  Layers,
  RotateCcw,
  ShieldAlert,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';
import { useFab } from '../context/FabContext';

export function BinAnalysisView() {
  const { binThresholds, updateBinThresholds, activeWafer } = useFab();

  // Local state for interactive sliders
  const [minElecPass, setMinElecPass] = useState<number>(binThresholds.i9Min);
  const [maxCritDefect, setMaxCritDefect] = useState<number>(binThresholds.maxCritDefectPct);
  const [minConfidence, setMinConfidence] = useState<number>(binThresholds.minInspectionConfidencePct);

  const handleSliderChange = (elec: number, crit: number, conf: number) => {
    setMinElecPass(elec);
    setMaxCritDefect(crit);
    setMinConfidence(conf);
    updateBinThresholds({
      i9Min: elec,
      maxCritDefectPct: crit,
      minInspectionConfidencePct: conf,
    });
  };

  const handleResetDefaults = () => {
    handleSliderChange(93, 1.0, 95.0);
  };

  // Generate curve points for qualification curve (SVG)
  const curvePoints: { x: number; y: number; prob: number; qualRate: number }[] = [];
  for (let p = 40; p <= 100; p += 2) {
    // Sigmoidal transition around minElecPass
    const z = (p - minElecPass) / 4.5;
    const qualRate = 1 / (1 + Math.exp(-z));
    // SVG coords: x from 40 to 600, y from 220 down to 20
    const x = 50 + ((p - 40) / 60) * 520;
    const y = 220 - qualRate * 180;
    curvePoints.push({ x, y, prob: p, qualRate });
  }

  const pathD = curvePoints.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Cutoff marker coordinate
  const cutoffX = 50 + ((minElecPass - 40) / 60) * 520;

  return (
    <div className="space-y-5 font-mono text-xs max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
              Processor Bin Capability Analysis & Threshold Simulator
            </h2>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
            Real-time qualification sensitivity modeling for high-frequency i9/i7/i5 bin yield gating.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          Reset Defaults
        </button>
      </div>

      {/* Simulator: 3 Live Sliders + Dynamic Qualification Curve */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="font-bold text-xs text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Interactive i9 Bin Threshold Simulator
          </span>
          <span className="text-[10.5px] text-cyan-400">Live Mathematical Transfer Function</span>
        </div>

        {/* 3 Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-900/50 p-3.5 rounded border border-zinc-800">
          {/* Slider 1: Min Electrical Pass */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-300 font-semibold">Min Electrical-Pass Prob</span>
              <span className="text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                {minElecPass}%
              </span>
            </div>
            <input
              type="range"
              min="80"
              max="99"
              step="1"
              value={minElecPass}
              onChange={(e) => handleSliderChange(+e.target.value, maxCritDefect, minConfidence)}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>80% (Loose)</span>
              <span>Default: 93%</span>
              <span>99% (Strict)</span>
            </div>
          </div>

          {/* Slider 2: Max Critical Defect */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-300 font-semibold">Max Critical Defect Prob</span>
              <span className="text-amber-400 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/40">
                {maxCritDefect}%
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="5.0"
              step="0.1"
              value={maxCritDefect}
              onChange={(e) => handleSliderChange(minElecPass, +e.target.value, minConfidence)}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>0.2% (Zero-Tol)</span>
              <span>Default: 1.0%</span>
              <span>5.0% (Relaxed)</span>
            </div>
          </div>

          {/* Slider 3: Min Inspection Confidence */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-300 font-semibold">Min Inspection Confidence</span>
              <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                {minConfidence}%
              </span>
            </div>
            <input
              type="range"
              min="85"
              max="99.5"
              step="0.5"
              value={minConfidence}
              onChange={(e) => handleSliderChange(minElecPass, maxCritDefect, +e.target.value)}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>85% (Inline)</span>
              <span>Default: 95.0%</span>
              <span>99.5% (Golden)</span>
            </div>
          </div>
        </div>

        {/* Dynamic Qualification Curve Chart */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Electrical-Pass Probability vs Processor Bin Qualification Curve</span>
            <span className="text-cyan-400 font-semibold">
              Current Threshold Boundary: {minElecPass}% Electrical Pass
            </span>
          </div>

          <div className="w-full h-64 bg-zinc-900/80 rounded border border-zinc-800 relative p-2 overflow-hidden">
            <svg viewBox="0 0 620 250" className="w-full h-full">
              {/* Grid Lines */}
              {[50, 100, 150, 200].map((y) => (
                <line key={y} x1="50" y1={y} x2="570" y2={y} stroke="#27272a" strokeDasharray="3,3" />
              ))}
              {[100, 200, 300, 400, 500].map((x) => (
                <line key={x} x1={x} y1="30" x2={x} y2="220" stroke="#27272a" strokeDasharray="3,3" />
              ))}

              {/* Shaded Qualification Zone */}
              <rect
                x={cutoffX}
                y="30"
                width={Math.max(0, 570 - cutoffX)}
                height="190"
                fill="#06b6d4"
                fillOpacity="0.08"
              />

              {/* Cutoff Marker Line */}
              <line
                x1={cutoffX}
                y1="25"
                x2={cutoffX}
                y2="225"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeDasharray="4,2"
              />
              <text x={cutoffX - 4} y="22" fill="#06b6d4" fontSize="10" textAnchor="end" fontFamily="monospace">
                i9 Cutoff ({minElecPass}%)
              </text>

              {/* Qualification Curve Path */}
              <path d={pathD} fill="none" stroke="#22d3ee" strokeWidth="2.5" />

              {/* Axes */}
              <line x1="50" y1="220" x2="570" y2="220" stroke="#71717a" strokeWidth="1.5" />
              <line x1="50" y1="30" x2="50" y2="220" stroke="#71717a" strokeWidth="1.5" />

              {/* Axis Labels */}
              <text x="310" y="242" fill="#a1a1aa" fontSize="11" textAnchor="middle" fontFamily="monospace">
                Die Electrical-Pass Probability (%)
              </text>
              <text
                x="-125"
                y="20"
                fill="#a1a1aa"
                fontSize="11"
                textAnchor="middle"
                transform="rotate(-90)"
                fontFamily="monospace"
              >
                i9 Qualification Rate
              </text>

              {/* Axis Ticks */}
              <text x="50" y="234" fill="#71717a" fontSize="9" textAnchor="middle">40%</text>
              <text x="136" y="234" fill="#71717a" fontSize="9" textAnchor="middle">50% (i3)</text>
              <text x="310" y="234" fill="#71717a" fontSize="9" textAnchor="middle">70% (i5)</text>
              <text x="423" y="234" fill="#71717a" fontSize="9" textAnchor="middle">83% (i7)</text>
              <text x="570" y="234" fill="#71717a" fontSize="9" textAnchor="middle">100%</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Qualification Criteria Matrix (5 Tier Cards) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          Processor Qualification Criteria Matrix
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Tier 1: i9 */}
          <div className="bg-zinc-950 border border-cyan-500/50 rounded-lg p-3.5 space-y-2 relative shadow-lg shadow-cyan-950/20 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-400 text-sm">i9-Capable</span>
                <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-1.5 py-0.2 rounded font-bold">
                  SUPER-BIN
                </span>
              </div>
              <div className="space-y-1 text-[11px] text-zinc-300">
                <div>Elec Pass: <strong className="text-cyan-400">≥ {minElecPass}%</strong></div>
                <div>Critical Defect: <strong className="text-cyan-400">&lt; {maxCritDefect}%</strong></div>
                <div>Inspection: <strong className="text-cyan-400">≥ {minConfidence}%</strong></div>
                <div>Violations: <strong className="text-zinc-100">0 Critical</strong></div>
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 space-y-1">
              <p>• Max Boost: 5.8 - 6.0 GHz</p>
              <p>• 100% P+E Cores & Full L3 Cache</p>
            </div>
          </div>

          {/* Tier 2: i7 */}
          <div className="bg-zinc-950 border border-blue-500/40 rounded-lg p-3.5 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-400 text-sm">i7-Capable</span>
                <span className="text-[9px] bg-blue-950 text-blue-300 border border-blue-700 px-1.5 py-0.2 rounded font-bold">
                  HIGH-BIN
                </span>
              </div>
              <div className="space-y-1 text-[11px] text-zinc-300">
                <div>Elec Pass: <strong className="text-blue-400">83 - 92%</strong></div>
                <div>Critical Defect: <strong className="text-blue-400">&lt; 5.0%</strong></div>
                <div>Inspection: <strong className="text-blue-400">≥ 90.0%</strong></div>
                <div>Violations: <strong className="text-zinc-100">≤ 1 Marginal</strong></div>
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 space-y-1">
              <p>• Max Boost: 5.2 - 5.6 GHz</p>
              <p>• All or N-1 High-Frequency Cores</p>
            </div>
          </div>

          {/* Tier 3: i5 */}
          <div className="bg-zinc-950 border border-emerald-500/40 rounded-lg p-3.5 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 text-sm">i5-Capable</span>
                <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-1.5 py-0.2 rounded font-bold">
                  MID-BIN
                </span>
              </div>
              <div className="space-y-1 text-[11px] text-zinc-300">
                <div>Elec Pass: <strong className="text-emerald-400">70 - 82%</strong></div>
                <div>Critical Defect: <strong className="text-emerald-400">&lt; 45.0%</strong></div>
                <div>Inspection: <strong className="text-emerald-400">≥ 85.0%</strong></div>
                <div>Fusing: <strong className="text-zinc-100">Partial Allowed</strong></div>
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 space-y-1">
              <p>• Max Boost: 4.4 - 4.8 GHz</p>
              <p>• Partial core array laser fusing</p>
            </div>
          </div>

          {/* Tier 4: i3 */}
          <div className="bg-zinc-950 border border-amber-500/40 rounded-lg p-3.5 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 text-sm">i3-Capable</span>
                <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-700 px-1.5 py-0.2 rounded font-bold">
                  ENTRY-BIN
                </span>
              </div>
              <div className="space-y-1 text-[11px] text-zinc-300">
                <div>Elec Pass: <strong className="text-amber-400">50 - 69%</strong></div>
                <div>Defect Risk: <strong className="text-amber-400">Standard Tol</strong></div>
                <div>Inspection: <strong className="text-amber-400">Inline Inline</strong></div>
                <div>Fusing: <strong className="text-zinc-100">Active</strong></div>
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 space-y-1">
              <p>• Max Boost: 3.8 - 4.2 GHz</p>
              <p>• 4-core configuration standard</p>
            </div>
          </div>

          {/* Tier 5: Reject */}
          <div className="bg-zinc-950 border border-rose-500/40 rounded-lg p-3.5 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-400 text-sm">Reject / Fallout</span>
                <span className="text-[9px] bg-rose-950 text-rose-300 border border-rose-700 px-1.5 py-0.2 rounded font-bold">
                  FALLOUT
                </span>
              </div>
              <div className="space-y-1 text-[11px] text-zinc-300">
                <div>Elec Pass: <strong className="text-rose-400">&lt; 50%</strong></div>
                <div>Critical Defect: <strong className="text-rose-400">≥ 20%</strong></div>
                <div>Killer Defect: <strong className="text-rose-400">Detected</strong></div>
                <div>Status: <strong className="text-zinc-100">Non-Functional</strong></div>
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 space-y-1">
              <p>• Scrapped at wafer sort</p>
              <p>• Routed to physical failure analysis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
