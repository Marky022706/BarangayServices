import React, { useState, useEffect, useMemo } from 'react';
import type { ApplicationRecord, ApplicationStatus, DocumentType } from '../../../types';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Printer,
  X,
  Building2,
  Copy,
  Check,
  AlertCircle,
  FileCheck,
  HandHeart,
  House,
  FileText,
  ArrowRight
} from '../../../components/Icons';
import { ConfirmationModal } from '../../../components/modals/ConfirmationModal';
import { TableSkeleton, CardSkeleton } from '../../../components/feedback/SkeletonLoader';
import { useToast } from '../../../components/feedback/Toast';
import { dashboardService as dashboardApi } from '../services/dashboardService';
import type { DashboardStats } from '../types/dashboard.types';
import type { StaffTab } from '../../../app/layouts/AdminLayout';

interface StaffDashboardProps {
  applications: ApplicationRecord[];
  activeTab?: StaffTab;
  onTabChange?: (tab: StaffTab) => void;
  isLoading?: boolean;
  loadError?: string | null;
  onRefresh?: () => Promise<void> | void;
  onUpdateStatus: (
    id: string,
    newStatus: ApplicationStatus,
    controlNumber?: string,
    remarks?: string,
    rejectionReason?: string
  ) => Promise<void> | void;
  onViewPrintCertificate?: (app: ApplicationRecord) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  applications,
  activeTab = 'dashboard',
  onTabChange,
  isLoading = false,
  loadError = null,
  onRefresh,
  onUpdateStatus,
  onViewPrintCertificate
}) => {
  const toast = useToast();

  // Search, Filter, Sort & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocType, setSelectedDocType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name_asc'>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  // Analytics Date-Range Filter for Application Trends ('7d' | '14d' | '30d')
  const [trendRange, setTrendRange] = useState<'7d' | '14d' | '30d'>('7d');

  // Backend Dashboard Stats state
  const [backendStats, setBackendStats] = useState<DashboardStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Selected application for Detail Modal
  const [detailModalApp, setDetailModalApp] = useState<ApplicationRecord | null>(null);

  // Copy reference tracking state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Unified Confirmation Modal State
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    app: ApplicationRecord | null;
    action: 'Approve' | 'Reject' | 'Under Verification' | 'Ready for Claiming' | 'Successful';
    title: string;
    message: string;
    variant: 'primary' | 'success' | 'danger';
    confirmLabel: string;
    reason: string;
    reasonError?: string;
    actionError?: string;
  }>({
    isOpen: false,
    app: null,
    action: 'Approve',
    title: '',
    message: '',
    variant: 'primary',
    confirmLabel: '',
    reason: ''
  });

  // Fetch backend dashboard statistics and keep in sync with live application updates
  const fetchDashboardStats = async () => {
    try {
      const stats = await dashboardApi.getStats();
      setBackendStats(stats);
    } catch {
      // Fallback to live applications array calculation if stats endpoint is temporarily unreachable
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [applications.length]);

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.all([
        onRefresh ? Promise.resolve(onRefresh()) : Promise.resolve(),
        fetchDashboardStats()
      ]);
      toast.info('Dashboard statistics and application records refreshed.', 'Data Updated');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyRef = (refNum: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard
      .writeText(refNum)
      .then(() => {
        setCopiedId(refNum);
        toast.success(`Reference ${refNum} copied to clipboard!`, 'Copied');
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => {
        toast.info(`Reference: ${refNum}`);
      });
  };

  // Live KPI metrics derived from actual backend records
  const pendingCount = applications.filter((a) => a.status === 'Pending Review').length;
  const verificationCount = applications.filter((a) => a.status === 'Under Verification').length;
  const approvedCount = applications.filter((a) => a.status === 'Approved').length;
  const readyCount = applications.filter((a) => a.status === 'Ready for Claiming').length;
  const successfulCount = applications.filter((a) => a.status === 'Successful').length;
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length;
  const totalCount = applications.length;

  // Document type counts from live records
  const clearanceCount = applications.filter((a) => a.documentType === 'clearance').length;
  const indigencyCount = applications.filter((a) => a.documentType === 'indigency').length;
  const residencyCount = applications.filter((a) => a.documentType === 'residency').length;

  // Submitted today count
  const submittedTodayCount = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const fromApps = applications.filter((a) => {
      const ts = Date.parse(a.submissionDate);
      return !isNaN(ts) && ts >= startOfToday;
    }).length;
    return Math.max(fromApps, backendStats?.submittedToday ?? 0);
  }, [applications, backendStats]);

  // Compute real time-series Application Trends over the selected date range (7d, 14d, 30d)
  const trendDataPoints = useMemo(() => {
    const daysCount = trendRange === '7d' ? 7 : trendRange === '14d' ? 14 : 30;
    const now = new Date();

    // Map counts by YYYY-MM-DD from live applications array
    const appDateCounts: Record<string, number> = {};
    applications.forEach((app) => {
      const ts = Date.parse(app.submissionDate);
      if (!isNaN(ts)) {
        const d = new Date(ts);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        appDateCounts[key] = (appDateCounts[key] || 0) + 1;
      }
    });

    // Also merge backend dailyTrends if available
    if (backendStats?.dailyTrends) {
      backendStats.dailyTrends.forEach((pt) => {
        if (appDateCounts[pt.date] === undefined) {
          appDateCounts[pt.date] = pt.count;
        } else {
          appDateCounts[pt.date] = Math.max(appDateCounts[pt.date], pt.count);
        }
      });
    }

    const points: { dateKey: string; label: string; shortLabel: string; count: number }[] = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
      const shortLabel =
        daysCount <= 7
          ? d.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })
          : d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
      points.push({
        dateKey: key,
        label,
        shortLabel,
        count: appDateCounts[key] || 0
      });
    }
    return points;
  }, [applications, backendStats, trendRange]);

  const maxTrendCount = Math.max(4, ...trendDataPoints.map((p) => p.count));
  const totalInTrendPeriod = trendDataPoints.reduce((acc, p) => acc + p.count, 0);

  // Status Distribution Data (6 Workflow Statuses)
  const statusChartData = [
    {
      status: 'Pending Review',
      shortLabel: 'Pending Review',
      subtitle: 'Awaiting initial intake',
      count: pendingCount,
      color: '#b45309',
      barColor: '#d97706',
      bgTint: '#fef3c7',
      borderTint: '#f59e0b'
    },
    {
      status: 'Under Verification',
      shortLabel: 'Under Review',
      subtitle: 'Purok / Lupon check',
      count: verificationCount,
      color: '#3730a3',
      barColor: '#4f46e5',
      bgTint: '#e0e7ff',
      borderTint: '#6366f1'
    },
    {
      status: 'Approved',
      shortLabel: 'Approved',
      subtitle: 'Passed records check',
      count: approvedCount,
      color: '#166534',
      barColor: '#16a34a',
      bgTint: '#dcfce7',
      borderTint: '#22c55e'
    },
    {
      status: 'Ready for Claiming',
      shortLabel: 'Ready for Claim',
      subtitle: 'Ready at Window 2',
      count: readyCount,
      color: '#1e40af',
      barColor: '#2563eb',
      bgTint: '#dbeafe',
      borderTint: '#3b82f6'
    },
    {
      status: 'Successful',
      shortLabel: 'Successful',
      subtitle: 'Claimed & Completed',
      count: successfulCount,
      color: '#065f46',
      barColor: '#059669',
      bgTint: '#ecfdf5',
      borderTint: '#10b981'
    },
    {
      status: 'Rejected',
      shortLabel: 'Rejected',
      subtitle: 'Incomplete or issue',
      count: rejectedCount,
      color: '#991b1b',
      barColor: '#dc2626',
      bgTint: '#fee2e2',
      borderTint: '#ef4444'
    }
  ];

  const maxStatusBarValue = Math.max(5, ...statusChartData.map((d) => d.count));

  // Document Type Statistics Data
  const documentTypeStats = [
    {
      id: 'clearance' as DocumentType,
      title: 'Barangay Clearance',
      subtitle: 'Employment, ID & business permit clearance',
      count: clearanceCount,
      percentage: totalCount > 0 ? Math.round((clearanceCount / totalCount) * 100) : 0,
      color: '#1d4ed8',
      barBg: '#2563eb',
      tintBg: '#eff6ff',
      icon: <FileCheck className="w-5 h-5" style={{ color: '#2563eb' }} />
    },
    {
      id: 'indigency' as DocumentType,
      title: 'Certificate of Indigency',
      subtitle: 'Medical, educational, DSWD & PAO assistance',
      count: indigencyCount,
      percentage: totalCount > 0 ? Math.round((indigencyCount / totalCount) * 100) : 0,
      color: '#047857',
      barBg: '#059669',
      tintBg: '#ecfdf5',
      icon: <HandHeart className="w-5 h-5" style={{ color: '#059669' }} />
    },
    {
      id: 'residency' as DocumentType,
      title: 'Certificate of Residency',
      subtitle: 'Proof of barangay residence & length of stay',
      count: residencyCount,
      percentage: totalCount > 0 ? Math.round((residencyCount / totalCount) * 100) : 0,
      color: '#b45309',
      barBg: '#d97706',
      tintBg: '#fffbeb',
      icon: <House className="w-5 h-5" style={{ color: '#d97706' }} />
    }
  ];

  // Applications Requiring Attention (Pending Review, Under Verification, Approved awaiting release prep, Ready for Claiming)
  const attentionApplications = useMemo(() => {
    const priorityOrder: Record<string, number> = {
      'Pending Review': 1,
      'Under Verification': 2,
      'Approved': 3,
      'Ready for Claiming': 4
    };
    return applications
      .filter((app) =>
        ['Pending Review', 'Under Verification', 'Approved', 'Ready for Claiming'].includes(app.status)
      )
      .sort((a, b) => {
        const pA = priorityOrder[a.status] || 99;
        const pB = priorityOrder[b.status] || 99;
        if (pA !== pB) return pA - pB;
        return (Date.parse(b.submissionDate) || 0) - (Date.parse(a.submissionDate) || 0);
      });
  }, [applications]);

  // Navigate to filtered view when clicking KPI cards or chart bars
  const handleFilterStatusFromDashboard = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
    onTabChange?.('applications');
  };

  const handleFilterDocTypeFromDashboard = (docType: string) => {
    setSelectedDocType(docType);
    setSelectedStatus('all');
    setCurrentPage(1);
    onTabChange?.('applications');
  };

  // Filter & Sort applications for the table
  const filteredApps = useMemo(() => {
    return applications
      .filter((app) => {
        const applicantFullName = `${app.personalInfo.firstName} ${app.personalInfo.lastName}`.toLowerCase();
        const matchesSearch =
          applicantFullName.includes(searchTerm.toLowerCase()) ||
          app.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (app.controlNumber && app.controlNumber.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesDoc = selectedDocType === 'all' || app.documentType === selectedDocType;
        const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;

        let matchesDate = true;
        if (selectedDateRange !== 'all' && app.submissionDate) {
          const subTs = Date.parse(app.submissionDate);
          if (!isNaN(subTs)) {
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            if (selectedDateRange === 'today') {
              matchesDate = subTs >= startOfToday;
            } else if (selectedDateRange === 'last7days') {
              matchesDate = subTs >= startOfToday - 7 * 24 * 60 * 60 * 1000;
            } else if (selectedDateRange === 'last30days') {
              matchesDate = subTs >= startOfToday - 30 * 24 * 60 * 60 * 1000;
            }
          }
        }

        return matchesSearch && matchesDoc && matchesStatus && matchesDate;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') {
          const nameA = `${a.personalInfo.lastName} ${a.personalInfo.firstName}`.toLowerCase();
          const nameB = `${b.personalInfo.lastName} ${b.personalInfo.firstName}`.toLowerCase();
          return nameA.localeCompare(nameB);
        }
        const tsA = Date.parse(a.submissionDate) || 0;
        const tsB = Date.parse(b.submissionDate) || 0;
        return sortBy === 'oldest' ? tsA - tsB : tsB - tsA;
      });
  }, [applications, searchTerm, selectedDocType, selectedStatus, selectedDateRange, sortBy]);

  // Pagination calculations
  const totalFiltered = filteredApps.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFiltered);
  const paginatedApps = filteredApps.slice(startIndex, startIndex + itemsPerPage);

  const getDocTitle = (type: DocumentType) => {
    const titles: Record<DocumentType, string> = {
      clearance: 'Barangay Clearance',
      indigency: 'Certificate of Indigency',
      residency: 'Certificate of Residency'
    };
    return titles[type] || type;
  };

  // Request Confirmation Handlers
  const handleRequestApprove = (app: ApplicationRecord) => {
    setConfirmModal({
      isOpen: true,
      app,
      action: 'Approve',
      title: 'Approve Application',
      message: `Are you sure you want to approve the application for ${app.personalInfo.firstName} ${app.personalInfo.lastName} (${getDocTitle(app.documentType)})? This will generate an official control number and endorse the document for final signature.`,
      variant: 'success',
      confirmLabel: 'Confirm Approval',
      reason: '',
      actionError: undefined
    });
  };

  const handleRequestReject = (app: ApplicationRecord) => {
    setConfirmModal({
      isOpen: true,
      app,
      action: 'Reject',
      title: 'Reject Application',
      message: `You are about to reject the application for ${app.personalInfo.firstName} ${app.personalInfo.lastName}. Please provide a clear, constructive explanation so the resident understands what was missing or incorrect.`,
      variant: 'danger',
      confirmLabel: 'Confirm Rejection',
      reason: '',
      reasonError: undefined,
      actionError: undefined
    });
  };

  const handleRequestVerification = (app: ApplicationRecord) => {
    setConfirmModal({
      isOpen: true,
      app,
      action: 'Under Verification',
      title: 'Advance to Under Verification',
      message: `Move application ${app.referenceNumber} (${app.personalInfo.firstName} ${app.personalInfo.lastName}) to Under Verification for community records and Lupon validation?`,
      variant: 'primary',
      confirmLabel: 'Move to Verification',
      reason: '',
      actionError: undefined
    });
  };

  const handleRequestReady = (app: ApplicationRecord) => {
    setConfirmModal({
      isOpen: true,
      app,
      action: 'Ready for Claiming',
      title: 'Mark as Ready for Claiming',
      message: `Confirm that the document for ${app.personalInfo.firstName} ${app.personalInfo.lastName} has been printed, sealed, and is ready for pick-up at Window 2?`,
      variant: 'success',
      confirmLabel: 'Mark Ready for Claiming',
      reason: '',
      actionError: undefined
    });
  };

  const handleRequestClaim = (app: ApplicationRecord) => {
    setConfirmModal({
      isOpen: true,
      app,
      action: 'Successful',
      title: 'Confirm Document Claimed',
      message: `Confirm that ${app.personalInfo.firstName} ${app.personalInfo.lastName} has physically received and claimed their official document? The application status will be updated to "Successful".`,
      variant: 'success',
      confirmLabel: 'Confirm Claimed (Successful)',
      reason: '',
      actionError: undefined
    });
  };

  const handleConfirmActionExecute = async () => {
    const { app, action, reason } = confirmModal;
    if (!app) return;

    if (action === 'Reject') {
      const trimmedReason = reason.trim();
      if (!trimmedReason) {
        setConfirmModal((prev) => ({
          ...prev,
          reasonError: 'Please provide a reason for rejecting this application.'
        }));
        return;
      }
      if (trimmedReason.length < 5) {
        setConfirmModal((prev) => ({
          ...prev,
          reasonError: 'Please provide a more descriptive rejection reason (at least 5 characters).'
        }));
        return;
      }
      if (trimmedReason.length > 300) {
        setConfirmModal((prev) => ({
          ...prev,
          reasonError: 'Rejection reason cannot exceed 300 characters.'
        }));
        return;
      }
    }

    setConfirmModal((prev) => ({ ...prev, actionError: undefined }));
    setIsExecutingAction(true);

    try {
      if (action === 'Approve') {
        const prefix = app.documentType.substring(0, 3).toUpperCase();
        const ctrl = app.controlNumber || `${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        await onUpdateStatus(
          app.id,
          'Approved',
          ctrl,
          'Approved by Barangay Officer. Ready for final printing and signature.'
        );
        toast.success(`Application ${app.referenceNumber} approved successfully.`, 'Application Approved');
        setDetailModalApp((prev) =>
          prev && prev.id === app.id ? { ...prev, status: 'Approved', controlNumber: ctrl } : prev
        );
      } else if (action === 'Reject') {
        await onUpdateStatus(app.id, 'Rejected', undefined, undefined, reason.trim());
        toast.success(`Application ${app.referenceNumber} has been rejected.`, 'Application Rejected');
        setDetailModalApp((prev) =>
          prev && prev.id === app.id ? { ...prev, status: 'Rejected', rejectionReason: reason.trim() } : prev
        );
      } else if (action === 'Under Verification') {
        await onUpdateStatus(
          app.id,
          'Under Verification',
          undefined,
          'Document in queue for community records and Lupon clearance validation.'
        );
        toast.info(`Application ${app.referenceNumber} moved to Under Verification.`, 'Status Updated');
        setDetailModalApp((prev) =>
          prev && prev.id === app.id ? { ...prev, status: 'Under Verification' } : prev
        );
      } else if (action === 'Ready for Claiming') {
        const prefix = app.documentType.substring(0, 3).toUpperCase();
        const ctrl = app.controlNumber || `${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        await onUpdateStatus(
          app.id,
          'Ready for Claiming',
          ctrl,
          'Document signed and sealed. Ready for resident pick-up at Window 2.'
        );
        toast.success(`Application ${app.referenceNumber} is ready for pick-up!`, 'Ready for Claiming');
        setDetailModalApp((prev) =>
          prev && prev.id === app.id ? { ...prev, status: 'Ready for Claiming', controlNumber: ctrl } : prev
        );
      } else if (action === 'Successful') {
        await onUpdateStatus(
          app.id,
          'Successful',
          app.controlNumber,
          'Document received and claimed by applicant. Transaction successfully completed.'
        );
        toast.success(`Application ${app.referenceNumber} has been claimed successfully!`, 'Transaction Successful');
        setDetailModalApp((prev) =>
          prev && prev.id === app.id ? { ...prev, status: 'Successful' } : prev
        );
      }

      setConfirmModal((prev) => ({ ...prev, isOpen: false, actionError: undefined }));
      fetchDashboardStats();
    } catch (err: any) {
      setConfirmModal((prev) => ({
        ...prev,
        actionError: err.message || 'Operation failed. Please check your connection and try again.'
      }));
    } finally {
      setIsExecutingAction(false);
    }
  };

  // Current formatted reporting date
  const formattedCurrentDate = useMemo(() => {
    return new Date().toLocaleDateString('en-PH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // 6 Summary KPI Cards Configuration (Phase 3B)
  const kpiCards = [
    {
      id: 'total',
      label: 'Total Applications',
      value: totalCount,
      context: `+${submittedTodayCount} received today • ${successfulCount} claimed`,
      filterStatus: 'all',
      accentColor: '#0f172a',
      iconBg: '#f1f5f9',
      iconColor: '#0f172a',
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: 'pending',
      label: 'Pending Applications',
      value: pendingCount,
      context: 'Awaiting initial desk review',
      filterStatus: 'Pending Review',
      accentColor: '#d97706',
      iconBg: '#fef3c7',
      iconColor: '#b45309',
      icon: <Clock className="w-5 h-5" />
    },
    {
      id: 'verification',
      label: 'Under Review',
      value: verificationCount,
      context: 'In Purok / Lupon verification',
      filterStatus: 'Under Verification',
      accentColor: '#4f46e5',
      iconBg: '#e0e7ff',
      iconColor: '#3730a3',
      icon: <ShieldCheck className="w-5 h-5" />
    },
    {
      id: 'approved',
      label: 'Approved Applications',
      value: approvedCount,
      context: 'Passed check • Queued for print',
      filterStatus: 'Approved',
      accentColor: '#16a34a',
      iconBg: '#dcfce7',
      iconColor: '#166534',
      icon: <CheckCircle2 className="w-5 h-5" />
    },
    {
      id: 'ready',
      label: 'Ready for Claim',
      value: readyCount,
      context: 'Signed & sealed at Window 2',
      filterStatus: 'Ready for Claiming',
      accentColor: '#2563eb',
      iconBg: '#dbeafe',
      iconColor: '#1e40af',
      icon: <Building2 className="w-5 h-5" />
    },
    {
      id: 'rejected',
      label: 'Rejected Applications',
      value: rejectedCount,
      context: 'Returned due to incomplete info',
      filterStatus: 'Rejected',
      accentColor: '#dc2626',
      iconBg: '#fee2e2',
      iconColor: '#991b1b',
      icon: <XCircle className="w-5 h-5" />
    }
  ];

  // Shared Applications Table & Filter Bar Renderer (used in Recent Applications on Dashboard & full Applications view)
  const renderApplicationsTableSection = (sectionTitle?: string, sectionSubtitle?: string) => (
    <section aria-label={sectionTitle || 'Applications Registry'}>
      {sectionTitle && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1rem'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {sectionTitle}
            </h2>
            {sectionSubtitle && (
              <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                {sectionSubtitle}
              </p>
            )}
          </div>
          {activeTab === 'dashboard' && (
            <button
              type="button"
              onClick={() => onTabChange?.('applications')}
              style={{
                padding: '0.45rem 0.9rem',
                backgroundColor: '#ffffff',
                color: '#1d4ed8',
                border: '1px solid #cbd5e1',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span>Open Full Applications View</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          padding: '1rem 1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          marginBottom: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.875rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Search Input */}
        <div style={{ flex: '1 1 260px', position: 'relative' }}>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search reference no., resident name, or control no..."
            aria-label="Search applications by reference number, resident name, or control number"
            style={{
              width: '100%',
              padding: '0.575rem 0.875rem 0.575rem 2.25rem',
              borderRadius: '0.5rem',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.875rem',
              color: '#0f172a',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            className="focus-ring"
          />
          <Search
            className="w-4 h-4"
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b'
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', alignItems: 'center' }}>
          {/* Document Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <label htmlFor="filter-doc-type" style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
              Document:
            </label>
            <select
              id="filter-doc-type"
              value={selectedDocType}
              onChange={(e) => {
                setSelectedDocType(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.825rem',
                color: '#1e293b',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Documents (3)</option>
              <option value="clearance">Barangay Clearance</option>
              <option value="indigency">Certificate of Indigency</option>
              <option value="residency">Certificate of Residency</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <label htmlFor="filter-status" style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
              Status:
            </label>
            <select
              id="filter-status"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.825rem',
                color: '#1e293b',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Under Verification">Under Verification</option>
              <option value="Approved">Approved</option>
              <option value="Ready for Claiming">Ready for Claiming</option>
              <option value="Successful">Successful (Claimed)</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Date Submitted Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <label htmlFor="filter-date" style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
              Period:
            </label>
            <select
              id="filter-date"
              value={selectedDateRange}
              onChange={(e) => {
                setSelectedDateRange(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.825rem',
                color: '#1e293b',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Dates</option>
              <option value="today">Submitted Today</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
            </select>
          </div>

          {/* Sort By Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <label htmlFor="sort-by" style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
              Sort:
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as 'newest' | 'oldest' | 'name_asc');
                setCurrentPage(1);
              }}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.825rem',
                color: '#1e293b',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Resident Name (A–Z)</option>
            </select>
          </div>

          {(searchTerm ||
            selectedDocType !== 'all' ||
            selectedStatus !== 'all' ||
            selectedDateRange !== 'all' ||
            sortBy !== 'newest') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedDocType('all');
                setSelectedStatus('all');
                setSelectedDateRange('all');
                setSortBy('newest');
                setCurrentPage(1);
              }}
              style={{
                padding: '0.5rem 0.85rem',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Error Alert Banner with Retry */}
      {loadError && (
        <div
          role="alert"
          style={{
            marginBottom: '1rem',
            padding: '1rem 1.25rem',
            backgroundColor: '#fef2f2',
            border: '1.5px solid #fecaca',
            borderRadius: '0.75rem',
            color: '#991b1b',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', fontWeight: 600 }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#dc2626' }} />
            <span>{loadError}</span>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={() => onRefresh()}
              style={{
                padding: '0.45rem 1rem',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Retry Loading Applications
            </button>
          )}
        </div>
      )}

      {/* Loading Skeleton or Applications Table */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            overflowX: 'auto'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  color: '#475569',
                  letterSpacing: '0.5px',
                  fontWeight: 700
                }}
              >
                <th style={{ padding: '0.875rem 1.15rem' }}>Reference Number</th>
                <th style={{ padding: '0.875rem 1.15rem' }}>Resident Name</th>
                <th style={{ padding: '0.875rem 1.15rem' }}>Document Type</th>
                <th style={{ padding: '0.875rem 1.15rem' }}>Date Submitted</th>
                <th style={{ padding: '0.875rem 1.15rem' }}>Application Status</th>
                <th style={{ padding: '0.875rem 1.15rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedApps.length > 0 ? (
                paginatedApps.map((app, rowIdx) => (
                  <tr
                    key={app.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: rowIdx % 2 === 1 ? '#fcfdff' : '#ffffff',
                      transition: 'background-color 0.1s ease',
                      fontSize: '0.875rem'
                    }}
                    className="table-row-hover"
                  >
                    {/* Reference Number */}
                    <td style={{ padding: '0.9rem 1.15rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 700, color: '#1e3a8a', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {app.referenceNumber}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyRef(app.referenceNumber);
                          }}
                          className="interactive-btn"
                          style={{
                            padding: '2px 5px',
                            backgroundColor: copiedId === app.referenceNumber ? '#16a34a' : '#f1f5f9',
                            border: `1px solid ${copiedId === app.referenceNumber ? '#16a34a' : '#cbd5e1'}`,
                            borderRadius: '0.25rem',
                            color: copiedId === app.referenceNumber ? '#ffffff' : '#64748b',
                            fontSize: '0.7rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                            cursor: 'pointer'
                          }}
                          title="Copy reference number"
                          aria-label={`Copy reference ${app.referenceNumber}`}
                        >
                          {copiedId === app.referenceNumber ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      {app.controlNumber && (
                        <div style={{ fontSize: '0.72rem', color: '#15803d', fontFamily: 'monospace', marginTop: '2px' }}>
                          Ctrl: {app.controlNumber}
                        </div>
                      )}
                    </td>

                    {/* Resident Name */}
                    <td style={{ padding: '0.9rem 1.15rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>
                        {app.personalInfo.firstName} {app.personalInfo.lastName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {app.personalInfo.purokSitio}
                      </div>
                    </td>

                    {/* Document Type */}
                    <td style={{ padding: '0.9rem 1.15rem' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>
                        {getDocTitle(app.documentType)}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#64748b',
                          maxWidth: '220px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={app.details.purpose}
                      >
                        {app.details.purpose}
                      </div>
                    </td>

                    {/* Date Submitted */}
                    <td style={{ padding: '0.9rem 1.15rem', color: '#334155', fontSize: '0.82rem' }}>
                      <div style={{ fontWeight: 500, color: '#1e293b' }}>{app.submissionDate}</div>
                      {app.lastUpdatedDate && app.lastUpdatedDate !== app.submissionDate && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                          Updated: {app.lastUpdatedDate}
                        </div>
                      )}
                    </td>

                    {/* Application Status */}
                    <td style={{ padding: '0.9rem 1.15rem' }}>
                      <StatusBadge status={app.status} size="sm" />
                    </td>

                    {/* Action */}
                    <td style={{ padding: '0.9rem 1.15rem', textAlign: 'right' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          justifyContent: 'flex-end',
                          flexWrap: 'wrap'
                        }}
                      >
                        {app.status === 'Pending Review' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRequestVerification(app);
                            }}
                            className="interactive-btn"
                            title="Move to Under Verification"
                            style={{
                              padding: '0.38rem 0.65rem',
                              backgroundColor: '#e0e7ff',
                              color: '#3730a3',
                              border: '1px solid #c7d2fe',
                              borderRadius: '0.375rem',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Verify
                          </button>
                        )}
                        {(app.status === 'Pending Review' || app.status === 'Under Verification') && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRequestApprove(app);
                              }}
                              className="interactive-btn"
                              title="Approve Application"
                              style={{
                                padding: '0.38rem 0.65rem',
                                backgroundColor: '#dcfce7',
                                color: '#166534',
                                border: '1px solid #bbf7d0',
                                borderRadius: '0.375rem',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRequestReject(app);
                              }}
                              className="interactive-btn"
                              title="Reject Application"
                              style={{
                                padding: '0.38rem 0.65rem',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                borderRadius: '0.375rem',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {app.status === 'Approved' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRequestReady(app);
                            }}
                            className="interactive-btn"
                            title="Mark as Ready for Claiming at Window 2"
                            style={{
                              padding: '0.38rem 0.65rem',
                              backgroundColor: '#dbeafe',
                              color: '#1e40af',
                              border: '1px solid #bfdbfe',
                              borderRadius: '0.375rem',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Mark Ready
                          </button>
                        )}
                        {app.status === 'Ready for Claiming' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRequestClaim(app);
                            }}
                            className="interactive-btn"
                            title="Mark as Claimed by Resident"
                            style={{
                              padding: '0.38rem 0.7rem',
                              backgroundColor: '#ecfdf5',
                              color: '#065f46',
                              border: '1px solid #a7f3d0',
                              borderRadius: '0.375rem',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Claimed</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDetailModalApp(app)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            borderRadius: '0.375rem',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '3.25rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ maxWidth: '380px', margin: '0 auto' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: '#f1f5f9',
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 0.85rem auto'
                        }}
                      >
                        <Search className="w-6 h-6" />
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                        No Application Records Found
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.15rem 0', lineHeight: 1.5 }}>
                        {applications.length === 0
                          ? 'There are currently no barangay document applications recorded in the database.'
                          : 'No records match your active search query or filter criteria. Try resetting your filters.'}
                      </p>
                      {(searchTerm ||
                        selectedDocType !== 'all' ||
                        selectedStatus !== 'all' ||
                        selectedDateRange !== 'all') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedDocType('all');
                            setSelectedStatus('all');
                            setSelectedDateRange('all');
                            setSortBy('newest');
                          }}
                          className="interactive-btn"
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            borderRadius: '0.375rem',
                            fontSize: '0.825rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Reset All Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Footer Bar */}
          {totalFiltered > 0 && (
            <div
              style={{
                padding: '0.85rem 1.25rem',
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '1rem',
                  fontSize: '0.82rem',
                  color: '#475569'
                }}
              >
                <span>
                  Showing <strong style={{ color: '#0f172a' }}>{startIndex + 1}</strong> to{' '}
                  <strong style={{ color: '#0f172a' }}>{endIndex}</strong> of{' '}
                  <strong style={{ color: '#0f172a' }}>{totalFiltered}</strong> applications
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <label htmlFor="rows-per-page" style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                    Rows per page:
                  </label>
                  <select
                    id="rows-per-page"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: '0.28rem 0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '0.8rem',
                      color: '#1e293b',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  type="button"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  style={{
                    padding: '0.38rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #cbd5e1',
                    backgroundColor: safeCurrentPage <= 1 ? '#f1f5f9' : '#ffffff',
                    color: safeCurrentPage <= 1 ? '#94a3b8' : '#1e293b',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: safeCurrentPage <= 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  &larr; Prev
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => {
                  const isActive = pageNum === safeCurrentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      aria-label={`Page ${pageNum}`}
                      aria-current={isActive ? 'page' : undefined}
                      style={{
                        minWidth: '32px',
                        height: '32px',
                        padding: '0 0.5rem',
                        borderRadius: '0.375rem',
                        border: isActive ? '1px solid #2563eb' : '1px solid #cbd5e1',
                        backgroundColor: isActive ? '#2563eb' : '#ffffff',
                        color: isActive ? '#ffffff' : '#334155',
                        fontSize: '0.8rem',
                        fontWeight: isActive ? 700 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  style={{
                    padding: '0.38rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #cbd5e1',
                    backgroundColor: safeCurrentPage >= totalPages ? '#f1f5f9' : '#ffffff',
                    color: safeCurrentPage >= totalPages ? '#94a3b8' : '#1e293b',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: safeCurrentPage >= totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );

  return (
    <div
      style={{
        backgroundColor: '#f1f5f9',
        minHeight: 'calc(100vh - 68px)',
        padding: '1.75rem 1.75rem 4rem 1.75rem',
        width: '100%',
        boxSizing: 'border-box'
      }}
      className="admin-dashboard-container"
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* ═══════════════════════════════════════════════════════════════════════
            A. PAGE HEADER (Phase 3A)
        ═══════════════════════════════════════════════════════════════════════ */}
        <header
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid #cbd5e1'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                {activeTab === 'dashboard' ? 'Admin Dashboard' : 'Applications Management'}
              </h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  border: '1px solid #bfdbfe'
                }}
              >
                Barangay San Isidro
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0.3rem 0 0 0' }}>
              Monitor and manage barangay document applications.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            {/* Reporting Date Badge */}
            <div
              style={{
                padding: '0.5rem 0.875rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                color: '#334155',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <Clock className="w-4 h-4" style={{ color: '#2563eb' }} />
              <span>{formattedCurrentDate}</span>
            </div>

            {/* Refresh Action Button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing || isLoading}
              className="interactive-btn"
              style={{
                padding: '0.5rem 0.95rem',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1.5px solid #cbd5e1',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: isRefreshing || isLoading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}
              title="Refresh dashboard statistics and application records"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none',
                  color: '#2563eb'
                }}
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <>
            {/* ═══════════════════════════════════════════════════════════════════
                B. SUMMARY KPI CARDS (Phase 3B)
            ═══════════════════════════════════════════════════════════════════ */}
            <section aria-label="Summary Key Performance Indicators" style={{ marginBottom: '1.75rem' }}>
              {isLoading && applications.length === 0 ? (
                <CardSkeleton count={3} />
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(205px, 1fr))',
                    gap: '1rem'
                  }}
                >
                  {kpiCards.map((card) => {
                    const isSelected = selectedStatus === card.filterStatus && card.filterStatus !== 'all';
                    const pct =
                      card.id !== 'total' && totalCount > 0
                        ? `${Math.round((card.value / totalCount) * 100)}% of total`
                        : null;

                    return (
                      <div
                        key={card.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleFilterStatusFromDashboard(card.filterStatus)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleFilterStatusFromDashboard(card.filterStatus);
                          }
                        }}
                        aria-label={`${card.label}: ${card.value}. ${card.context}. Click to view matching applications.`}
                        className="kpi-summary-card"
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: '0.75rem',
                          padding: '1.25rem',
                          border: isSelected ? `2px solid ${card.accentColor}` : '1px solid #e2e8f0',
                          borderTop: `4px solid ${card.accentColor}`,
                          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              gap: '0.5rem',
                              marginBottom: '0.65rem'
                            }}
                          >
                            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155', lineHeight: 1.3 }}>
                              {card.label}
                            </span>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '0.5rem',
                                backgroundColor: card.iconBg,
                                color: card.iconColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              {card.icon}
                            </div>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'baseline',
                              gap: '0.5rem',
                              marginBottom: '0.35rem'
                            }}
                          >
                            <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                              {card.value}
                            </span>
                            {pct && (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  color: '#64748b'
                                }}
                              >
                                ({pct})
                              </span>
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: '0.5rem',
                            borderTop: '1px solid #f1f5f9',
                            marginTop: '0.25rem'
                          }}
                        >
                          <span>{card.context}</span>
                          <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.72rem' }}>&rarr;</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                C. APPLICATION ANALYTICS (Phase 3C)
                1. Application Status Distribution + 2. Document Type Statistics
                3. Application Trends Over Time (with 7d / 14d / 30d filter)
            ═══════════════════════════════════════════════════════════════════ */}
            <section aria-label="Application Analytics" style={{ marginBottom: '1.75rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '1.25rem'
                }}
              >
                {/* C1. Application Status Distribution Bar Chart */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.875rem',
                    border: '1px solid #e2e8f0',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                    gridColumn: 'span 2'
                  }}
                  className="dashboard-bar-chart-card"
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      marginBottom: '1.25rem'
                    }}
                  >
                    <div>
                      <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Application Status Distribution
                      </h2>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                        Applications grouped by current processing stage ({totalCount} total records). Click any bar to filter.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleFilterStatusFromDashboard('all')}
                      style={{
                        padding: '0.4rem 0.85rem',
                        backgroundColor: '#f8fafc',
                        color: '#1e293b',
                        border: '1px solid #cbd5e1',
                        borderRadius: '0.45rem',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      View All Statuses
                    </button>
                  </div>

                  {/* Accessible Vertical Bar Chart */}
                  <div
                    role="img"
                    aria-label={`Bar chart of application status distribution: ${statusChartData
                      .map((s) => `${s.shortLabel} ${s.count}`)
                      .join(', ')}`}
                    style={{
                      position: 'relative',
                      height: '230px',
                      padding: '1.5rem 0.75rem 0.5rem 2.25rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '0.625rem',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-around',
                      gap: '0.75rem'
                    }}
                  >
                    {/* Horizontal Reference Grid Lines */}
                    {[1, 0.75, 0.5, 0.25, 0].map((ratio) => {
                      const tickVal = Math.round(maxStatusBarValue * ratio);
                      return (
                        <div
                          key={ratio}
                          style={{
                            position: 'absolute',
                            left: '2.25rem',
                            right: '0.75rem',
                            bottom: `calc(2.5rem + ${ratio * 155}px)`,
                            borderBottom: ratio === 0 ? '1.5px solid #cbd5e1' : '1px dashed #e2e8f0',
                            pointerEvents: 'none'
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              left: '-1.85rem',
                              top: '-0.55rem',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              color: '#64748b'
                            }}
                          >
                            {tickVal}
                          </span>
                        </div>
                      );
                    })}

                    {/* Bars with Explicit Labels & Values (Non-Color Dependent) */}
                    {statusChartData.map((item) => {
                      const heightPx =
                        maxStatusBarValue > 0 ? Math.max(6, Math.round((item.count / maxStatusBarValue) * 155)) : 6;
                      const percentage = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;

                      return (
                        <div
                          key={item.status}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleFilterStatusFromDashboard(item.status)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleFilterStatusFromDashboard(item.status);
                            }
                          }}
                          title={`${item.shortLabel}: ${item.count} applications (${percentage}%) — Click to filter`}
                          style={{
                            flex: '1 1 0',
                            maxWidth: '105px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            zIndex: 2,
                            cursor: 'pointer'
                          }}
                        >
                          {/* Value + Percentage Label Above Bar */}
                          <div
                            style={{
                              marginBottom: '0.35rem',
                              padding: '0.12rem 0.45rem',
                              borderRadius: '9999px',
                              backgroundColor: item.bgTint,
                              border: `1px solid ${item.borderTint}`,
                              color: item.color,
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              lineHeight: 1.2,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {item.count}
                          </div>

                          {/* Bar Column */}
                          <div
                            style={{
                              width: '100%',
                              maxWidth: '48px',
                              height: `${heightPx}px`,
                              backgroundColor: item.barColor,
                              borderRadius: '0.375rem 0.375rem 0 0',
                              transition: 'height 0.4s ease, opacity 0.15s ease'
                            }}
                            className="chart-bar-column"
                          />

                          {/* X-Axis Status Label */}
                          <div
                            style={{
                              marginTop: '0.5rem',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: '#1e293b',
                              textAlign: 'center',
                              lineHeight: 1.2,
                              minHeight: '2rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {item.shortLabel}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* C2. Document Type Statistics Card */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.875rem',
                    border: '1px solid #e2e8f0',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Document Type Statistics
                      </h2>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                        Request volume by official barangay certificate category.
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {documentTypeStats.map((doc) => (
                        <div
                          key={doc.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleFilterDocTypeFromDashboard(doc.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleFilterDocTypeFromDashboard(doc.id);
                            }
                          }}
                          style={{
                            padding: '0.9rem 1rem',
                            borderRadius: '0.625rem',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc',
                            cursor: 'pointer',
                            transition: 'border-color 0.15s ease'
                          }}
                          title={`Click to view ${doc.title} applications`}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.75rem',
                              marginBottom: '0.5rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '0.45rem',
                                  backgroundColor: doc.tintBg,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                              >
                                {doc.icon}
                              </div>
                              <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                                  {doc.title}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{doc.subtitle}</div>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                                {doc.count}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.25rem' }}>
                                ({doc.percentage}%)
                              </span>
                            </div>
                          </div>

                          {/* Horizontal Share Bar */}
                          <div
                            style={{
                              width: '100%',
                              height: '7px',
                              backgroundColor: '#e2e8f0',
                              borderRadius: '9999px',
                              overflow: 'hidden'
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.max(doc.count > 0 ? 6 : 0, doc.percentage)}%`,
                                height: '100%',
                                backgroundColor: doc.barBg,
                                borderRadius: '9999px',
                                transition: 'width 0.4s ease'
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: '1rem',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid #f1f5f9',
                      fontSize: '0.75rem',
                      color: '#64748b',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>Total Registered Services: <strong>3 Categories</strong></span>
                    <span>Total Requests: <strong>{totalCount}</strong></span>
                  </div>
                </div>
              </div>

              {/* C3. Application Trends Over Time Card (with 7d / 14d / 30d Date-Range Filter) */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '0.875rem',
                  border: '1px solid #e2e8f0',
                  padding: '1.35rem 1.5rem',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}
                >
                  <div>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Application Submission Trends
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                      Daily application intake volume ({totalInTrendPeriod} applications received in selected period)
                    </p>
                  </div>

                  {/* Date-Range Filter Pills */}
                  <div
                    role="group"
                    aria-label="Filter application trends date range"
                    style={{ display: 'inline-flex', gap: '0.35rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '0.5rem' }}
                  >
                    {[
                      { id: '7d', label: 'Last 7 Days' },
                      { id: '14d', label: 'Last 14 Days' },
                      { id: '30d', label: 'Last 30 Days' }
                    ].map((rangeOpt) => {
                      const active = trendRange === rangeOpt.id;
                      return (
                        <button
                          key={rangeOpt.id}
                          type="button"
                          onClick={() => setTrendRange(rangeOpt.id as '7d' | '14d' | '30d')}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '0.375rem',
                            border: 'none',
                            backgroundColor: active ? '#ffffff' : 'transparent',
                            color: active ? '#1e40af' : '#475569',
                            fontSize: '0.78rem',
                            fontWeight: active ? 700 : 600,
                            cursor: 'pointer',
                            boxShadow: active ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                          }}
                        >
                          {rangeOpt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time-Series Bar Chart */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.625rem',
                    border: '1px solid #e2e8f0',
                    padding: '1.25rem 1rem 0.75rem 1rem',
                    overflowX: 'auto'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      gap: trendRange === '30d' ? '0.25rem' : '0.5rem',
                      height: '130px',
                      minWidth: trendRange === '30d' ? '620px' : '100%'
                    }}
                  >
                    {trendDataPoints.map((pt) => {
                      const barHeight = Math.max(pt.count > 0 ? 18 : 4, Math.round((pt.count / maxTrendCount) * 95));
                      return (
                        <div
                          key={pt.dateKey}
                          title={`${pt.shortLabel}: ${pt.count} application(s)`}
                          style={{
                            flex: '1 1 0',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            height: '100%'
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: pt.count > 0 ? 700 : 500,
                              color: pt.count > 0 ? '#1e40af' : '#94a3b8',
                              marginBottom: '0.25rem'
                            }}
                          >
                            {pt.count}
                          </span>
                          <div
                            style={{
                              width: '100%',
                              maxWidth: trendRange === '7d' ? '44px' : trendRange === '14d' ? '28px' : '16px',
                              height: `${barHeight}px`,
                              backgroundColor: pt.count > 0 ? '#2563eb' : '#cbd5e1',
                              borderRadius: '0.25rem 0.25rem 0 0',
                              transition: 'height 0.3s ease'
                            }}
                          />
                          <span
                            style={{
                              marginTop: '0.4rem',
                              fontSize: trendRange === '30d' ? '0.62rem' : '0.7rem',
                              color: '#475569',
                              fontWeight: 600,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {pt.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                E & F. APPLICATIONS REQUIRING ATTENTION + QUICK ACTIONS (Phase 3E & 3F)
            ═══════════════════════════════════════════════════════════════════ */}
            <section
              aria-label="Applications Requiring Attention and Quick Actions"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.25rem',
                marginBottom: '1.75rem'
              }}
            >
              {/* E. Applications Requiring Attention */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '0.875rem',
                  border: '1px solid #e2e8f0',
                  padding: '1.35rem 1.5rem',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  gridColumn: 'span 2'
                }}
                className="dashboard-attention-card"
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    marginBottom: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Applications Requiring Staff Attention
                      </h2>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.55rem',
                          borderRadius: '9999px',
                          backgroundColor: attentionApplications.length > 0 ? '#fef3c7' : '#dcfce7',
                          color: attentionApplications.length > 0 ? '#b45309' : '#166534',
                          border: `1px solid ${attentionApplications.length > 0 ? '#fde68a' : '#bbf7d0'}`
                        }}
                      >
                        {attentionApplications.length} active
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                      Priority queue of pending reviews, community verifications, and certificates awaiting release.
                    </p>
                  </div>

                  {attentionApplications.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleFilterStatusFromDashboard('Pending Review')}
                      style={{
                        padding: '0.4rem 0.85rem',
                        backgroundColor: '#fffbeb',
                        color: '#b45309',
                        border: '1px solid #fde68a',
                        borderRadius: '0.45rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Filter Pending ({pendingCount})
                    </button>
                  )}
                </div>

                {attentionApplications.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {attentionApplications.slice(0, 4).map((app) => {
                      const actionPrompt =
                        app.status === 'Pending Review'
                          ? 'Needs Initial Intake Review'
                          : app.status === 'Under Verification'
                          ? 'Awaiting Purok / Lupon Verification'
                          : app.status === 'Approved'
                          ? 'Approved — Prepare & Mark Ready for Claiming'
                          : 'Ready at Window 2 — Awaiting Resident Claim';

                      return (
                        <div
                          key={app.id}
                          style={{
                            padding: '0.85rem 1rem',
                            borderRadius: '0.625rem',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc',
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e3a8a', fontSize: '0.825rem' }}>
                                {app.referenceNumber}
                              </span>
                              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                                &bull; {app.personalInfo.firstName} {app.personalInfo.lastName}
                              </span>
                              <StatusBadge status={app.status} size="sm" />
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                              <strong>{getDocTitle(app.documentType)}</strong> — {actionPrompt} (Submitted {app.submissionDate})
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <button
                              type="button"
                              onClick={() => setDetailModalApp(app)}
                              className="interactive-btn"
                              style={{
                                padding: '0.42rem 0.85rem',
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Review &amp; Process</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '2rem 1.25rem',
                      textAlign: 'center',
                      backgroundColor: '#f8fafc',
                      borderRadius: '0.625rem',
                      border: '1px dashed #cbd5e1'
                    }}
                  >
                    <CheckCircle2 className="w-8 h-8" style={{ color: '#16a34a', margin: '0 auto 0.5rem auto' }} />
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                      All Applications Are Up to Date
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                      There are currently no pending or unverified requests requiring immediate staff intervention.
                    </p>
                  </div>
                )}
              </div>

              {/* F. Quick Actions Card */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '0.875rem',
                  border: '1px solid #e2e8f0',
                  padding: '1.35rem 1.5rem',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                    Quick Administrative Actions
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem 0' }}>
                    Direct shortcuts to common document processing queues.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={() => handleFilterStatusFromDashboard('Pending Review')}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.9rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #fde68a',
                        backgroundColor: '#fffbeb',
                        color: '#92400e',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock className="w-4 h-4" style={{ color: '#d97706' }} />
                        <span>Review Pending Applications</span>
                      </span>
                      <span style={{ fontWeight: 800 }}>{pendingCount} &rarr;</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFilterStatusFromDashboard('Under Verification')}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.9rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #c7d2fe',
                        backgroundColor: '#eef2ff',
                        color: '#3730a3',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldCheck className="w-4 h-4" style={{ color: '#4f46e5' }} />
                        <span>Verify In-Progress Requests</span>
                      </span>
                      <span style={{ fontWeight: 800 }}>{verificationCount} &rarr;</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFilterStatusFromDashboard('Ready for Claiming')}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.9rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #bfdbfe',
                        backgroundColor: '#eff6ff',
                        color: '#1e40af',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Building2 className="w-4 h-4" style={{ color: '#2563eb' }} />
                        <span>Release Ready Documents (Window 2)</span>
                      </span>
                      <span style={{ fontWeight: 800 }}>{readyCount} &rarr;</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFilterStatusFromDashboard('all')}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.9rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f8fafc',
                        color: '#0f172a',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText className="w-4 h-4" style={{ color: '#334155' }} />
                        <span>View All Applications Registry</span>
                      </span>
                      <span style={{ fontWeight: 800 }}>{totalCount} &rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'applications' &&
          renderApplicationsTableSection(
            undefined,
            undefined
          )}

        {/* APPLICATION DETAIL MODAL */}
        {detailModalApp && (
          <div
            className="modal-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '1rem'
            }}
          >
            <div
              className="modal-content"
              role="dialog"
              aria-modal="true"
              aria-labelledby="detail-modal-title"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '0.875rem',
                maxWidth: '780px',
                width: '100%',
                maxHeight: '92vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#f8fafc'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span id="detail-modal-title" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      {getDocTitle(detailModalApp.documentType)}
                    </span>
                    <StatusBadge status={detailModalApp.status} size="sm" />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                    Ref: {detailModalApp.referenceNumber} &bull; Submitted: {detailModalApp.submissionDate}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDetailModalApp(null)}
                  aria-label="Close application details modal"
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.25rem' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Applicant Profile */}
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.625rem' }}>
                    Applicant Identification
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Full Name</span>
                      <strong style={{ color: '#0f172a' }}>
                        {detailModalApp.personalInfo.firstName} {detailModalApp.personalInfo.middleName}{' '}
                        {detailModalApp.personalInfo.lastName} {detailModalApp.personalInfo.suffix}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Date of Birth</span>
                      <strong style={{ color: '#0f172a' }}>{detailModalApp.personalInfo.dateOfBirth}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Civil Status</span>
                      <strong style={{ color: '#0f172a' }}>{detailModalApp.personalInfo.civilStatus}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Mobile Number</span>
                      <strong style={{ color: '#0f172a' }}>{detailModalApp.personalInfo.contactNumber}</strong>
                    </div>
                  </div>
                </div>

                {/* Residential Address */}
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Barangay Residential Address
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e293b' }}>
                    {[
                      detailModalApp.personalInfo.houseStreet,
                      detailModalApp.personalInfo.purokSitio,
                      detailModalApp.personalInfo.barangay,
                      detailModalApp.personalInfo.cityMunicipality,
                      detailModalApp.personalInfo.province
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>

                {/* Purpose & Specific Fields */}
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.625rem' }}>
                    Document Purpose &amp; Specifics
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Stated Purpose</span>
                      <strong style={{ color: '#0f172a' }}>
                        {detailModalApp.details.purpose === 'Other'
                          ? detailModalApp.details.otherPurpose
                          : detailModalApp.details.purpose}
                      </strong>
                    </div>
                    {detailModalApp.details.assistanceType && (
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Assistance Type</span>
                        <strong style={{ color: '#0f172a' }}>{detailModalApp.details.assistanceType}</strong>
                      </div>
                    )}
                    {detailModalApp.details.lengthOfResidency && (
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Residency Length</span>
                        <strong style={{ color: '#0f172a' }}>{detailModalApp.details.lengthOfResidency}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rejection / Remarks Warning if any */}
                {detailModalApp.rejectionReason && (
                  <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '0.5rem', color: '#991b1b', fontSize: '0.85rem' }}>
                    <strong>Rejection Reason Recorded:</strong> {detailModalApp.rejectionReason}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderTop: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                {(detailModalApp.status === 'Approved' ||
                  detailModalApp.status === 'Ready for Claiming' ||
                  detailModalApp.status === 'Successful') &&
                  onViewPrintCertificate && (
                    <button
                      type="button"
                      onClick={() => {
                        onViewPrintCertificate(detailModalApp);
                        setDetailModalApp(null);
                      }}
                      style={{
                        padding: '0.55rem 1.1rem',
                        backgroundColor: '#0f766e',
                        color: '#ffffff',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Printer className="w-4 h-4" />
                      <span>View / Print Certificate</span>
                    </button>
                  )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginLeft: 'auto', alignItems: 'center' }}>
                  {detailModalApp.status === 'Successful' && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.4rem 0.85rem',
                        backgroundColor: '#ecfdf5',
                        borderRadius: '0.375rem',
                        border: '1px solid #a7f3d0',
                        color: '#065f46',
                        fontSize: '0.825rem',
                        fontWeight: 700
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Document Claimed &amp; Completed</span>
                    </div>
                  )}

                  {detailModalApp.status === 'Pending Review' && (
                    <button
                      type="button"
                      onClick={() => handleRequestVerification(detailModalApp)}
                      className="interactive-btn"
                      style={{
                        padding: '0.55rem 1rem',
                        backgroundColor: '#3730a3',
                        color: '#ffffff',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Start Verification
                    </button>
                  )}

                  {detailModalApp.status !== 'Approved' &&
                    detailModalApp.status !== 'Ready for Claiming' &&
                    detailModalApp.status !== 'Successful' && (
                      <button
                        type="button"
                        onClick={() => handleRequestApprove(detailModalApp)}
                        className="interactive-btn"
                        style={{
                          padding: '0.55rem 1.1rem',
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          borderRadius: '0.5rem',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Application</span>
                      </button>
                    )}

                  {detailModalApp.status === 'Approved' && (
                    <button
                      type="button"
                      onClick={() => handleRequestReady(detailModalApp)}
                      className="interactive-btn"
                      style={{
                        padding: '0.55rem 1.1rem',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Mark as Ready for Claiming
                    </button>
                  )}

                  {detailModalApp.status === 'Ready for Claiming' && (
                    <button
                      type="button"
                      onClick={() => handleRequestClaim(detailModalApp)}
                      className="interactive-btn"
                      style={{
                        padding: '0.55rem 1.15rem',
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Claimed (Successful)</span>
                    </button>
                  )}

                  {detailModalApp.status !== 'Rejected' && detailModalApp.status !== 'Successful' && (
                    <button
                      type="button"
                      onClick={() => handleRequestReject(detailModalApp)}
                      className="interactive-btn"
                      style={{
                        padding: '0.55rem 1rem',
                        backgroundColor: '#ffffff',
                        color: '#dc2626',
                        borderRadius: '0.5rem',
                        border: '1.5px solid #fecaca',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Reject Application
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          variant={confirmModal.variant}
          isLoading={isExecutingAction}
          onConfirm={handleConfirmActionExecute}
          onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false, actionError: undefined }))}
          requiresReason={confirmModal.action === 'Reject'}
          reasonValue={confirmModal.reason}
          reasonError={confirmModal.reasonError}
          actionError={confirmModal.actionError}
          onReasonChange={(val) =>
            setConfirmModal((prev) => ({ ...prev, reason: val, reasonError: undefined, actionError: undefined }))
          }
        />
      </div>

      <style>{`
        .kpi-summary-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px -4px rgba(15, 23, 42, 0.08) !important;
        }
        .kpi-summary-card:focus-visible {
          outline: 3px solid #2563eb;
          outline-offset: 2px;
        }
        @media (max-width: 960px) {
          .dashboard-bar-chart-card,
          .dashboard-attention-card {
            grid-column: span 1 !important;
          }
        }
        @media (max-width: 640px) {
          .admin-dashboard-container {
            padding: 1.25rem 1rem 3.5rem 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};
