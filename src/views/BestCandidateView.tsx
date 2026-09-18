import React, { useMemo } from 'react';
import {
  Activity,
  ArrowRight,
  Award,
  CheckCircle2,
  Cpu,
  Eye,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import { useFab } from '../context/FabContext';
import { Die } from '../types';

export function BestCandidateView() {
  const { activeWafer, selectDie, navigate } = useFab();

  // Multi-factor formula:
  // 40% Elec Pass + 25% (100 - Total Defect Risk) + 20% Model Conf + 15% Thermal Margin
  const rankedDies = useMemo(() => {
    return [...activeWafer.dies]
      .filter((d) => !d.isExcluded)
      .map((die) => {
        const elec = die.electricalPassProbPct;
        const defectInverted = Math.max(0, 100 - die.defectRiskPct);
        const conf = die.modelConfidencePct;
        const thermalScore = Math.min(100, Math.max(0, die.thermalMarginC * 2));

        const composite =
          0.4 * elec +
          0.25 * defectInverted +
          0.2 * conf +
          0.15 * thermalScore;

        return {
          die,
          compositeScore: parseFloat(composite.toFixed(2)),
          isQualifiedI9: die.predictedBin === 'i9',
        };
      })
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .slice(0, 10);
  }, [activeWafer]);

  const topCandidate = rankedDies[0];

  const handleInspectDie = (die: Die) => {
    selectDie(die);
    navigate('/');
  };

  return (
    <div className="space-y-5 font-mono text-xs max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
              Best i9 Processor Candidate Leaderboard
            </h2>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
            Multi-factor deterministic ranking: 40% Electrical Pass + 25% Low Defect + 20% Metrology Confidence + 15% Thermal Stability.
          </p>
        </div>

        <span className="text-[11px] bg-amber-950/80 border border-amber-800/60 text-amber-300 px-3 py-1 rounded font-semibold flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5" />
          Active Wafer: {activeWafer.id}
        </span>
      </div>

      {/* Hero Card for #1 Best Candidate */}
      {topCandidate && (
        <div className="bg-gradient-to-r from-amber-950/40 via-zinc-950 to-cyan-950/30 border border-amber-500/50 rounded-lg p-4.5 space-y-3 relative shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    RANK #1 BEST i9 CANDIDATE DIE
                  </span>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded font-bold">
                    {topCandidate.die.predictedBin} SUPER-BIN
                  </span>
                </div>
                <h3 className="text-base font-bold text-zinc-100">
                  {topCandidate.die.id} (Grid: [{topCandidate.die.gridX}, {topCandidate.die.gridY}])
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block">COMPOSITE SCORE</span>
                <span className="text-2xl font-bold text-amber-300">
                  {topCandidate.compositeScore}
                </span>
                <span className="text-[10px] text-zinc-500 block">/ 100.0</span>
              </div>
              <button
                onClick={() => handleInspectDie(topCandidate.die)}
                className="px-3.5 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 rounded text-cyan-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                Inspect on 3D Wafer
              </button>
            </div>
          </div>

          {/* Deep-Dive Spec Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">THEORETICAL MAX CLOCK</span>
              <span className="text-sm font-bold text-cyan-400">
                {topCandidate.die.performanceEstimate?.maxFreqGHz ?? 5.85} GHz
              </span>
              <span className="text-[10px] text-zinc-500 block">Thermal Velocity Boost</span>
            </div>

            <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">STABLE FREQ</span>
              <span className="text-sm font-bold text-emerald-400">
                {topCandidate.die.performanceEstimate?.stableFreqGHz ?? 5.4} GHz
              </span>
              <span className="text-[10px] text-zinc-500 block">All-core sustained</span>
            </div>

            <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">STATIC LEAKAGE</span>
              <span className="text-sm font-bold text-zinc-200">
                {topCandidate.die.staticLeakageMw.toFixed(1)} mW
              </span>
              <span className="text-[10px] text-zinc-500 block">3nm FinFET standard</span>
            </div>

            <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">THERMAL MARGIN</span>
              <span className="text-sm font-bold text-amber-400">
                {topCandidate.die.thermalMarginC.toFixed(1)} °C
              </span>
              <span className="text-[10px] text-zinc-500 block">Tcase headroom</span>
            </div>
          </div>
        </div>
      )}

      {/* Top 10 Candidates Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden shadow-lg">
        <div className="p-3.5 bg-zinc-900/40 border-b border-zinc-800 flex items-center justify-between">
          <span className="font-bold text-zinc-200 uppercase tracking-wider text-xs flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Top 10 Ranked Candidate Dies
          </span>
          <span className="text-[10.5px] text-zinc-500">Sorted by Multi-Factor Composite Score</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/70 text-[10.5px] text-zinc-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Die ID</th>
                <th className="py-2.5 px-3">Grid (X, Y)</th>
                <th className="py-2.5 px-3">Radius</th>
                <th className="py-2.5 px-3">Predicted Bin</th>
                <th className="py-2.5 px-3">Composite Score</th>
                <th className="py-2.5 px-3">Elec Pass %</th>
                <th className="py-2.5 px-3">Defect Risk %</th>
                <th className="py-2.5 px-3">Max Clock</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-[11.5px]">
              {rankedDies.map((row, idx) => (
                <tr
                  key={row.die.id}
                  className={`hover:bg-zinc-900/40 transition-colors ${
                    idx === 0 ? 'bg-amber-950/20' : ''
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <span
                      className={`w-5 h-5 rounded-full inline-flex items-center justify-center font-bold text-[10px] ${
                        idx === 0
                          ? 'bg-amber-500 text-zinc-950'
                          : idx === 1
                          ? 'bg-zinc-300 text-zinc-950'
                          : idx === 2
                          ? 'bg-amber-700 text-zinc-100'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-zinc-100">{row.die.id}</td>
                  <td className="py-2.5 px-3 text-zinc-400">
                    [{row.die.gridX}, {row.die.gridY}]
                  </td>
                  <td className="py-2.5 px-3 text-zinc-400">{row.die.centerDistMm.toFixed(1)} mm</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        row.die.predictedBin === 'i9'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                          : row.die.predictedBin === 'i7'
                          ? 'bg-blue-950 text-blue-300 border border-blue-700'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      }`}
                    >
                      {row.die.predictedBin}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-amber-400">{row.compositeScore}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-400">
                    {row.die.electricalPassProbPct}%
                  </td>
                  <td className="py-2.5 px-3 text-zinc-300">{row.die.defectRiskPct}%</td>
                  <td className="py-2.5 px-3 font-semibold text-cyan-400">
                    {row.die.performanceEstimate?.maxFreqGHz ?? 5.8} GHz
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleInspectDie(row.die)}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-cyan-300 rounded border border-zinc-700 text-[10.5px] cursor-pointer inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3 text-cyan-400" />
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
