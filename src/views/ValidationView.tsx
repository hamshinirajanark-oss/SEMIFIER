import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  CheckSquare,
  Cpu,
  FileText,
  RefreshCw,
  Sparkles,
  Upload,
  Zap,
} from 'lucide-react';
import { useFab } from '../context/FabContext';

export function ValidationView() {
  const { navigate } = useFab();
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState(false);
  const [fileName, setFileName] = useState('ATE_WaferSort_Lot_L9482_W14.stdf');

  const handleSimulateIngest = () => {
    setIsIngesting(true);
    setIngestSuccess(false);
    setTimeout(() => {
      setIsIngesting(false);
      setIngestSuccess(true);
    }, 1200);
  };

  return (
    <div className="space-y-5 font-mono text-xs max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
              Stage 09: Model Validation & Metrology Ingest Loop
            </h2>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
            Closed-loop feedback: reconcile simulation predictions against physical Automated Test Equipment (ATE) wafer sort probe results.
          </p>
        </div>

        <button
          onClick={() => navigate('/historical-experience')}
          className="px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-600/60 rounded font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
        >
          Loop Back to Stage 01 <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {ingestSuccess && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              Ingestion complete! Correlated 620 physical dies from <strong>{fileName}</strong>.
              Twin accuracy recalculated at 98.6% (+0.2% gain). Model weights checkpointed.
            </span>
          </div>
          <button
            onClick={() => setIngestSuccess(false)}
            className="text-xs underline text-emerald-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ATE Physical Correlation Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5">
          <span className="text-[10px] text-zinc-500 block uppercase">Bin Classification Match</span>
          <span className="text-2xl font-bold text-emerald-400">98.4%</span>
          <span className="text-[10px] text-zinc-500 block mt-1">610 / 620 dies exact</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5">
          <span className="text-[10px] text-zinc-500 block uppercase">Vmin Prediction (R²)</span>
          <span className="text-2xl font-bold text-cyan-400">0.942</span>
          <span className="text-[10px] text-zinc-500 block mt-1">±0.015 V error band</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5">
          <span className="text-[10px] text-zinc-500 block uppercase">Max Clock Drift</span>
          <span className="text-2xl font-bold text-amber-400">±0.08 GHz</span>
          <span className="text-[10px] text-zinc-500 block mt-1">Measured vs predicted</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5">
          <span className="text-[10px] text-zinc-500 block uppercase">Retrain Trigger Drift</span>
          <span className="text-2xl font-bold text-zinc-200">0.8%</span>
          <span className="text-[10px] text-zinc-500 block mt-1">Threshold: &gt;2.5%</span>
        </div>
      </div>

      {/* ATE Ingest & Upload Box */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4.5 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="font-bold text-xs text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            Ingest Physical Metrology / ATE Wafer Probe Dataset
          </span>
          <span className="text-[10.5px] text-zinc-500">STDF / KLRF / CSV</span>
        </div>

        {/* Drag & Drop Area */}
        <div className="border-2 border-dashed border-zinc-800 hover:border-cyan-500/60 rounded-lg p-6 text-center space-y-3 transition-colors bg-zinc-900/30">
          <FileText className="w-8 h-8 mx-auto text-cyan-400 animate-pulse" />
          <div className="space-y-1">
            <p className="text-zinc-200 font-semibold text-xs">
              Drag and drop ATE Wafer Sort file (.stdf, .klrf, .csv), or click to browse
            </p>
            <p className="text-[11px] text-zinc-500 font-sans">
              Compatible with Teradyne UltraFLEX, Advantest V93000, and KLA Klarity metrology formats.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800 text-cyan-300">
            <FileText className="w-3.5 h-3.5" />
            <span className="font-bold">{fileName}</span>
            <span className="text-zinc-500 text-[10px]">(4.8 MB)</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleSimulateIngest}
            disabled={isIngesting}
            className="px-5 py-2 bg-gradient-to-r from-emerald-950 to-cyan-950 hover:from-emerald-900 hover:to-cyan-900 text-emerald-300 border border-emerald-500/60 rounded font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isIngesting ? 'animate-spin' : ''}`} />
            {isIngesting ? 'Correlating Physical ATE Sort Data...' : 'Ingest & Re-Correlate Digital Twin'}
          </button>
        </div>
      </div>
    </div>
  );
}
