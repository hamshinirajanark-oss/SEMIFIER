import React from 'react';
import { Cpu, Play, Eye, Activity, Zap, CheckCircle2, Shield, User as UserIcon } from 'lucide-react';
import { useFab } from '../../context/FabContext';
import { FAB_USERS } from '../../data/fabData';

export function Header() {
  const { currentRoute, navigate, activeWafer, currentUser, setCurrentUser } = useFab();

  return (
    <header className="bg-zinc-950 border-b border-zinc-800 text-zinc-100 sticky top-0 z-30 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Logo and Core Brand */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-cyan-600 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-950">
              <div className="w-full h-full bg-zinc-950 rounded flex items-center justify-center">
                <Cpu className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wider text-zinc-100 font-mono">
                  FAB<span className="text-cyan-400">TWIN</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 rounded font-semibold">
                  FinFET v4.2
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 tracking-tight block">
                Digital Wafer Twin & Yield Intelligence
              </span>
            </div>
          </button>

          {/* Quick Route Actions */}
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-zinc-800">
            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
                currentRoute === '/' || currentRoute === '/wafer-3d'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-900/40'
                  : 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 border border-zinc-700/60'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              3D Wafer
            </button>

            <button
              onClick={() => navigate('/simulations/new')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
                currentRoute === '/simulations/new'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  : 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 border border-zinc-700/60'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
              Run Sim
            </button>
          </div>
        </div>

        {/* Center: Live Telemetry Status */}
        <div className="hidden lg:flex items-center gap-4 text-[11px] font-mono text-zinc-400 bg-zinc-900/90 px-3 py-1.5 rounded-md border border-zinc-800">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-zinc-300 font-semibold">ONLINE</span>
          </div>
          <span className="text-zinc-600">|</span>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span className="text-zinc-300">CUDA ON</span>
          </div>
          <span className="text-zinc-600">|</span>
          <div>
            Latency: <span className="text-emerald-400 font-medium">14.2 ms</span>
          </div>
          <span className="text-zinc-600">|</span>
          <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
            <Shield className="w-3 h-3 text-amber-400" />
            <span>SYNTHETIC DEMO</span>
          </div>
        </div>

        {/* Right: Lot Telemetry & Active User Role Switcher */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right font-mono text-[11px] leading-tight pr-3 border-r border-zinc-800">
            <span className="text-zinc-400">
              Lot: <span className="text-cyan-300 font-semibold">{activeWafer.lotId}</span>
            </span>
            <span className="text-zinc-400">
              Wafer: <span className="text-zinc-200">{activeWafer.id}</span> (300mm)
            </span>
          </div>

          {/* User Profile / RBAC Selector */}
          <div className="relative flex items-center gap-2 bg-zinc-900/90 border border-zinc-700/60 rounded px-2.5 py-1.5 text-xs">
            <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-zinc-200 text-[11.5px]">{currentUser.name}</span>
                <span
                  className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold uppercase ${
                    currentUser.role === 'Admin'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                      : currentUser.role === 'ProcessManager'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                      : 'bg-blue-950 text-blue-300 border border-blue-800/50'
                  }`}
                >
                  {currentUser.role}
                </span>
              </div>
            </div>
            {/* Quick switcher for RBAC testing */}
            <select
              value={currentUser.id}
              onChange={(e) => {
                const found = FAB_USERS.find((u) => u.id === e.target.value);
                if (found) setCurrentUser(found);
              }}
              aria-label="Switch logged-in fab user role"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Click to change active User Role for RBAC test"
            >
              {FAB_USERS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.role} ({u.department})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
