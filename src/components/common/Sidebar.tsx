import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Disc3,
  History,
  SlidersHorizontal,
  Trophy,
  BookOpenCheck,
  ShieldAlert,
  GitCompare,
  Copy,
  CheckSquare,
  Settings,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { useFab } from '../../context/FabContext';

interface NavItem {
  id: string;
  name: string;
  route: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar() {
  const { currentRoute, navigate, cumulativeImpact, simulationRuns } = useFab();

  const sections: NavSection[] = [
    {
      title: 'PRIMARY CORE',
      items: [
        {
          id: 'dashboard',
          name: 'Overview Dashboard',
          route: '/dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'DIGITAL WAFER LAB',
      items: [
        {
          id: 'new-simulation',
          name: 'New Simulation',
          route: '/simulations/new',
          icon: PlusCircle,
          badge: '60+ Param',
          badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800/40',
        },
        {
          id: 'wafer-3d',
          name: '3D Wafer Twin',
          route: '/',
          icon: Disc3,
          badge: 'Interactive',
          badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800/40',
        },
        {
          id: 'history',
          name: 'Simulation History',
          route: '/simulations',
          icon: History,
          badge: simulationRuns.length > 0 ? `${simulationRuns.length}` : undefined,
        },
      ],
    },
    {
      title: 'YIELD INTELLIGENCE',
      items: [
        {
          id: 'bin-analysis',
          name: 'Bin Capability Analysis',
          route: '/bin-analysis',
          icon: SlidersHorizontal,
        },
        {
          id: 'best-candidate',
          name: 'Best i9 Candidate',
          route: '/best-candidate',
          icon: Trophy,
        },
        {
          id: 'historical-experience',
          name: 'Historical Experience',
          route: '/historical-experience',
          icon: BookOpenCheck,
          badge: '1,020+ Lots',
        },
      ],
    },
    {
      title: 'CLOSED-LOOP PREVENTION',
      items: [
        {
          id: 'defect-prevention',
          name: 'Defect Prevention',
          route: '/defect-prevention',
          icon: ShieldAlert,
          badge:
            cumulativeImpact.actionsActivated > 0
              ? `+${cumulativeImpact.predictedI9GainPct}% i9`
              : 'Active',
          badgeColor:
            cumulativeImpact.actionsActivated > 0
              ? 'bg-amber-950 text-amber-300 border-amber-800/40'
              : undefined,
        },
        {
          id: 'what-if',
          name: 'What-If Optimization',
          route: '/what-if',
          icon: GitCompare,
        },
        {
          id: 'twin-models',
          name: 'i9 Process Twin',
          route: '/twin-models',
          icon: Copy,
        },
        {
          id: 'validation',
          name: 'Validation Feedback',
          route: '/validation',
          icon: CheckSquare,
        },
      ],
    },
    {
      title: 'FAB SETTINGS',
      items: [
        {
          id: 'admin',
          name: 'Admin / Model Settings',
          route: '/admin',
          icon: Settings,
        },
      ],
    },
  ];

  const isActive = (route: string) => {
    if (route === '/') {
      return currentRoute === '/' || currentRoute === '/wafer-3d';
    }
    return currentRoute === route;
  };

  return (
    <nav aria-label="Main Navigation" className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col shrink-0 min-h-[calc(100vh-80px)] select-none">
      <div className="p-3 space-y-6 flex-1 overflow-y-auto">
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-1">
            <h3 className="text-[10px] font-mono tracking-widest text-zinc-500 font-semibold px-2 uppercase">
              {sec.title}
            </h3>
            <div className="space-y-0.5 pt-1">
              {sec.items.map((item) => {
                const active = isActive(item.route);
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.route)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.8 rounded-md text-xs transition-all font-mono group cursor-pointer ${
                      active
                        ? 'bg-zinc-800/90 text-cyan-300 font-semibold shadow-sm border border-cyan-500/20'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                          active ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-300'
                        }`}
                      />
                      <span className="truncate text-left text-[12px] font-sans">{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded border font-mono shrink-0 ml-1 ${
                          item.badgeColor || 'bg-zinc-900 text-zinc-400 border-zinc-700/60'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer Info */}
      <div className="p-3 border-t border-zinc-900 bg-zinc-950/60 font-mono text-[10px] text-zinc-500 flex items-center justify-between">
        <div>
          <span>Line 7 • FinFET</span>
          <span className="block text-[9px] text-zinc-600">SEMI E10 Standard</span>
        </div>
        <div className="flex items-center gap-1 text-cyan-500">
          <Flame className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>v1.0-RC</span>
        </div>
      </div>
    </nav>
  );
}
