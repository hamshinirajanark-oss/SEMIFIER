import React from 'react';

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-400 py-3.5 px-6 font-mono text-[11px]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <span className="font-semibold text-zinc-300">FABTWIN</span> — Synthetic Semiconductor Yield Twin & Predictive Inline FinFET Defect Engine
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Engineering Team: HARINI • ISMAIL • HARIHARAN • MUTHUKUMAR • IYLAMARAN
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-zinc-400">
          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
            Prototype Fab Release v1.0
          </span>
          <span>Simulation Horizon: 2026-Q3</span>
        </div>
      </div>
    </footer>
  );
}
