import React, { useState, useEffect } from 'react';
import type { ApplicationRecord, ApplicationStatus } from '../../../types';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  BarangaySeal,
  Copy,
  Check
} from '../../../components/Icons';

import { applicationsApi } from '../services/trackingService';
import { Spinner } from '../../../components/ui/Spinner';
import { TrackingSkeleton } from '../../../components/feedback/SkeletonLoader';
import { useToast } from '../../../components/feedback/Toast';
import { RECENT_REFERENCES_KEY, type RecentReferenceItem } from '../../applications/pages/ApplyPage';

interface TrackApplicationProps {
  applications?: ApplicationRecord[];
  initialReference?: string;
  onNavigate?: (path: string, param?: string) => void;
}

export const TrackApplication: React.FC<TrackApplicationProps> = ({
  initialReference = '',
  onNavigate
}) => {
  const toast = useToast();
  const [searchInput, setSearchInput] = useState<string>(initialReference);
  const [searchedRef, setSearchedRef] = useState<string>(initialReference);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeRecord, setActiveRecord] = useState<ApplicationRecord | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [recentReferences, setRecentReferences] = useState<RecentReferenceItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_REFERENCES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setRecentReferences(parsed);
      }
    } catch {
      // Ignore storage read error
    }
  }, []);

  const handleCopy = (refNum: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(refNum).then(() => {
      setCopied(true);
      toast.success(`Reference ${refNum} copied to clipboard!`, 'Copied');
      setTimeout(() => setCopied(false), 2200);
    }).catch(() => {
      toast.info(`Reference: ${refNum}`, 'Reference Code');
    });
  };

  const validateReferenceFormat = (rawRef: string): string | null => {
    const trimmed = rawRef.trim();
    if (!trimmed) {
      return 'Reference number is required. Please enter the code from your confirmation receipt (e.g. BRGY-2026-CLR-0001).';
    }
    if (trimmed.length < 6 || trimmed.length > 35) {
      return 'Invalid reference number length. Enter a complete reference code (e.g. BRGY-2026-CLR-0001).';
    }
    if (!/^[A-Za-z0-9-]+$/.test(trimmed)) {
      return 'Reference number contains invalid characters. Only letters, numbers, and hyphens (-) are allowed.';
    }
    return null;
  };

  const fetchTracking = async (ref: string) => {
    const validationErr = validateReferenceFormat(ref);
    if (validationErr) {
      setActiveRecord(null);
      setSearchError(validationErr);
      return;
    }

    setIsLoading(true);
    setSearchError(null);
    setActiveRecord(null);

    try {
      const record = await applicationsApi.track(ref.trim());
      setActiveRecord(record);
      setSearchedRef(ref.trim());
    } catch (err: any) {
      setSearchError(err.message || 'No record found with that reference number in our official database.');
      setSearchedRef(ref.trim());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialReference) {
      setSearchInput(initialReference);
      fetchTracking(initialReference);
    }
  }, [initialReference]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    fetchTracking(searchInput);
  };

  // Timeline stage helper
  const getTimelineStages = (status: ApplicationStatus) => {
    const isRejected = status === 'Rejected';

    const stages = [
      {
        id: 'submitted',
        title: 'Application Submitted',
        description: 'Received in portal queue for administrative verification',
        completed: true,
        active: status === 'Pending Review'
      },
      {
        id: 'verification',
        title: 'Under Verification',
        description: 'Cross-checking community records & Lupon files',
        completed: ['Under Verification', 'Approved', 'Ready for Claiming', 'Successful'].includes(status) && !isRejected,
        active: status === 'Under Verification'
      },
      {
        id: 'approved',
        title: isRejected ? 'Application Rejected' : 'Approved & Processing',
        description: isRejected ? 'Requirements issue or unresolved dispute noted' : 'Endorsed for Punong Barangay official signature',
        completed: ['Approved', 'Ready for Claiming', 'Successful'].includes(status) || isRejected,
        active: status === 'Approved',
        isError: isRejected
      },
      {
        id: 'ready',
        title: 'Ready for Claiming',
        description: 'Signed certificate sealed and ready at Window 2',
        completed: ['Ready for Claiming', 'Successful'].includes(status) && !isRejected,
        active: status === 'Ready for Claiming'
      },
      {
        id: 'successful',
        title: 'Claimed & Successful',
        description: 'Official document released and claimed by applicant',
        completed: status === 'Successful',
        active: status === 'Successful'
      }
    ];

    return stages;
  };

  const getDocTitle = (type: string) => {
    const titles: Record<string, string> = {
      clearance: 'Barangay Clearance',
      indigency: 'Certificate of Indigency',
      residency: 'Certificate of Residency'
    };
    return titles[type] || type;
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 120px)', padding: '2.5rem 1rem 5rem 1rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        
        {/* Page Title & Instructions */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#1e40af',
              backgroundColor: '#eff6ff',
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              marginBottom: '0.625rem',
              textTransform: 'uppercase'
            }}
          >
            <BarangaySeal className="w-3.5 h-3.5" />
            <span>Document Verification & Inquiries</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', fontWeight: 700, color: '#0f172a', margin: '0 0 0.625rem 0' }}>
            Track Your Application
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: '580px', margin: '0 auto', lineHeight: 1.55 }}>
            Enter the reference number provided during submission to check the current processing status of your document request.
          </p>
        </div>

        {/* Tracking Search Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '1rem',
            padding: '2rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            marginBottom: '2rem'
          }}
        >
          <form onSubmit={handleSearch}>
            <label
              htmlFor="referenceInput"
              style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}
            >
              Enter Reference Number
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px', position: 'relative' }}>
                <input
                  id="referenceInput"
                  type="text"
                  maxLength={35}
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    if (searchError) setSearchError(null);
                  }}
                  onBlur={() => {
                    if (searchInput.trim()) {
                      const err = validateReferenceFormat(searchInput);
                      if (err) setSearchError(err);
                    }
                  }}
                  placeholder="e.g. BRGY-2026-CLR-8921"
                  aria-invalid={Boolean(searchError)}
                  aria-describedby={searchError ? 'track-search-error' : undefined}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.875rem',
                    borderRadius: '0.4rem',
                    border: `1.5px solid ${searchError ? '#ef4444' : '#cbd5e1'}`,
                    fontSize: '0.925rem',
                    outline: 'none',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    color: '#0f172a'
                  }}
                  className="focus-ring"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="interactive-btn"
                style={{
                  padding: '0.65rem 1.4rem',
                  backgroundColor: isLoading ? '#94a3b8' : '#1e40af',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  borderRadius: '0.4rem',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isLoading && <Spinner size="sm" color="#ffffff" ariaLabel="Searching..." />}
                <span>{isLoading ? 'Searching...' : 'Track Request'}</span>
              </button>
            </div>
          </form>

          {searchError && (
            <div
              id="track-search-error"
              role="alert"
              style={{
                marginTop: '0.85rem',
                padding: '0.75rem 1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                fontSize: '0.825rem',
                color: '#991b1b',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600 }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#dc2626' }} />
                <span>{searchError}</span>
              </div>
              {searchInput.trim() && (
                <button
                  type="button"
                  onClick={() => fetchTracking(searchInput)}
                  style={{
                    padding: '0.3rem 0.75rem',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.775rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {/* Quick-Access Recent Applications on This Device (Heuristics 6 & 7: Recognition Rather Than Recall & Efficiency) */}
          {recentReferences.length > 0 && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.775rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                Recent Applications Submitted on This Device (Click to Track):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {recentReferences.map((item) => {
                  const isSelected = searchedRef.toUpperCase() === item.referenceNumber.toUpperCase();
                  return (
                    <button
                      key={item.referenceNumber}
                      type="button"
                      onClick={() => {
                        setSearchInput(item.referenceNumber);
                        fetchTracking(item.referenceNumber);
                      }}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '0.5rem',
                        border: `1.5px solid ${isSelected ? '#2563eb' : '#cbd5e1'}`,
                        backgroundColor: isSelected ? '#eff6ff' : '#f8fafc',
                        color: isSelected ? '#1d4ed8' : '#1e293b',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{item.referenceNumber}</span>
                      <span style={{ color: '#64748b', fontSize: '0.72rem' }}>({getDocTitle(item.documentType)})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Database Verification Note */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span>Official Barangay San Isidro Verification Portal &bull; Enter the Reference Number from your application receipt.</span>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('/help')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                Lost Reference Number or Need Help?
              </button>
            )}
          </div>
        </div>

        {/* LOADING SKELETON */}
        {isLoading && (
          <div style={{ marginBottom: '2rem' }}>
            <TrackingSkeleton />
          </div>
        )}

        {/* RESULTS SECTION */}
        {searchedRef.trim() !== '' && !isLoading && (
          <>
            {activeRecord ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '1rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  overflow: 'hidden'
                }}
              >
                {/* Result Header Bar */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '1.5rem',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                      Reference Number
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '0.15rem' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e3a8a', fontFamily: 'monospace' }}>
                        {activeRecord.referenceNumber}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(activeRecord.referenceNumber)}
                        className="interactive-btn"
                        style={{
                          padding: '0.25rem 0.55rem',
                          backgroundColor: copied ? '#16a34a' : '#eff6ff',
                          border: `1px solid ${copied ? '#16a34a' : '#bfdbfe'}`,
                          borderRadius: '0.375rem',
                          color: copied ? '#ffffff' : '#2563eb',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          cursor: 'pointer'
                        }}
                        aria-label="Copy reference number to clipboard"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block', textAlign: 'right' }}>
                      Current Status
                    </span>
                    <StatusBadge status={activeRecord.status} size="lg" />
                  </div>
                </div>

                {/* Status Timeline */}
                <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>
                    Application Status Timeline
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
                    {getTimelineStages(activeRecord.status).map((stage, idx, arr) => (
                      <div key={stage.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', position: 'relative' }}>
                        {/* Timeline Connector Line */}
                        {idx < arr.length - 1 && (
                          <div
                            style={{
                              position: 'absolute',
                              left: '16px',
                              top: '32px',
                              bottom: '-12px',
                              width: '2px',
                              backgroundColor: stage.completed ? '#16a34a' : '#e2e8f0'
                            }}
                          />
                        )}

                        {/* Node Circle */}
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            backgroundColor: stage.isError
                              ? '#fee2e2'
                              : stage.completed
                              ? '#dcfce7'
                              : stage.active
                              ? '#dbeafe'
                              : '#f1f5f9',
                            color: stage.isError
                              ? '#dc2626'
                              : stage.completed
                              ? '#16a34a'
                              : stage.active
                              ? '#1e40af'
                              : '#94a3b8',
                            border: `2px solid ${
                              stage.isError
                                ? '#ef4444'
                                : stage.completed
                                ? '#16a34a'
                                : stage.active
                                ? '#2563eb'
                                : '#cbd5e1'
                            }`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            zIndex: 2
                          }}
                        >
                          {stage.isError ? (
                            <XCircle className="w-4 h-4" />
                          ) : stage.completed ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : stage.active ? (
                            <Clock className="w-4 h-4" />
                          ) : (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{idx + 1}</span>
                          )}
                        </div>

                        {/* Stage Text */}
                        <div>
                          <div style={{
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: stage.isError ? '#dc2626' : stage.active ? '#1e40af' : '#1e293b'
                          }}>
                            {stage.title}
                          </div>
                          <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.15rem' }}>
                            {stage.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details Breakdown (Note: Does not expose personal info as requested!) */}
                <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '1rem' }}>
                    Document Summary
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Requested Document</span>
                      <strong style={{ color: '#0f172a' }}>{getDocTitle(activeRecord.documentType)}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Date Submitted</span>
                      <strong style={{ color: '#0f172a' }}>{activeRecord.submissionDate}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Last Status Update</span>
                      <strong style={{ color: '#0f172a' }}>{activeRecord.lastUpdatedDate}</strong>
                    </div>

                    {activeRecord.controlNumber && (
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Official Control No.</span>
                        <strong style={{ color: '#166534', fontFamily: 'monospace' }}>{activeRecord.controlNumber}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Next Step Instructions & Remarks */}
                <div style={{ padding: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                    Next-Step Instructions:
                  </h4>

                  {activeRecord.status === 'Successful' && (
                    <div style={{ padding: '1rem', backgroundColor: '#ecfdf5', borderRadius: '0.5rem', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      <strong>✓ Document Claimed (Successful):</strong> This document was physically received and claimed by the applicant at the Barangay Hall. The transaction has concluded successfully. Thank you!
                    </div>
                  )}

                  {activeRecord.status === 'Ready for Claiming' && (
                    <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      <strong>Ready for Pick-up:</strong> Your document has been signed and officially sealed. Please bring 1 valid government-issued photo ID and proceed to <strong>Barangay Hall Window 2</strong> during office hours (8:00 AM – 5:00 PM, Mon-Fri).
                    </div>
                  )}

                  {activeRecord.status === 'Approved' && (
                    <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0', color: '#166534', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      <strong>Approved:</strong> Your request has passed community and records verification. It is currently queued for official printing and signature by the Punong Barangay.
                    </div>
                  )}

                  {activeRecord.status === 'Under Verification' && (
                    <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #cbd5e1', color: '#334155', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      <strong>Verification in Progress:</strong> Barangay officers are validating residency records with your Purok leader. Expected verification turnaround is within 1 working day.
                    </div>
                  )}

                  {activeRecord.status === 'Pending Review' && (
                    <div style={{ padding: '1rem', backgroundColor: '#fffbeb', borderRadius: '0.5rem', border: '1px solid #fde68a', color: '#92400e', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      <strong>In Queue:</strong> Your online submission has been received. Desk staff will review your documentary information during the next office intake batch.
                    </div>
                  )}

                  {activeRecord.status === 'Rejected' && (
                    <div style={{ padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      <strong>Application Action Required:</strong> {activeRecord.rejectionReason || 'Please visit the Barangay Hall for clarification regarding your request.'}
                    </div>
                  )}

                  {activeRecord.remarks && activeRecord.status !== 'Rejected' && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.825rem', color: '#64748b' }}>
                      <strong>Staff Remarks:</strong> {activeRecord.remarks}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Reference Number Not Found State */
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '1rem',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem auto'
                  }}
                >
                  <AlertCircle className="w-8 h-8" />
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Reference Number Not Found
                </h3>

                <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: '480px', margin: '0 auto 1.5rem auto', lineHeight: 1.55 }}>
                  We could not find any active request matching reference code <strong>"{searchedRef}"</strong> in the official database records.
                </p>

                <div
                  style={{
                    maxWidth: '460px',
                    margin: '0 auto 1.5rem auto',
                    backgroundColor: '#f8fafc',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    textAlign: 'left',
                    fontSize: '0.825rem',
                    color: '#475569',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <strong>Helpful Tips:</strong>
                  <ul style={{ margin: '0.35rem 0 0 0', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <li>Ensure you entered the full reference code with dashes (e.g. <code>BRGY-2026-CLR-0001</code>).</li>
                    <li>If you just submitted a request, verify the reference code printed on your submission confirmation.</li>
                    <li>Reference numbers are not case-sensitive.</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="interactive-btn"
                  style={{
                    padding: '0.625rem 1.25rem',
                    backgroundColor: '#f1f5f9',
                    color: '#1e293b',
                    borderRadius: '0.5rem',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Clear and Try Again
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};


export const TrackApplicationPage = TrackApplication;
