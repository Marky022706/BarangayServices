import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CertificatePrintView } from './components/CertificatePrintView';
import { StaffLoginGate } from './components/StaffLoginGate';
import { StaffLayout } from './components/StaffLayout';
import { Home } from './pages/Home';
import { Apply } from './pages/Apply';
import { TrackApplication } from './pages/TrackApplication';
import { StaffDashboard } from './pages/StaffDashboard';
import type { ApplicationRecord, ApplicationStatus, DocumentType } from './types';
import { useCallback } from 'react';
import { applicationsApi, staffApi, authApi } from './services/api';
import { ToastProvider } from './components/Toast';
import './App.css';

// ─── Route resolution ────────────────────────────────────────────────────────
function resolveInitialPath(): string {
  const path = window.location.pathname;
  if (path === '/apply' || path === '/track' || path === '/staff') return path;
  // Vite hash fallback
  const hash = window.location.hash.replace('#', '');
  if (hash === '/apply' || hash === '/track' || hash === '/staff') return hash;
  return '/';
}

function resolveInitialDoc(): DocumentType | null {
  const params = new URLSearchParams(window.location.search);
  const doc = params.get('document');
  if (doc === 'clearance' || doc === 'indigency' || doc === 'residency') return doc;
  return null;
}

function resolveInitialRef(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('ref') || '';
}

// ─── App Content ─────────────────────────────────────────────────────────────
function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(resolveInitialPath);
  const [selectedDocForApply, setSelectedDocForApply] = useState<DocumentType | null>(resolveInitialDoc);
  const [trackingRefInput, setTrackingRefInput] = useState<string>(resolveInitialRef);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [printModalApp, setPrintModalApp] = useState<ApplicationRecord | null>(null);

  // ── Staff auth state ──
  const [staffAuthenticated, setStaffAuthenticated] = useState<boolean>(() =>
    sessionStorage.getItem('brgy_staff_authenticated') === 'true'
  );
  const [staffUser, setStaffUser] = useState<string>(() =>
    sessionStorage.getItem('brgy_staff_user') || 'admin'
  );

  // Fetch live applications from database
  const refreshApplications = useCallback(async () => {
    try {
      const res = await applicationsApi.getAll();
      setApplications(res.applications);
    } catch (err) {
      console.error('Failed to load applications from MySQL database:', err);
    }
  }, []);

  // Check auth session and fetch live applications on mount and path changes
  useEffect(() => {
    refreshApplications();
    if (staffAuthenticated) {
      authApi.getMe().then((res) => {
        if (!res.success) {
          setStaffAuthenticated(false);
        }
      }).catch(() => {
        // Token expired
        setStaffAuthenticated(false);
      });
    }
  }, [refreshApplications, staffAuthenticated, currentPath]);

  // Sync browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const doc = params.get('document');
      const ref = params.get('ref');

      if (['/apply', '/track', '/staff'].includes(path)) {
        setCurrentPath(path);
      } else {
        const hash = window.location.hash.replace('#', '');
        setCurrentPath(['/apply', '/track', '/staff'].includes(hash) ? hash : '/');
      }

      if (doc === 'clearance' || doc === 'indigency' || doc === 'residency') setSelectedDocForApply(doc);
      if (ref) setTrackingRefInput(ref);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ── Navigation ──────────────────────────────────────────────────────────
  const navigate = (path: string, param?: string) => {
    let targetUrl = path;

    if (path === '/apply' && param) {
      targetUrl = `/apply?document=${param}`;
      setSelectedDocForApply(param as DocumentType);
    }
    if (path === '/track' && param) {
      targetUrl = `/track?ref=${encodeURIComponent(param)}`;
      setTrackingRefInput(param);
    }

    try {
      window.history.pushState({}, '', targetUrl);
    } catch {
      window.location.hash = path;
    }

    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyFromService = (serviceId: DocumentType) => {
    setSelectedDocForApply(serviceId);
    navigate('/apply', serviceId);
  };

  const handleNewApplication = (newApp: ApplicationRecord) => {
    setApplications((prev) => [newApp, ...prev.filter(a => a.id !== newApp.id)]);
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: ApplicationStatus,
    controlNumber?: string,
    remarks?: string,
    rejectionReason?: string
  ) => {
    try {
      let updated: ApplicationRecord;
      if (newStatus === 'Approved') {
        updated = await staffApi.approve(id, { remarks, customControlNumber: controlNumber });
      } else if (newStatus === 'Rejected') {
        updated = await staffApi.reject(id, { reason: rejectionReason || 'Discrepancy or requirements issue.', remarks });
      } else if (newStatus === 'Under Verification') {
        updated = await staffApi.moveToVerification(id, { remarks });
      } else if (newStatus === 'Ready for Claiming') {
        updated = await staffApi.markReady(id, { remarks });
      } else if (newStatus === 'Successful') {
        updated = await staffApi.markClaimed(id, { remarks });
      } else {
        return;
      }

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? updated : app))
      );
      if (printModalApp && printModalApp.id === id) {
        setPrintModalApp(updated);
      }
    } catch (err: any) {
      alert(`Status update failed: ${err.message || 'Error updating status in MySQL.'}`);
    }
  };

  // ── Staff auth handlers ─────────────────────────────────────────────────
  const handleStaffAuthenticated = () => {
    const user = sessionStorage.getItem('brgy_staff_user') || 'admin';
    setStaffUser(user);
    setStaffAuthenticated(true);
    refreshApplications();
  };

  const handleStaffLogout = async () => {
    await authApi.logout();
    setStaffAuthenticated(false);
    navigate('/');
  };

  // ── Render: /staff is completely separate from the public layout ────────
  if (currentPath === '/staff') {
    if (!staffAuthenticated) {
      return <StaffLoginGate onAuthenticated={handleStaffAuthenticated} />;
    }

    return (
      <StaffLayout staffUser={staffUser} onLogout={handleStaffLogout}>
        <StaffDashboard
          applications={applications}
          onUpdateStatus={handleUpdateStatus}
          onViewPrintCertificate={(app) => setPrintModalApp(app)}
        />

        {printModalApp && (
          <CertificatePrintView
            application={printModalApp}
            onClose={() => setPrintModalApp(null)}
          />
        )}
      </StaffLayout>
    );
  }

  // ── Render: public-facing portal ────────────────────────────────────────
  return (
    <div className="app-root">
      <Navbar currentPath={currentPath} onNavigate={navigate} />

      <main className="main-content">
        {currentPath === '/' && (
          <Home onNavigate={navigate} onApplyService={handleApplyFromService} />
        )}

        {currentPath === '/apply' && (
          <Apply
            initialDocumentType={selectedDocForApply}
            onSubmitApplication={handleNewApplication}
            onNavigate={navigate}
          />
        )}

        {currentPath === '/track' && (
          <TrackApplication
            applications={applications}
            initialReference={trackingRefInput}
            onNavigate={navigate}
          />
        )}
      </main>

      {printModalApp && (
        <CertificatePrintView
          application={printModalApp}
          onClose={() => setPrintModalApp(null)}
        />
      )}

      <Footer onNavigate={navigate} />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
