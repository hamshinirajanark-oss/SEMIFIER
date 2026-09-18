import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Cpu,
  Disc,
  Eye,
  Filter,
  Flame,
  Layers,
  Play,
  RotateCw,
  Settings2,
  ShieldAlert,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useFab } from '../context/FabContext';
import {
  LayoutPattern,
  NotchOrientation,
  ProcessorBin,
  ViewMode,
  VisualizationMode,
  WaferDiameter,
} from '../types';
import { Wafer3DCanvas } from '../components/wafer/Wafer3DCanvas';
import { SelectedDiePanel } from '../components/wafer/SelectedDiePanel';
import { ClosedLoopDiagram } from '../components/common/ClosedLoopDiagram';
import {
  DEFAULT_SIMULATION_PARAMS,
  HIGH_YIELD_PRESET_PARAMS,
} from '../utils/physicsEngine';

export function WaferTwinView() {
  const {
    activeWafer,
    selectedDie,
    selectDie,
    regenerateActiveWafer,
    navigate,
    runSimulation,
  } = useFab();

  // Wafer Config state
  const [diameter, setDiameter] = useState<WaferDiameter>(activeWafer.diameterMm);
  const [thickness, setThickness] = useState<number>(activeWafer.thicknessUm);
  const [dieX, setDieX] = useState<number>(activeWafer.dieSizeX);
  const [dieY, setDieY] = useState<number>(activeWafer.dieSizeY);
  const [pattern, setPattern] = useState<LayoutPattern>(activeWafer.layoutPattern);
  const [notch, setNotch] = useState<NotchOrientation>(activeWafer.notchOrientationDeg);
  const [edgeExclusion, setEdgeExclusion] = useState<number>(activeWafer.edgeExclusionMm);

  // Process Controls state
  const [recipePreset, setRecipePreset] = useState<
    'Standard_Advanced_FinFET_v4' | 'Aggressive_Overdrive_HighBin' | 'Conservative_ZeroDrift'
  >('Standard_Advanced_FinFET_v4');
  const [toolPreset, setToolPreset] = useState<'EUV Twin' | 'Standard DUV' | 'Metrology Scanner'>('EUV Twin');
  const [stageTemp, setStageTemp] = useState<number>(21.4);
  const [chamberPressure, setChamberPressure] = useState<number>(1.24);
  const [exposureDose, setExposureDose] = useState<number>(34.8);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // View & Layer Overlay state
  const [viewMode, setViewMode] = useState<ViewMode>('3D View');
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('Bin Capability Map');
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [showScribeLanes, setShowScribeLanes] = useState<boolean>(true);
  const [showEdgeExclusion, setShowEdgeExclusion] = useState<boolean>(true);
  const [showCrosshair, setShowCrosshair] = useState<boolean>(true);
  const [activeBinFilter, setActiveBinFilter] = useState<'All' | ProcessorBin>('All');

  const handleApplyWaferConfig = () => {
    regenerateActiveWafer({
      diameter,
      thickness,
      dieSizeX: dieX,
      dieSizeY: dieY,
      pattern,
      notch,
      edgeExclusion,
    });
  };

  const handleProcessWaferTwin = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const params =
        recipePreset === 'Aggressive_Overdrive_HighBin'
          ? HIGH_YIELD_PRESET_PARAMS
          : DEFAULT_SIMULATION_PARAMS;

      runSimulation(params, {
        runName: `FinFET_Twin_${recipePreset}`,
        count: 1,
      });
      setIsProcessing(false);
    }, 600);
  };

  const visOptions: VisualizationMode[] = [
    'Bin Capability Map',
    'Total Defect Risk Density Heatmap',
    'i9 Super-Bin Probability Gradient',
    'Lithography CD Error',
    'Mechanical Stress & Wafer Bowing Tensor',
    'Predicted Thermal & Static Leakage',
    'Twin Drift vs Lot Reference Base',
  ];

  return (
    <div className="space-y-4">
      {/* Top Telemetry Strip */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-zinc-300 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Wafer ID:</span>
            <span className="font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
              {activeWafer.id}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Lot ID:</span>
            <span className="font-semibold text-zinc-200">{activeWafer.lotId}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Model:</span>
            <span className="text-zinc-200">FinFET-v4.2.1-Twin</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Simulation Complete</span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60 font-semibold">
            <span>DEMO / SYNTHETIC DATA</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-zinc-400">
          <div>
            Fab/Line: <span className="text-zinc-200 font-semibold">Fab 24 • Line 7</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-cyan-400">
            <Zap className="w-3 h-3" />
            <span>CUDA ON</span> • <span>14.2 ms</span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Grid: Config Controls | 3D Canvas & Summary | Selected Die Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Wafer Config & Process Controls (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Panel 1: Wafer Configuration */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Disc className="w-3.5 h-3.5 text-cyan-400" />
                Wafer Configuration
              </span>
              <span className="text-[10px] text-zinc-500">SEMI S2</span>
            </div>

            {/* Diameter Radio */}
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 block">Diameter:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { val: 200, label: '200mm' },
                  { val: 300, label: '300mm' },
                  { val: 450, label: '450mm' },
                ].map((d) => (
                  <button
                    key={d.val}
                    type="button"
                    onClick={() => setDiameter(d.val as WaferDiameter)}
                    className={`py-1 rounded text-center text-[11px] border transition-colors ${
                      diameter === d.val
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Thickness & Edge Exclusion */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <label className="text-zinc-500 block">Thickness (µm):</label>
                <input
                  type="number"
                  value={thickness}
                  onChange={(e) => setThickness(+e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-zinc-500 block">Exclusion (mm):</label>
                <input
                  type="number"
                  value={edgeExclusion}
                  onChange={(e) => setEdgeExclusion(+e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Die Size X x Y */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <label className="text-zinc-500 block">Die X (mm):</label>
                <input
                  type="number"
                  step="0.1"
                  value={dieX}
                  onChange={(e) => setDieX(+e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-zinc-500 block">Die Y (mm):</label>
                <input
                  type="number"
                  step="0.1"
                  value={dieY}
                  onChange={(e) => setDieY(+e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Pattern & Notch */}
            <div className="space-y-1.5 text-[11px]">
              <div>
                <label className="text-zinc-500 block">Die Layout Pattern:</label>
                <select
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value as LayoutPattern)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 focus:outline-none focus:border-cyan-500 text-xs"
                >
                  <option value="Standard Grid">Standard Cartesian Grid</option>
                  <option value="Staggered Hex">Staggered Hexagonal</option>
                  <option value="Radial Concentric">Radial Concentric</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-500 block">Notch Orientation:</label>
                <div className="grid grid-cols-3 gap-1">
                  {[0, 90, 180].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => setNotch(deg as NotchOrientation)}
                      className={`py-0.8 text-[11px] rounded border ${
                        notch === deg
                          ? 'bg-zinc-800 text-cyan-300 border-cyan-500 font-bold'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleApplyWaferConfig}
              className="w-full py-1.8 bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-cyan-600/40 rounded font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Create / Load Wafer
            </button>
          </div>

          {/* Panel 2: Process Controls */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                Process Recipe Controls
              </span>
              <span className="text-[10px] text-emerald-400">FINFET v4</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div>
                <label className="text-zinc-500 block">Recipe Preset:</label>
                <select
                  value={recipePreset}
                  onChange={(e) => setRecipePreset(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="Standard_Advanced_FinFET_v4">Standard_Advanced_FinFET_v4</option>
                  <option value="Aggressive_Overdrive_HighBin">Aggressive_Overdrive_HighBin</option>
                  <option value="Conservative_ZeroDrift">Conservative_ZeroDrift</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-500 block">Exposure Tool Preset:</label>
                <select
                  value={toolPreset}
                  onChange={(e) => setToolPreset(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="EUV Twin">ASML EUV 0.33 NA Twin</option>
                  <option value="Standard DUV">193nm Immersion DUV</option>
                  <option value="Metrology Scanner">Inspection Metrology Tool</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-zinc-500 block text-[10px]">Stage T (°C):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={stageTemp}
                    onChange={(e) => setStageTemp(+e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-zinc-200 text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 block text-[10px]">Press (mTorr):</label>
                  <input
                    type="number"
                    step="0.05"
                    value={chamberPressure}
                    onChange={(e) => setChamberPressure(+e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-zinc-200 text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 block text-[10px]">Dose (mJ/cm²):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={exposureDose}
                    onChange={(e) => setExposureDose(+e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-zinc-200 text-[11px]"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleProcessWaferTwin}
              disabled={isProcessing}
              className="w-full py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/50 rounded font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-400" />
              {isProcessing ? 'Simulating FinFET Physics...' : 'Process Wafer Twin'}
            </button>
          </div>

          {/* Panel 3: View & Layer Overlays */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                View & Layer Overlays
              </span>
              <span className="text-[10px] text-zinc-500">7 Modes</span>
            </div>

            {/* View Mode */}
            <div className="space-y-1">
              <label className="text-[10.5px] text-zinc-500 block">Projection Mode:</label>
              <div className="grid grid-cols-3 gap-1">
                {(['3D View', 'Top Flat', 'Side Cut'] as const).map((vm) => (
                  <button
                    key={vm}
                    type="button"
                    onClick={() => setViewMode(vm)}
                    className={`py-1 text-[11px] rounded border transition-colors ${
                      viewMode === vm
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-850'
                    }`}
                  >
                    {vm}
                  </button>
                ))}
              </div>
            </div>

            {/* 7 Visualization Radios */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] text-zinc-500 block">Physics Heatmap Layer:</label>
              <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                {visOptions.map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-[11px] transition-colors ${
                      visualizationMode === opt
                        ? 'bg-zinc-900 text-cyan-300 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visMode"
                      checked={visualizationMode === opt}
                      onChange={() => setVisualizationMode(opt)}
                      className="accent-cyan-400"
                    />
                    <span className="truncate">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-1.5 text-[11px]">
              <label className="flex items-center justify-between text-zinc-400 cursor-pointer">
                <span>Show Die Grid Lines</span>
                <input
                  type="checkbox"
                  checked={showGridLines}
                  onChange={(e) => setShowGridLines(e.target.checked)}
                  className="accent-cyan-400"
                />
              </label>
              <label className="flex items-center justify-between text-zinc-400 cursor-pointer">
                <span>Show Scribe Lanes</span>
                <input
                  type="checkbox"
                  checked={showScribeLanes}
                  onChange={(e) => setShowScribeLanes(e.target.checked)}
                  className="accent-cyan-400"
                />
              </label>
              <label className="flex items-center justify-between text-zinc-400 cursor-pointer">
                <span>Show 3mm Edge Exclusion</span>
                <input
                  type="checkbox"
                  checked={showEdgeExclusion}
                  onChange={(e) => setShowEdgeExclusion(e.target.checked)}
                  className="accent-cyan-400"
                />
              </label>
              <label className="flex items-center justify-between text-zinc-400 cursor-pointer">
                <span>Cartesian Crosshair</span>
                <input
                  type="checkbox"
                  checked={showCrosshair}
                  onChange={(e) => setShowCrosshair(e.target.checked)}
                  className="accent-cyan-400"
                />
              </label>
            </div>

            {/* Bin Filter Chips */}
            <div className="pt-2 border-t border-zinc-800 space-y-1">
              <label className="text-[10.5px] text-zinc-500 block">Bin Capability Filter:</label>
              <div className="flex flex-wrap gap-1">
                {(['All', 'i9', 'i7', 'i5', 'i3', 'REJ'] as const).map((bin) => (
                  <button
                    key={bin}
                    type="button"
                    onClick={() => setActiveBinFilter(bin)}
                    className={`px-2 py-0.8 rounded text-[10px] font-mono border ${
                      activeBinFilter === bin
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    {bin}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right: 3D Wafer Canvas & Summary Panel (9 cols) */}
        <div className="lg:col-span-9 space-y-4">
          {/* Top of Canvas: Summary Stat Strip */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-zinc-300">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-2.5">
              <div>
                <span className="text-[10px] text-zinc-500 block">TOTAL DIES</span>
                <span className="text-base font-bold text-zinc-100">{activeWafer.totalDies}</span>
                <span className="text-[10px] text-zinc-500 block">
                  Valid: <strong className="text-zinc-300">{activeWafer.validDies}</strong>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">PREDICTED YIELD</span>
                <span className="text-base font-bold text-emerald-400">
                  {activeWafer.predictedYieldPct}%
                </span>
                <span className="text-[10px] text-zinc-500 block">Poisson/Murphy</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">AVG DEFECT RISK</span>
                <span className="text-base font-bold text-amber-400">
                  {activeWafer.avgDefectRiskPct}%
                </span>
                <span className="text-[10px] text-zinc-500 block">Blended 5-cat</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">CRITICAL DEFECTS</span>
                <span className="text-base font-bold text-rose-400">
                  {activeWafer.avgCriticalDefectPct}%
                </span>
                <span className="text-[10px] text-zinc-500 block">Killer rate</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">ELECTRICAL PASS</span>
                <span className="text-base font-bold text-cyan-400">
                  {activeWafer.avgElectricalPassPct}%
                </span>
                <span className="text-[10px] text-zinc-500 block">Threshold: &gt;93% i9</span>
              </div>
            </div>

            {/* Distribution Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10.5px] text-zinc-400">
                <span>Wafer Bin Distribution Ratio</span>
                <span className="text-cyan-400 font-semibold">
                  i9 Super-Bin: {activeWafer.binDistribution.i9} dies (
                  {((activeWafer.binDistribution.i9 / (activeWafer.validDies || 1)) * 100).toFixed(1)}
                  %)
                </span>
              </div>
              <div className="w-full h-2.5 bg-zinc-900 rounded overflow-hidden flex">
                <div
                  style={{
                    width: `${(activeWafer.binDistribution.i9 / (activeWafer.totalDies || 1)) * 100}%`,
                  }}
                  className="bg-cyan-500 h-full"
                  title="i9"
                />
                <div
                  style={{
                    width: `${(activeWafer.binDistribution.i7 / (activeWafer.totalDies || 1)) * 100}%`,
                  }}
                  className="bg-blue-500 h-full"
                  title="i7"
                />
                <div
                  style={{
                    width: `${(activeWafer.binDistribution.i5 / (activeWafer.totalDies || 1)) * 100}%`,
                  }}
                  className="bg-emerald-500 h-full"
                  title="i5"
                />
                <div
                  style={{
                    width: `${(activeWafer.binDistribution.i3 / (activeWafer.totalDies || 1)) * 100}%`,
                  }}
                  className="bg-amber-500 h-full"
                  title="i3"
                />
                <div
                  style={{
                    width: `${(activeWafer.binDistribution.reject / (activeWafer.totalDies || 1)) * 100}%`,
                  }}
                  className="bg-rose-500 h-full"
                  title="Reject"
                />
              </div>
            </div>
          </div>

          {/* 3D Interactive Canvas */}
          <div className="w-full h-[520px]">
            <Wafer3DCanvas
              wafer={activeWafer}
              selectedDie={selectedDie}
              onSelectDie={selectDie}
              visualizationMode={visualizationMode}
              viewMode={viewMode}
              showGridLines={showGridLines}
              showScribeLanes={showScribeLanes}
              showEdgeExclusion={showEdgeExclusion}
              showCrosshair={showCrosshair}
              activeBinFilter={activeBinFilter}
            />
          </div>

          {/* Selected Die Analysis Panel (Populates when die is clicked) */}
          <SelectedDiePanel die={selectedDie} />
        </div>
      </div>

      {/* Bottom Closed Loop Architecture Diagram */}
      <ClosedLoopDiagram />
    </div>
  );
}
