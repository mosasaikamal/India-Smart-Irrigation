import React from 'react';
import { CampusFindProvider, useCampusFind } from './context/CampusFindContext';
import { CampusFindNavbar } from './components/campusfind/Navbar';
import { CampusFindFooter } from './components/campusfind/Footer';
import { CampusFindToastContainer } from './components/campusfind/ToastContainer';

// Pages
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { ReportLostPage } from './pages/ReportLostPage';
import { ReportFoundPage } from './pages/ReportFoundPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { HelpPage } from './pages/HelpPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { ClaimItemPage } from './pages/ClaimItemPage';
import { ClaimStatusPage } from './pages/ClaimStatusPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { DesignThinkingPage } from './pages/DesignThinkingPage';
import { DashboardPage } from './pages/DashboardPage';

const CampusFindContent: React.FC = () => {
  const { currentTab } = useCampusFind();

  const renderCurrentPage = () => {
    switch (currentTab) {
      case 'home':
        return <HomePage />;
      case 'browse':
        return <BrowsePage />;
      case 'report-lost':
        return <ReportLostPage />;
      case 'report-found':
        return <ReportFoundPage />;
      case 'my-reports':
        return <MyReportsPage />;
      case 'help':
        return <HelpPage />;
      case 'item-detail':
        return <ItemDetailPage />;
      case 'claim-item':
        return <ClaimItemPage />;
      case 'claim-status':
        return <ClaimStatusPage />;
      case 'admin':
        return <AdminDashboardPage />;
      case 'design-thinking':
        return <DesignThinkingPage />;
      case 'dashboard':
        return <DashboardPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 antialiased font-sans">
      {/* Real-time Notifications */}
      <CampusFindToastContainer />

      {/* Clean Minimal Header */}
      <CampusFindNavbar />

      {/* Main Workspace */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 w-full">
        {renderCurrentPage()}
      </main>

      {/* Simplified Footer */}
      <CampusFindFooter />
    </div>
  );
};

export const CampusFindApp: React.FC = () => {
  return (
    <CampusFindProvider>
      <CampusFindContent />
    </CampusFindProvider>
  );
};

export default CampusFindApp;
