import { useState, useEffect, useCallback } from 'react';
import { ResidentLayout } from './layouts/ResidentLayout';
import { AdminLayout, type StaffTab } from './layouts/AdminLayout';
import { ToastProvider } from './providers/ToastProvider';

import { CertificatePrintView } from '../features/document-processing/components/CertificatePrintView';
import { StaffLoginGate } from '../features/authentication/components/StaffLoginGate';
import { SignInSuccessModal } from '../features/authentication/components/SignInSuccessModal';
import { StaffDashboard } from '../features/dashboard/components/StaffDashboard';
import { Home } from '../features/document-services/pages/HomePage';
import { HelpSupport } from '../features/document-services/pages/HelpSupportPage';
import { Apply } from '../features/applications/pages/ApplyPage';
import { TrackApplication } from '../features/application-tracking/pages/TrackApplicationPage';

import type { ApplicationRecord, ApplicationStatus, DocumentType } from '../types';
import { applicationsApi, staffApi, authApi, type AuthUserResponse } from '../services/api';
import '../App.css';

// ─── Route resolution ────────────────────────────────────────────────────────
function resolveInitialPath(): string {
  const path = window.location.pathname;
  if (path === '/apply' || path === '/track' || path === '/help' || path === '/staff') return path;
  // Vite hash fallback
  const hash = window.location.hash.replace('#', '');
  if (hash === '/apply' || hash === '/track' || hash === '/help' || hash === '/staff') return hash;
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
  const [isLoadingApplications, setIsLoadingApplications] = useState<boolean>(true);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);
  const [printModalApp, setPrintModalApp] = useState<ApplicationRecord | null>(null);

  // ── Staff auth state ──
  const [staffAuthenticated, setStaffAuthenticated] = useState<boolean>(() =>
    sessionStorage.getItem('brgy_staff_authenticated') === 'true'
  );
  const [staffUser, setStaffUser] = useState<string>(() =>
    sessionStorage.getItem('brgy_staff_user') || 'admin'
  );
  const [staffActiveTab, setStaffActiveTab] = useState<StaffTab>('dashboard');
  const [showSignInSuccessModal, setShowSignInSuccessModal] = useState<boolean>(false);
  const [authenticatedStaffUser, setAuthenticatedStaffUser] = useState<AuthUserResponse | null>(null);

  // Fetch live applications from database
  const refreshApplications = useCallback(async () => {
    setIsLoadingApplications(true);
    setApplicationsError(null);
    try {
      const res = await applicationsApi.getAll();
      setApplications(res.applications);
    } catch (err) {
      console.error('Failed to load applications:', err);
      setApplicationsError('Unable to load application records right now. Please check your network connection and click Retry.');
    } finally {
      setIsLoadingApplications(false);
    }
  }, []);

  // Check auth session and fetch live applications on mount and path changes
  useEffect(() => {
    refreshApplications();
    if (staffAuthenticated) {
      authApi.getMe().then((res) => {
        const verifiedRole = res.data?.user?.role || (res as any).user?.role;
        if (!res.success || (verifiedRole && verifiedRole !== 'admin' && verifiedRole !== 'staff')) {
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

      if (['/apply', '/track', '/help', '/staff'].includes(path)) {
        setCurrentPath(path);
      } else {
        const hash = window.location.hash.replace('#', '');
        setCurrentPath(['/apply', '/track', '/help', '/staff'].includes(hash) ? hash : '/');
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
    if (!newApp || !newApp.id) return;
    setApplications((prev) => [newApp, ...prev.filter((a) => a && a.id !== newApp.id)]);
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
      throw new Error(err.message || 'Unable to update application status. Please try again.');
    }
  };

  // ── Staff auth handlers ─────────────────────────────────────────────────
  const handleStaffAuthenticated = (authenticatedUser?: AuthUserResponse, fromSuccessfulLogin = false) => {
    const user = authenticatedUser?.username || sessionStorage.getItem('brgy_staff_user') || 'admin';
    const role = authenticatedUser?.role || sessionStorage.getItem('brgy_staff_role') || 'admin';

    if (role === 'admin' || role === 'staff') {
      setStaffUser(user);
      setStaffAuthenticated(true);
      setStaffActiveTab('dashboard');
      if (authenticatedUser) {
        setAuthenticatedStaffUser(authenticatedUser);
      }
      if (fromSuccessfulLogin) {
        setShowSignInSuccessModal(true);
      }
      refreshApplications();
      if (currentPath !== '/staff') {
        navigate('/staff');
      }
    } else {
      // Resident role navigates to the public resident portal
      setStaffAuthenticated(false);
      navigate('/');
    }
  };

  const handleStaffLogout = async () => {
    await authApi.logout();
    setStaffAuthenticated(false);
    setShowSignInSuccessModal(false);
    navigate('/');
  };

  // ── Render: /staff Admin Workspace ─────────────────────────────────────
  if (currentPath === '/staff') {
    if (!staffAuthenticated) {
      return <StaffLoginGate onAuthenticated={handleStaffAuthenticated} />;
    }

    const pendingCount = applications.filter((a) => a.status === 'Pending Review').length;

    return (
      <AdminLayout
        staffUser={staffUser}
        onLogout={handleStaffLogout}
        activeTab={staffActiveTab}
        onTabChange={setStaffActiveTab}
        pendingCount={pendingCount}
        totalCount={applications.length}
      >
        <StaffDashboard
          applications={applications}
          activeTab={staffActiveTab}
          onTabChange={setStaffActiveTab}
          isLoading={isLoadingApplications}
          loadError={applicationsError}
          onRefresh={refreshApplications}
          onUpdateStatus={handleUpdateStatus}
          onViewPrintCertificate={(app) => setPrintModalApp(app)}
        />

        {/* Successful Sign-In Notification Modal displayed on top of the active Dashboard */}
        {showSignInSuccessModal && (
          <SignInSuccessModal
            isOpen={showSignInSuccessModal}
            user={
              authenticatedStaffUser || {
                fullName: staffUser === 'admin' ? 'Administrator — Hon. Honorio A. Reyes' : staffUser,
                role: 'admin',
                username: staffUser
              }
            }
            onContinue={() => setShowSignInSuccessModal(false)}
          />
        )}

        {printModalApp && (
          <CertificatePrintView
            application={printModalApp}
            onClose={() => setPrintModalApp(null)}
          />
        )}
      </AdminLayout>
    );
  }

  // ── Render: Public-Facing Resident Portal ───────────────────────────────
  return (
    <ResidentLayout currentPath={currentPath} onNavigate={navigate}>
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

      {currentPath === '/help' && (
        <HelpSupport
          onNavigate={navigate}
          onApplyService={handleApplyFromService}
        />
      )}

      {printModalApp && (
        <CertificatePrintView
          application={printModalApp}
          onClose={() => setPrintModalApp(null)}
        />
      )}
    </ResidentLayout>
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

