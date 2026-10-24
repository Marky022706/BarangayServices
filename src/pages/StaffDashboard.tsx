import React, { useState } from 'react';
import type { ApplicationRecord, ApplicationStatus, DocumentType } from '../types';
import { StatusBadge } from '../components/StatusBadge';
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
  BarangaySeal,
  Copy,
  Check
} from '../components/Icons';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useToast } from '../components/Toast';

interface StaffDashboardProps {
  applications: ApplicationRecord[];
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
  onUpdateStatus,
  onViewPrintCertificate
}) => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocType, setSelectedDocType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [detailModalApp, setDetailModalApp] = useState<ApplicationRecord | null>(null);

  // Copy tracking state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Unified Confirmation Modal State
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    app: ApplicationRecord | null;
    action: 'Approve' | 'Reject' | 'Under Verification' | 'Ready for Claiming';
    title: string;
    message: string;
    variant: 'primary' | 'success' | 'danger';
    confirmLabel: string;
    reason: string;
    reasonError?: string;
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

  const handleCopyRef = (refNum: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(refNum).then(() => {
      setCopiedId(refNum);
      toast.success(`Reference ${refNum} copied to clipboard!`, 'Copied');
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      toast.info(`Reference: ${refNum}`);
    });
  };

  // Count stats
  const pendingCount = applications.filter((a) => a.status === 'Pending Review').length;
  const verificationCount = applications.filter((a) => a.status === 'Under Verification').length;
  const approvedCount = applications.filter((a) => a.status === 'Approved').length;
  const readyCount = applications.filter((a) => a.status === 'Ready for Claiming').length;
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length;

  // Filter applications
  const filteredApps = applications.filter((app) => {
    const applicantFullName = `${app.personalInfo.firstName} ${app.personalInfo.lastName}`.toLowerCase();
    const matchesSearch =
      applicantFullName.includes(searchTerm.toLowerCase()) ||
      app.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.controlNumber && app.controlNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDoc = selectedDocType === 'all' || app.documentType === selectedDocType;
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;

    return matchesSearch && matchesDoc && matchesStatus;
  });

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
      reason: ''
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
      reasonError: undefined
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
      reason: ''
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
      reason: ''
    });
  };

  const handleConfirmActionExecute = async () => {
    const { app, action, reason } = confirmModal;
    if (!app) return;

    if (action === 'Reject' && !reason.trim()) {
      setConfirmModal((prev) => ({
        ...prev,
        reasonError: 'Please provide a reason for rejecting this application.'
      }));
      return;
    }

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
        setDetailModalApp((prev) => (prev && prev.id === app.id ? { ...prev, status: 'Approved', controlNumber: ctrl } : prev));
      } else if (action === 'Reject') {
        await onUpdateStatus(
          app.id,
          'Rejected',
          undefined,
          undefined,
          reason.trim()
        );
        toast.success(`Application ${app.referenceNumber} has been rejected.`, 'Application Rejected');
        setDetailModalApp((prev) => (prev && prev.id === app.id ? { ...prev, status: 'Rejected', rejectionReason: reason.trim() } : prev));
      } else if (action === 'Under Verification') {
        await onUpdateStatus(
          app.id,
          'Under Verification',
          undefined,
          'Document in queue for community records and Lupon clearance validation.'
        );
        toast.info(`Application ${app.referenceNumber} moved to Under Verification.`, 'Status Updated');
        setDetailModalApp((prev) => (prev && prev.id === app.id ? { ...prev, status: 'Under Verification' } : prev));
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
        setDetailModalApp((prev) => (prev && prev.id === app.id ? { ...prev, status: 'Ready for Claiming', controlNumber: ctrl } : prev));
      }

      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      toast.error(err.message || 'Operation failed. Please try again.', 'Error');
    } finally {
      setIsExecutingAction(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: 'calc(100vh - 120px)', padding: '2rem 2rem 5rem 2rem', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '100%' }}>
        
        {/* Welcome Message Banner */}
        <div
          style={{
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            borderRadius: '0.75rem',
            padding: '1.25rem 1.75rem',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            borderLeft: '5px solid #2563eb',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '2px solid #f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              <BarangaySeal size={38} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span>Welcome back, {sessionStorage.getItem('brgy_staff_name') || sessionStorage.getItem('brgy_staff_user') || 'Barangay Staff'}!</span>
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', backgroundColor: '#1e40af', color: '#bfdbfe', borderRadius: '9999px', fontWeight: 600 }}>
                  Staff Portal
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                Review resident requests, verify documentary requirements, and issue official barangay certificates.
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}
          >
            <div
              style={{
                padding: '0.4rem 0.85rem',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid #22c55e',
                color: '#4ade80',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  boxShadow: '0 0 6px #22c55e'
                }}
              />
              <span>Online &bull; Active Duty</span>
            </div>
          </div>
        </div>

        {/* 5 Summary Stat Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}
        >
          {/* 1. Pending Review */}
          <div
            onClick={() => setSelectedStatus(selectedStatus === 'Pending Review' ? 'all' : 'Pending Review')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              border: selectedStatus === 'Pending Review' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Pending Review</span>
              <div style={{ padding: '0.35rem', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#b45309' }}>
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#b45309' }}>{pendingCount}</div>
            <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '0.25rem' }}>Awaiting initial intake</div>
          </div>

          {/* 2. Under Verification */}
          <div
            onClick={() => setSelectedStatus(selectedStatus === 'Under Verification' ? 'all' : 'Under Verification')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              border: selectedStatus === 'Under Verification' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Under Verification</span>
              <div style={{ padding: '0.35rem', borderRadius: '50%', backgroundColor: '#e0e7ff', color: '#3730a3' }}>
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3730a3' }}>{verificationCount}</div>
            <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '0.25rem' }}>Purok / Lupon check</div>
          </div>

          {/* 3. Approved */}
          <div
            onClick={() => setSelectedStatus(selectedStatus === 'Approved' ? 'all' : 'Approved')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              border: selectedStatus === 'Approved' ? '2px solid #16a34a' : '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Approved</span>
              <div style={{ padding: '0.35rem', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#166534' }}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#166534' }}>{approvedCount}</div>
            <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '0.25rem' }}>Passed records check</div>
          </div>

          {/* 4. Ready for Claiming */}
          <div
            onClick={() => setSelectedStatus(selectedStatus === 'Ready for Claiming' ? 'all' : 'Ready for Claiming')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              border: selectedStatus === 'Ready for Claiming' ? '2px solid #2563eb' : '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Ready for Claiming</span>
              <div style={{ padding: '0.35rem', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#1e40af' }}>
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e40af' }}>{readyCount}</div>
            <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '0.25rem' }}>Ready at Window 2</div>
          </div>

          {/* 5. Rejected */}
          <div
            onClick={() => setSelectedStatus(selectedStatus === 'Rejected' ? 'all' : 'Rejected')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              border: selectedStatus === 'Rejected' ? '2px solid #dc2626' : '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Rejected</span>
              <div style={{ padding: '0.35rem', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#991b1b' }}>
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#991b1b' }}>{rejectedCount}</div>
            <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '0.25rem' }}>Incomplete or issue</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            marginBottom: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Search Input */}
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reference no., applicant name, or control no..."
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem 0.625rem 2.25rem',
                borderRadius: '0.5rem',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none'
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
                color: '#94a3b8'
              }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            {/* Document Type Filter limited to the 3 supported services */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Document:</span>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '0.5rem',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '0.85rem',
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
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '0.5rem',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '0.85rem',
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
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {(searchTerm || selectedDocType !== 'all' || selectedStatus !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDocType('all');
                  setSelectedStatus('all');
                }}
                style={{
                  padding: '0.55rem 0.85rem',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.5rem',
                  fontSize: '0.8rem',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Applications Table */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            overflowX: 'auto'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '760px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>
                <th style={{ padding: '0.875rem 1.25rem' }}>Reference No.</th>
                <th style={{ padding: '0.875rem 1.25rem' }}>Applicant Name</th>
                <th style={{ padding: '0.875rem 1.25rem' }}>Document Type</th>
                <th style={{ padding: '0.875rem 1.25rem' }}>Submission Date</th>
                <th style={{ padding: '0.875rem 1.25rem' }}>Status</th>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.length > 0 ? (
                filteredApps.map((app) => (
                  <tr
                    key={app.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.1s ease',
                      fontSize: '0.875rem'
                    }}
                    className="table-row-hover"
                  >
                    {/* Reference */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <div style={{ fontWeight: 700, color: '#1e3a8a', fontFamily: 'monospace' }}>
                          {app.referenceNumber}
                        </div>
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
                        <div style={{ fontSize: '0.725rem', color: '#15803d', fontFamily: 'monospace', marginTop: '2px' }}>
                          Ctrl: {app.controlNumber}
                        </div>
                      )}
                    </td>

                    {/* Applicant Name */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>
                        {app.personalInfo.firstName} {app.personalInfo.lastName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {app.personalInfo.purokSitio}
                      </div>
                    </td>

                    {/* Document Type */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: '#334155' }}>
                        {getDocTitle(app.documentType)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {app.details.purpose}
                      </div>
                    </td>

                    {/* Submission Date */}
                    <td style={{ padding: '1rem 1.25rem', color: '#475569', fontSize: '0.825rem' }}>
                      {app.submissionDate}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <StatusBadge status={app.status} size="sm" />
                    </td>

                    {/* Action Button */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setDetailModalApp(app)}
                        style={{
                          padding: '0.45rem 0.85rem',
                          backgroundColor: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          borderRadius: '0.375rem',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ maxWidth: '360px', margin: '0 auto' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: '#f1f5f9',
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 1rem auto'
                        }}
                      >
                        <Search className="w-6 h-6" />
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>
                        No Applications Found
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.45 }}>
                        No records match your active search term or filter selection. Try adjusting your filters.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedDocType('all');
                          setSelectedStatus('all');
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
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* APPLICATION DETAIL MODAL / DRAWER */}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      {getDocTitle(detailModalApp.documentType)}
                    </span>
                    <StatusBadge status={detailModalApp.status} size="sm" />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                    Ref: {detailModalApp.referenceNumber} • Submitted: {detailModalApp.submissionDate}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDetailModalApp(null)}
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
                        {detailModalApp.personalInfo.firstName} {detailModalApp.personalInfo.middleName} {detailModalApp.personalInfo.lastName} {detailModalApp.personalInfo.suffix}
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
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>

                {/* Purpose & Specific Fields */}
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.625rem' }}>
                    Document Purpose & Specifics
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Stated Purpose</span>
                      <strong style={{ color: '#0f172a' }}>
                        {detailModalApp.details.purpose === 'Other' ? detailModalApp.details.otherPurpose : detailModalApp.details.purpose}
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
                {/* Print Certificate button if Approved or Ready */}
                {(detailModalApp.status === 'Approved' || detailModalApp.status === 'Ready for Claiming') && onViewPrintCertificate && (
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

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginLeft: 'auto' }}>
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

                  {detailModalApp.status !== 'Approved' && detailModalApp.status !== 'Ready for Claiming' && (
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

                  {detailModalApp.status !== 'Rejected' && (
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
          onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          requiresReason={confirmModal.action === 'Reject'}
          reasonValue={confirmModal.reason}
          reasonError={confirmModal.reasonError}
          onReasonChange={(val) => setConfirmModal((prev) => ({ ...prev, reason: val, reasonError: undefined }))}
        />
      </div>
    </div>
  );
};
