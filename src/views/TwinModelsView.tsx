import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Cpu,
  Download,
  Layers,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useFab } from '../context/FabContext';

export function TwinModelsView() {
  const { navigate } = useFab();
  const [activeModel, setActiveModel] = useState('FinFET-v4.2.1-Twin');
  const [copyStatus, setCopyStatus] = useState(false);

  const handleCopyChecksum = () => {
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const models = [
    {
      id: 'FinFET-v4.2.1-Twin',
      version: 'v4.2.1',
      date: '2026-08-15',
      status: 'Active (Production)',
      lots: '1,020 lots',
      wafers: '25,500',
      accuracy: '98.4%',
      mse: '0.0031',
      checksum: 'sha256:7f4a8b92e104f981290bb34d7ac1f098ec192837',
    },
    {
      id: 'FinFET-v4.2.0-Twin',
      version: 'v4.2.0',
      date: '2026-06-20',
      status: 'Archived',
      lots: '980 lots',
      wafers: '24,500',
      accuracy: '97.9%',
      mse: '0.0042',
      checksum: 'sha256:3a1b92019ff884bc71900de215582bb01c847291',
    },
    {
      id: 'FinFET-v4.1.2-Twin',
      version: 'v4.1.2',
      date: '2026-03-10',
      status: 'Archived',
      lots: '850 lots',
      wafers: '21,250',
      accuracy: '97.2%',
      mse: '0.0055',
      checksum: 'sha256:9981fcb0021948baee710049281726aaff918237',
    },
    {
      id: 'FinFET-v4.0.0-Twin',
      version: 'v4.0.0',
      date: '2025-11-28',
      status: 'Deprecated',
      lots: '600 lots',
      wafers: '15,000',
      accuracy: '95.8%',
      mse: '0.0089',
      checksum: 'sha256:1029bbd84920182479f00192837264aaff281938',
    },
  ];

  return (
    <div className="space-y-5 font-mono text-xs max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Copy className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
              Stage 06: i9 Process Twin Models & Weights Catalog
            </h2>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
            Cryptographically versioned stochastic twin representations for 3nm FinFET yield inference.
          </p>
        </div>

        <button
          onClick={() => navigate('/what-if')}
          className="px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-600/60 rounded font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
        >
          Step to Stage 07: What-If <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Active Model Card */}
      <div className="bg-zinc-950 border border-cyan-500/60 rounded-lg p-4.5 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  ACTIVE PRODUCTION DIGITAL TWIN
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded font-bold">
                  VALIDATED
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-100">
                FinFET-v4.2.1-Twin (3nm Multi-Gate GAA Node)
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyChecksum}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              {copyStatus ? 'Copied SHA!' : 'Copy Weights SHA'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800">
            <span className="text-[10px] text-zinc-400 block">TRAINED DATASET</span>
            <span className="text-sm font-bold text-zinc-100">1,020 Fab Lots</span>
            <span className="text-[10px] text-zinc-500 block">25,500 Physical Wafers</span>
          </div>

          <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800">
            <span className="text-[10px] text-zinc-400 block">ATE TEST ACCURACY</span>
            <span className="text-sm font-bold text-emerald-400">98.4%</span>
            <span className="text-[10px] text-zinc-500 block">±0.2% vs wafer sort probe</span>
          </div>

          <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800">
            <span className="text-[10px] text-zinc-400 block">PREDICTION LOSS</span>
            <span className="text-sm font-bold text-cyan-400">MSE 0.0031</span>
            <span className="text-[10px] text-zinc-500 block">Bin qualification loss</span>
          </div>

          <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800">
            <span className="text-[10px] text-zinc-400 block">LATENCY (CUDA)</span>
            <span className="text-sm font-bold text-amber-400">14.2 ms / wafer</span>
            <span className="text-[10px] text-zinc-500 block">620 dies tensor inference</span>
          </div>
        </div>
      </div>

      {/* Model Version History Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden shadow-lg">
        <div className="p-3.5 bg-zinc-900/40 border-b border-zinc-800 flex items-center justify-between">
          <span className="font-bold text-zinc-200 uppercase tracking-wider text-xs flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Digital Twin Model Version Registry
          </span>
          <span className="text-[10.5px] text-zinc-500">Immutable Model Artifacts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60 text-[10.5px] text-zinc-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Model Tag</th>
                <th className="py-2.5 px-3">Release Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Trained Lots</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Loss (MSE)</th>
                <th className="py-2.5 px-3">Weights SHA-256</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-[11.5px]">
              {models.map((m) => (
                <tr
                  key={m.id}
                  className={`hover:bg-zinc-900/40 transition-colors ${
                    m.id === activeModel ? 'bg-cyan-950/20' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold text-zinc-100">{m.id}</td>
                  <td className="py-2.5 px-3 text-zinc-400">{m.date}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.status.includes('Active')
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : m.status === 'Archived'
                          ? 'bg-zinc-800 text-zinc-300'
                          : 'bg-rose-950 text-rose-300'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-300">{m.lots}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-400">{m.accuracy}</td>
                  <td className="py-2.5 px-3 text-cyan-400">{m.mse}</td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-zinc-500 max-w-xs truncate">
                    {m.checksum}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {m.id === activeModel ? (
                      <span className="text-[10px] text-cyan-400 font-bold">CURRENT ACTIVE</span>
                    ) : (
                      <button
                        onClick={() => setActiveModel(m.id)}
                        className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 text-[10.5px] cursor-pointer"
                      >
                        Activate
                      </button>
                    )}
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
