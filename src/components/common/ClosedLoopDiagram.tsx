import React from 'react';
import {
  BookOpenCheck,
  PlusCircle,
  Cpu,
  Disc3,
  Trophy,
  Copy,
  GitCompare,
  ShieldAlert,
  CheckSquare,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useFab } from '../../context/FabContext';

export function ClosedLoopDiagram() {
  const { navigate, currentRoute } = useFab();

  const stages = [
    {
      step: '01',
      title: 'Historical Data',
      subtitle: '1,020+ Fab Lots',
      route: '/historical-experience',
      icon: BookOpenCheck,
    },
    {
      step: '02',
      title: 'Current Process',
      subtitle: '60+ SPC Inputs',
      route: '/simulations/new',
      icon: PlusCircle,
    },
    {
      step: '03',
      title: 'Predictive Engine',
      subtitle: 'Poisson-Murphy Yield',
      route: '/simulations',
      icon: Cpu,
    },
    {
      step: '04',
      title: '3D Wafer Twin',
      subtitle: 'Radial Physics Tensor',
      route: '/',
      icon: Disc3,
    },
    {
      step: '05',
      title: 'Best i9 Candidate',
      subtitle: 'Leaderboard Ranking',
      route: '/best-candidate',
      icon: Trophy,
    },
    {
      step: '06',
      title: 'i9 Process Twin',
      subtitle: 'Versioned Baseline',
      route: '/twin-models',
      icon: Copy,
    },
    {
      step: '07',
      title: 'Future Wafer',
      subtitle: 'What-If Optimization',
      route: '/what-if',
      icon: GitCompare,
    },
    {
      step: '08',
      title: 'Drift Detection',
      subtitle: 'Defect Prevention',
      route: '/defect-prevention',
      icon: ShieldAlert,
    },
    {
      step: '09',
      title: 'Model Update',
      subtitle: 'Metrology Ingest Loop',
      route: '/validation',
      icon: CheckSquare,
    },
  ];

  return (
    <section aria-label="Closed-Loop Yield Architecture" className="space-y-4 pt-6 border-t border-zinc-900 font-mono">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Closed-Loop Yield Architecture
          </h3>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Continuous fabrication learning cycle from historical baseline down to in-line metrology feedback.
          </p>
        </div>
        <span className="text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded">
          9-Stage Continuous Cycle
        </span>
      </div>

      {/* Grid of 9 Cards with Connector arrows */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
        {stages.map((st, idx) => {
          const Icon = st.icon;
          const isCurrent =
            (st.route === '/' && (currentRoute === '/' || currentRoute === '/wafer-3d')) ||
            currentRoute === st.route;

          return (
            <button
              key={st.step}
              onClick={() => navigate(st.route)}
              className={`p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
                isCurrent
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950'
                  : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold ${
                      isCurrent ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-400'
                    }`}
                  >
                    {st.step}
                  </span>
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isCurrent ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-300'
                    }`}
                  />
                </div>
                <h4 className="text-xs font-semibold font-sans text-zinc-200 leading-tight">
                  {st.title}
                </h4>
                <p className="text-[10px] text-zinc-500 mt-1 leading-tight">{st.subtitle}</p>
              </div>

              <div className="mt-3 flex items-center justify-between text-[9.5px] text-zinc-500 group-hover:text-cyan-400 pt-1 border-t border-zinc-800/60">
                <span>STAGE {st.step}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Persistent Engineering Disclaimer Block */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4 text-xs font-sans text-zinc-400 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-[11px] font-semibold">
          <AlertTriangle className="w-4 h-4" />
          <span>STATUTORY FABRICATION & COMPLIANCE PROTOCOL — PROTOCOL 24</span>
        </div>
        <p className="leading-relaxed text-[11.5px]">
          1. <strong>Simulation vs. Physical Measurement:</strong> All bin probabilities, defect densities, and electrical performance figures are generated via mathematical FinFET stochastic formulations. They do not substitute for physical wafer-probe electrical testing or transmission electron microscopy (TEM).
        </p>
        <p className="leading-relaxed text-[11.5px]">
          2. <strong>Hardware Immutable State:</strong> An in-process wafer or packaged die manufactured with excessive gate leakage or critical line edge roughness cannot be transformed into an i9 processor via software algorithms. The digital twin serves solely to refine recipe setpoints for prospective wafer runs.
        </p>
        <p className="leading-relaxed text-[11.5px]">
          3. <strong>No Direct Equipment Control:</strong> Output recipes and corrective actions are advisory. Automated recipe push to ASML EUV lithography scanners, Applied Materials CMP polishers, or TEL coaters without human engineering sign-off is strictly forbidden.
        </p>
      </div>
    </section>
  );
}
