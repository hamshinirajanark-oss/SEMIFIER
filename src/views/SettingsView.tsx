import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import { useFab } from '../context/FabContext';
import { USER_ROLES } from '../data/fabData';
import { RiskWeights } from '../types';

export function SettingsView() {
  const {
    riskWeights,
    updateRiskWeights,
    currentUser,
    switchUserRole,
  } = useFab();

  // Local weights state
  const [weights, setWeights] = useState<RiskWeights>({
    contamination: riskWeights.contamination,
    mechanical: riskWeights.mechanical,
    lithography: riskWeights.photolithography || riskWeights.lithography || 0.32,
    environmental: riskWeights.environmental,
    metrology: riskWeights.metrology || 0.0,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [cudaEnabled, setCudaEnabled] = useState(true);
  const [syncInterval, setSyncInterval] = useState('30s');

  const totalSum = parseFloat(
    (
      (weights.contamination || 0) +
      (weights.mechanical || 0) +
      (weights.lithography || 0) +
      (weights.environmental || 0) +
      (weights.metrology || 0)
    ).toFixed(2)
  );

  const isValidSum = Math.abs(totalSum - 1.0) < 0.001;

  const handleWeightChange = (key: keyof RiskWeights, val: number) => {
    setWeights((prev: RiskWeights) => ({
      ...prev,
      [key]: Math.max(0, Math.min(1, val)),
    }));
    setSaveSuccess(false);
  };

  const handleSaveWeights = () => {
    if (!isValidSum) return;
    const ok = updateRiskWeights({
      contamination: weights.contamination,
      mechanical: weights.mechanical,
      photolithography: weights.lithography || weights.photolithography || 0.32,
      environmental: weights.environmental,
      metrology: weights.metrology,
    });
    if (ok.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleResetWeights = () => {
    const defaultW: RiskWeights = {
      contamination: 0.28,
      mechanical: 0.22,
      lithography: 0.32,
      environmental: 0.18,
      metrology: 0.0,
    };
    setWeights(defaultW);
    updateRiskWeights(defaultW);
  };

  return (
    <div className="space-y-5 font-mono text-xs max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
              Fab Configuration & Risk Weights Settings
            </h2>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
            SEMI E10 compliant process risk weighting, RBAC persona switcher, and simulation engine parameters.
          </p>
        </div>

        <button
          onClick={handleResetWeights}
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          Reset Standard Weights
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Risk weights validated and committed to active physics inference tensor.</span>
        </div>
      )}

      {/* Risk Weights Configuration Panel */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4.5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div>
            <span className="font-bold text-xs text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Category Yield Risk Weights (Normalized Σ = 100%)
            </span>
            <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
              Determines the contribution of each manufacturing discipline to total defect density and i9 bin qualification.
            </p>
          </div>

          <div
            className={`px-3 py-1 rounded font-bold text-xs flex items-center gap-1.5 border ${
              isValidSum
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
            }`}
          >
            {!isValidSum && <AlertTriangle className="w-3.5 h-3.5" />}
            <span>Current Sum: {(totalSum * 100).toFixed(1)}%</span>
          </div>
        </div>

        {!isValidSum && (
          <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded text-rose-300 text-[11px] font-sans">
            <strong>Warning:</strong> Risk weights must sum to exactly 100.0% (1.00) to maintain physical conservation of probability in the FinFET stochastic model. Currently {(totalSum * 100).toFixed(1)}%.
          </div>
        )}

        {/* Sliders / Inputs */}
        <div className="space-y-3">
          {[
            {
              key: 'lithography' as const,
              label: 'Photolithography Overlay & Alignment',
              color: 'text-cyan-400',
              accent: 'accent-cyan-400',
              val: weights.lithography,
            },
            {
              key: 'contamination' as const,
              label: 'Contamination Control & Airborne Particles',
              color: 'text-amber-400',
              accent: 'accent-amber-400',
              val: weights.contamination,
            },
            {
              key: 'mechanical' as const,
              label: 'Mechanical Stress & CMP Downforce',
              color: 'text-purple-400',
              accent: 'accent-purple-400',
              val: weights.mechanical,
            },
            {
              key: 'environmental' as const,
              label: 'Environmental & Chamber Stability',
              color: 'text-emerald-400',
              accent: 'accent-emerald-400',
              val: weights.environmental,
            },
            {
              key: 'metrology' as const,
              label: 'Inspection & Metrology Quality Factor',
              color: 'text-blue-400',
              accent: 'accent-blue-400',
              val: weights.metrology,
            },
          ].map((w) => {
            const val = w.val ?? 0;
            return (
              <div
                key={w.key}
                className="bg-zinc-900/50 p-3 rounded border border-zinc-800/80 space-y-1.5"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-semibold ${w.color}`}>{w.label}</span>
                  <span className="font-bold text-zinc-100 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                    {(val * 100).toFixed(1)}% ({val.toFixed(3)})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.6"
                  step="0.01"
                  value={val}
                  onChange={(e) => handleWeightChange(w.key, +e.target.value)}
                  className={`w-full ${w.accent} cursor-pointer`}
                />
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSaveWeights}
            disabled={!isValidSum}
            className="px-5 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/60 rounded font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-40"
          >
            <Save className="w-3.5 h-3.5" />
            Save & Recompute Active Twin
          </button>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Switcher */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4.5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="font-bold text-xs text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            Role-Based Access Control (RBAC) Persona Switcher
          </span>
          <span className="text-[10.5px] text-zinc-500">SEMI Security Standard</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {USER_ROLES.map((role) => {
            const isSelected = currentUser.role === role.role;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => switchUserRole(role.role)}
                className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-zinc-100">{role.name}</span>
                  {isSelected && <UserCheck className="w-4 h-4 text-cyan-400" />}
                </div>
                <span className="text-[10px] text-cyan-400 block uppercase tracking-wide">
                  {role.role}
                </span>
                <p className="text-[11px] text-zinc-400 font-sans mt-1.5 leading-relaxed">
                  {role.permissions?.canEditProcessParams && role.permissions?.canRunSimulations
                    ? 'Full read/write engineering control, batch simulation execution, and recipe calibration.'
                    : role.permissions?.canReviewHistoricalData && role.permissions?.canManageUsers
                    ? 'Executive oversight, lot release authorization, CSV audit export, and user management.'
                    : 'Analytical read-only access, defect signature correlation inspection, and metrology charts.'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Engine & Compute Hardware Configuration */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4.5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="font-bold text-xs text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            Compute Engine & Inline Metrology Telemetry
          </span>
          <span className="text-[10.5px] text-zinc-500">Hardware Acceleration</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center justify-between bg-zinc-900/50 p-3 rounded border border-zinc-800">
            <div>
              <span className="font-semibold text-zinc-200 block">CUDA GPU Acceleration</span>
              <span className="text-[10.5px] text-zinc-500 font-sans">
                Offload 3D wafer radial tensor mathematics to GPU (14.2 ms)
              </span>
            </div>
            <input
              type="checkbox"
              checked={cudaEnabled}
              onChange={(e) => setCudaEnabled(e.target.checked)}
              className="w-4 h-4 accent-emerald-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between bg-zinc-900/50 p-3 rounded border border-zinc-800">
            <div>
              <span className="font-semibold text-zinc-200 block">Inline Metrology Auto-Sync</span>
              <span className="text-[10.5px] text-zinc-500 font-sans">
                Poll sensor telemetries from TEL / ASML scan handlers
              </span>
            </div>
            <select
              value={syncInterval}
              onChange={(e) => setSyncInterval(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="15s">Every 15s</option>
              <option value="30s">Every 30s (Default)</option>
              <option value="60s">Every 60s</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
