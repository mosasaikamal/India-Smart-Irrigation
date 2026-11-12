import React from 'react';
import { PlacementProvider, usePlacement } from './context/PlacementContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AcademicDisclaimerBanner } from './components/common/AcademicDisclaimerBanner';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthProfileModal } from './components/modals/AuthProfileModal';
import { DownloadSyllabusModal } from './components/modals/DownloadSyllabusModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { PlacementDrivesPage } from './pages/PlacementDrivesPage';
import { CompanyDetailPage } from './pages/CompanyDetailPage';
import { VerifiedSyllabusPage } from './pages/VerifiedSyllabusPage';
import { MyPreparationPage } from './pages/MyPreparationPage';
import { AboutProjectPage } from './pages/AboutProjectPage';
import { RumourBusterPage } from './pages/RumourBusterPage';

const PlacementContent: React.FC = () => {
  const { currentTab } = usePlacement();

  const renderCurrentPage = () => {
    switch (currentTab) {
      case 'home':
        return <LandingPage />;
      case 'dashboard':
        return <StudentDashboard />;
      case 'drives':
        return <PlacementDrivesPage />;
      case 'company-detail':
        return <CompanyDetailPage />;
      case 'syllabus':
        return <VerifiedSyllabusPage />;
      case 'my-prep':
        return <MyPreparationPage />;
      case 'rumours':
        return <RumourBusterPage />;
      case 'about':
        return <AboutProjectPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans selection:bg-cyanAccent-500 selection:text-navy-950">
      
      {/* Real-time Floating Notifications */}
      <ToastContainer />

      {/* Mandatory University Academic Disclaimer Banner */}
      <AcademicDisclaimerBanner />

      {/* Modern Sticky Navigation */}
      <Navbar />

      {/* Main Page Workspace */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {renderCurrentPage()}
      </main>

      {/* Comprehensive Academic Footer */}
      <Footer />

      {/* Reusable Core Modals */}
      <AuthProfileModal />
      <DownloadSyllabusModal />
    </div>
  );
};

export const PlacementApp: React.FC = () => {
  return (
    <PlacementProvider>
      <PlacementContent />
    </PlacementProvider>
  );
};

export default PlacementApp;
