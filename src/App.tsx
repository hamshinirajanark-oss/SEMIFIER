import React from 'react';
import { FabProvider, useFab } from './context/FabContext';
import { DisclaimerBanner } from './components/common/DisclaimerBanner';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';

// Views
import { WaferTwinView } from './views/WaferTwinView';
import { DashboardView } from './views/DashboardView';
import { NewSimulationView } from './views/NewSimulationView';
import { SimulationHistoryView } from './views/SimulationHistoryView';
import { BinAnalysisView } from './views/BinAnalysisView';
import { BestCandidateView } from './views/BestCandidateView';
import { DefectPreventionView } from './views/DefectPreventionView';
import { WhatIfAnalysisView } from './views/WhatIfAnalysisView';
import { HistoricalExperienceView } from './views/HistoricalExperienceView';
import { TwinModelsView } from './views/TwinModelsView';
import { ValidationView } from './views/ValidationView';
import { SettingsView } from './views/SettingsView';

function AppContent() {
  const { currentRoute } = useFab();

  const renderCurrentView = () => {
    switch (currentRoute) {
      case '/':
      case '/wafer-3d':
        return <WaferTwinView />;
      case '/dashboard':
        return <DashboardView />;
      case '/simulations/new':
        return <NewSimulationView />;
      case '/simulations':
        return <SimulationHistoryView />;
      case '/bin-analysis':
        return <BinAnalysisView />;
      case '/best-candidate':
        return <BestCandidateView />;
      case '/defect-prevention':
        return <DefectPreventionView />;
      case '/what-if':
        return <WhatIfAnalysisView />;
      case '/historical-experience':
        return <HistoricalExperienceView />;
      case '/twin-models':
        return <TwinModelsView />;
      case '/validation':
        return <ValidationView />;
      case '/settings':
        return <SettingsView />;
      default:
        return <WaferTwinView />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Engineering Compliance Disclaimer */}
      <DisclaimerBanner />

      {/* Primary Fab Twin Header */}
      <Header />

      {/* Main Workspace Layout with Sidebar & Active View */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Scrollable Main Stage */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto min-w-0 bg-zinc-900/30">
          {renderCurrentView()}
        </main>
      </div>

      {/* Semiconductor Standards Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <FabProvider>
      <AppContent />
    </FabProvider>
  );
}
