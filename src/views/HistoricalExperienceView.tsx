import React, { useState, useMemo } from 'react';
import {
  Activity,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Database,
  Filter,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useFab } from '../context/FabContext';
import { HISTORICAL_LOTS } from '../data/fabData';

export function HistoricalExperienceView() {
  const { navigate } = useFab();
  const [search, setSearch] = useState('');
  const [selectedLot, setSelectedLot] = useState<typeof HISTORICAL_LOTS[0] | null>(null);

  const filteredLots = useMemo(() => {
    return HISTORICAL_LOTS.filter(
      (l) =>
        l.lotId.toLowerCase().includes(search.toLowerCase()) ||
        l.primarySignature.toLowerCase().includes(search.toLowerCase()) ||
        l.node.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="space-y-5 font-mono text-xs max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
              Historical Experience & Ingested Fab Lots
            </h2>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
            Stage 01 Baseline: Prior fab production runs, yield curves, and defect correlation priors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/simulations/new')}
            className="px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-600/60 rounded font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            Step to Stage 02: New Sim <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5">
          <span className="text-[10px] text-zinc-500 block uppercase">Ingested Fab Lots</span>
          <span className="text-2xl font-bold text-zinc-100">1,020 Lots</span>
          <span className="text-[10px] text-zinc-500 block mt-1">Spans 3nm/5nm runs</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5">
          <span className="text-[10px] text-zinc-500 block uppercase">Wafers Ingested</span>
          <span className="text-2xl font-bold text-cyan-400">25,500</span>
          <span className="text-[10px] text-zinc-500 block mt-1">25 wafers/lot FOUP</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5">
          <span className="text-[10px] text-zinc-500 block uppercase">Mean Historical Yield</span>
          <span className="text-2xl font-bold text-emerald-400">94.2%</span>
          <span className="text-[10px] text-zinc-500 block mt-1">±1.4% 3σ confidence</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5">
          <span className="text-[10px] text-zinc-500 block uppercase">Mean i9 Super-Bin</span>
          <span className="text-2xl font-bold text-amber-400">38.6%</span>
          <span className="text-[10px] text-zinc-500 block mt-1">Target: &gt;42.0%</span>
        </div>
      </div>

      {/* Physics Correlation Insights */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="font-bold text-xs text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            Empirical Physical Correlations (Derived from 1,020 Fab Runs)
          </span>
          <span className="text-[10px] text-cyan-400">Pearson R² Deterministic Priors</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-zinc-900/60 p-3 rounded border border-zinc-800 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-zinc-200 font-semibold">Litho Overlay vs i9 Gating</span>
              <span className="text-cyan-400 font-bold bg-zinc-950 px-1.5 py-0.5 rounded">
                R² = 0.94
              </span>
            </div>
            <p className="text-zinc-400 text-[11px] font-sans">
              Every 0.2 nm reduction in high-order scanner overlay yields an average +3.1% jump in dies passing the &gt;93% electrical threshold.
            </p>
          </div>

          <div className="bg-zinc-900/60 p-3 rounded border border-zinc-800 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-zinc-200 font-semibold">Susceptor Temp vs Leakage</span>
              <span className="text-purple-400 font-bold bg-zinc-950 px-1.5 py-0.5 rounded">
                R² = 0.88
              </span>
            </div>
            <p className="text-zinc-400 text-[11px] font-sans">
              Susceptor center-to-edge thermal variance exceeding 1.2°C causes localized subthreshold leakage and depresses edge die max clock by 250 MHz.
            </p>
          </div>

          <div className="bg-zinc-900/60 p-3 rounded border border-zinc-800 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-zinc-200 font-semibold">D0 Density vs Killer Defects</span>
              <span className="text-rose-400 font-bold bg-zinc-950 px-1.5 py-0.5 rounded">
                R² = 0.91
              </span>
            </div>
            <p className="text-zinc-400 text-[11px] font-sans">
              Particle density D0 &gt; 0.08 def/cm² triggers exponential Murphy fallout with killer gate shorts concentrated on outer edge radii &gt; 130mm.
            </p>
          </div>
        </div>
      </div>

      {/* Historical Lots Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden shadow-lg">
        <div className="p-3.5 bg-zinc-900/40 border-b border-zinc-800 flex items-center justify-between gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Lot ID or Signature..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded pl-8 pr-2.5 py-1 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
          <span className="text-[10.5px] text-zinc-500">
            Showing {filteredLots.length} Ingested Datasets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60 text-[10.5px] text-zinc-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Lot ID</th>
                <th className="py-2.5 px-3">Node</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Wafers</th>
                <th className="py-2.5 px-3">Overall Yield</th>
                <th className="py-2.5 px-3">i9 Super-Bin %</th>
                <th className="py-2.5 px-3">Primary Signature</th>
                <th className="py-2.5 px-3">Drift Status</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-[11.5px]">
              {filteredLots.map((lot) => (
                <tr key={lot.lotId} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-cyan-400">{lot.lotId}</td>
                  <td className="py-2.5 px-3 text-zinc-300">{lot.node}</td>
                  <td className="py-2.5 px-3 text-zinc-500">{lot.date}</td>
                  <td className="py-2.5 px-3 text-zinc-400">{lot.wafers}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-400">{lot.yieldPct}%</td>
                  <td className="py-2.5 px-3 font-semibold text-cyan-300">{lot.i9RatePct}%</td>
                  <td className="py-2.5 px-3 text-zinc-300 max-w-xs truncate">{lot.primarySignature}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        lot.driftState === 'Nominal'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : lot.driftState === 'Controlled'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {lot.driftState}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedLot(lot)}
                      className="px-2 py-0.8 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 text-[10.5px] cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lot Inspection Dialog */}
      {selectedLot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-cyan-400">{selectedLot.lotId}</h3>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {selectedLot.node} • Ingested {selectedLot.date}
                </span>
              </div>
              <button
                onClick={() => setSelectedLot(null)}
                className="text-zinc-400 hover:text-white px-2 py-1 bg-zinc-900 rounded"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-zinc-900/80 p-2.5 rounded border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">OVERALL YIELD</span>
                <span className="text-emerald-400 font-bold text-lg">{selectedLot.yieldPct}%</span>
              </div>
              <div className="bg-zinc-900/80 p-2.5 rounded border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">i9 SUPER-BIN %</span>
                <span className="text-cyan-400 font-bold text-lg">{selectedLot.i9RatePct}%</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-zinc-400 font-semibold block">Primary Defect Signature:</span>
              <p className="bg-zinc-900 p-2.5 rounded border border-zinc-800 text-zinc-200">
                {selectedLot.primarySignature}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setSelectedLot(null)}
                className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
