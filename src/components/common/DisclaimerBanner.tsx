import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

export function DisclaimerBanner() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      aria-label="Engineering compliance and simulation disclaimer"
      className="bg-amber-950/40 border-b border-amber-500/30 text-amber-200 px-4 py-2 text-xs transition-all relative z-40"
    >
      <div className="max-w-7xl mx-auto flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300 tracking-wide uppercase mr-2 text-[11px] bg-amber-950 px-1.5 py-0.5 border border-amber-600/40 rounded">
              Engineering Compliance Notice
            </span>
            <span className="text-amber-200/90 font-mono text-[11.5px]">
              SYNTHETIC SIMULATION ESTIMATE ONLY. Physical validation, inline CD-SEM metrology, and ATE electrical testing are mandatory prior to any fabrication release.
            </span>
            {!collapsed && (
              <p className="mt-1 text-amber-300/70 text-[11px] leading-relaxed max-w-5xl">
                A physical die fabricated at an i3 capability level can never be converted into an i9 by software.
                This digital twin predicts statistical yields for prospective process recipes and detects wafer-scale drift to improve future wafer lots.
                Not for automated fab equipment control without human sign-off.
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-amber-400 hover:text-amber-200 p-1 hover:bg-amber-900/30 rounded shrink-0"
          title={collapsed ? 'Expand disclaimer' : 'Collapse disclaimer'}
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
