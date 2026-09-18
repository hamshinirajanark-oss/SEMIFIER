import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  Download,
  Filter,
  History,
  PlusCircle,
  Search,
  Zap,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { useFab } from '../context/FabContext';
import { ProcessorBin, SimulationRun } from '../types';

export function SimulationHistoryView() {
  const { simulationRuns, exportCsv, navigate, seedDemoRuns } = useFab();

  const [lotFilter, setLotFilter] = useState('');
  const [waferFilter, setWaferFilter] = useState('');
  const [binFilter, setBinFilter] = useState<'All' | ProcessorBin>('All');
  const [sortBy, setSortBy] = useState<'Newest' | 'Highest i9 Prob' | 'Highest Yield' | 'Lowest Defect Risk'>('Newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [inspectRun, setInspectRun] = useState<SimulationRun | null>(null);
  const pageSize = 10;

  const filteredRuns = useMemo(() => {
    return simulationRuns
      .filter((r) => {
        if (lotFilter && !r.lotId.toLowerCase().includes(lotFilter.toLowerCase())) return false;
        if (waferFilter && !r.waferId.toLowerCase().includes(waferFilter.toLowerCase())) return false;
        if (binFilter !== 'All' && r.results.predictedBin !== binFilter) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'Highest i9 Prob':
            return b.results.i9ProbPct - a.results.i9ProbPct;
          case 'Highest Yield':
            return b.results.predictedYieldPct - a.results.predictedYieldPct;
          case 'Lowest Defect Risk':
            return a.results.avgDefectRiskPct - b.results.avgDefectRiskPct;
          case 'Newest':
          default:
            return b.id.localeCompare(a.id);
        }
      });
  }, [simulationRuns, lotFilter, waferFilter, binFilter, sortBy]);

  const totalPages = Math.ceil(filteredRuns.length / pageSize) || 1;
  const pageRuns = filteredRuns.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4 font-mono text-xs max-w-7xl mx-auto pb-12">
      {/* Header & Export Actions */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
              Simulation Audit Trail & History
            </h2>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
            Cryptographically sealed, immutable manufacturing simulation records with SPC telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {simulationRuns.length === 0 && (
            <button
              onClick={seedDemoRuns}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Seed Demo Lots
            </button>
          )}

          <button
            onClick={exportCsv}
            disabled={simulationRuns.length === 0}
            className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-cyan-300 border border-cyan-700/60 rounded font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={() => navigate('/simulations/new')}
            className="px-3.5 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/60 rounded font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            + New Sim
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[140px]">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter Lot ID..."
              value={lotFilter}
              onChange={(e) => setLotFilter(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded pl-8 pr-2.5 py-1 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="relative min-w-[140px]">
            <input
              type="text"
              placeholder="Filter Wafer ID..."
              value={waferFilter}
              onChange={(e) => setWaferFilter(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Bin:</span>
            <select
              value={binFilter}
              onChange={(e) => setBinFilter(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Bins</option>
              <option value="i9">i9 Only</option>
              <option value="i7">i7 Only</option>
              <option value="i5">i5 Only</option>
              <option value="i3">i3 Only</option>
              <option value="REJ">Reject Only</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="Newest">Newest First</option>
            <option value="Highest i9 Prob">Highest i9 Probability</option>
            <option value="Highest Yield">Highest Yield %</option>
            <option value="Lowest Defect Risk">Lowest Defect Risk</option>
          </select>
        </div>
      </div>

      {/* Table / Empty State */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden shadow-lg">
        {simulationRuns.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 space-y-3">
            <History className="w-10 h-10 mx-auto text-zinc-700 animate-pulse" />
            <p className="font-semibold text-zinc-300">No Simulation Records Found</p>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              The audit database starts at zero records for fresh installs. Execute a new simulation
              or seed standard demo lots to inspect historical run vectors.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={seedDemoRuns}
                className="px-4 py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-600/60 rounded font-semibold text-xs cursor-pointer"
              >
                Seed 6 Demo Runs
              </button>
              <button
                onClick={() => navigate('/simulations/new')}
                className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/60 rounded font-semibold text-xs cursor-pointer"
              >
                + Run New Simulation
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60 text-[10.5px] text-zinc-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Run Name / ID</th>
                  <th className="py-2.5 px-3">Lot & Wafer</th>
                  <th className="py-2.5 px-3">Engineer</th>
                  <th className="py-2.5 px-3">Predicted Bin</th>
                  <th className="py-2.5 px-3">i9 Prob</th>
                  <th className="py-2.5 px-3">Yield</th>
                  <th className="py-2.5 px-3">Defect Risk</th>
                  <th className="py-2.5 px-3">Best i9 Score</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-[11.5px]">
                {pageRuns.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-zinc-100">{r.runName}</div>
                      <div className="text-[10px] text-zinc-500">{r.id}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-cyan-400 font-semibold">{r.lotId}</div>
                      <div className="text-[10px] text-zinc-400">{r.waferId}</div>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-300">{r.engineerInCharge}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          r.results.predictedBin === 'i9'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                            : r.results.predictedBin === 'i7'
                            ? 'bg-blue-950 text-blue-300 border border-blue-700'
                            : r.results.predictedBin === 'i5'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : r.results.predictedBin === 'i3'
                            ? 'bg-amber-950 text-amber-300 border border-amber-700'
                            : 'bg-rose-950 text-rose-300 border border-rose-700'
                        }`}
                      >
                        {r.results.predictedBin}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-cyan-300">{r.results.i9ProbPct}%</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-400">
                      {r.results.predictedYieldPct}%
                    </td>
                    <td className="py-2.5 px-3 text-amber-400">{r.results.avgDefectRiskPct}%</td>
                    <td className="py-2.5 px-3 font-bold text-zinc-100">{r.bestI9Score}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setInspectRun(r)}
                        className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 hover:border-cyan-500/50 text-[11px] cursor-pointer inline-flex items-center gap-1"
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
        )}

        {/* Pagination Footer */}
        {filteredRuns.length > 0 && (
          <div className="p-3 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filteredRuns.length)} of {filteredRuns.length} runs
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-2 font-bold text-zinc-200">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Modal Dialog */}
      {inspectRun && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-zinc-100">{inspectRun.runName}</h3>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {inspectRun.id} • Recorded: {inspectRun.createdAt}
                </span>
              </div>
              <button
                onClick={() => setInspectRun(null)}
                className="text-zinc-400 hover:text-white text-base px-2 py-1 bg-zinc-900 rounded"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">PREDICTED BIN</span>
                <span className="text-cyan-400 font-bold text-sm">{inspectRun.results.predictedBin}</span>
              </div>
              <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">BEST i9 SCORE</span>
                <span className="text-zinc-100 font-bold text-sm">{inspectRun.bestI9Score}</span>
              </div>
              <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">YIELD</span>
                <span className="text-emerald-400 font-bold text-sm">{inspectRun.results.predictedYieldPct}%</span>
              </div>
              <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">DEFECT RISK</span>
                <span className="text-amber-400 font-bold text-sm">{inspectRun.results.avgDefectRiskPct}%</span>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <span className="text-zinc-400 font-semibold block">Key Physical Parameters:</span>
              <div className="grid grid-cols-2 gap-2 bg-zinc-900/50 p-2.5 rounded border border-zinc-800 text-zinc-300">
                <div>Overlay Error: {inspectRun.parameters.categoryC.totalOverlayErrorNm} nm</div>
                <div>CD Error: {inspectRun.parameters.categoryC.cdErrorNm} nm</div>
                <div>Airborne Particles: {inspectRun.parameters.categoryA.airborneParticleCount} part/m³</div>
                <div>CMP Downforce: {inspectRun.parameters.categoryB.cmpDownforceKpa} kPa</div>
                <div>Chamber Temp: {inspectRun.parameters.categoryD.chamberTempC} °C</div>
                <div>Defect Density D0: {inspectRun.parameters.categoryE.defectDensityD0} def/cm²</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setInspectRun(null)}
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
