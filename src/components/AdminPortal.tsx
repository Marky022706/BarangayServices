import React, { useState } from 'react';
import type { ServiceRequest, ApplicationStatus } from '../types';
import { 
  IconFileText, 
  IconCheckCircle, 
  IconClock, 
  IconSearch, 
  IconFilter, 
  IconEye, 
  IconPrinter, 
  IconCreditCard 
} from './Icons';

interface AdminPortalProps {
  requests: ServiceRequest[];
  onUpdateStatus: (
    id: string, 
    status: ApplicationStatus, 
    controlNumber?: string, 
    paymentStatus?: 'pending' | 'paid' | 'verified' | 'waived',
    rejectionReason?: string
  ) => void;
  onViewCertificate: (req: ServiceRequest) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  requests,
  onUpdateStatus,
  onViewCertificate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDoc, setFilterDoc] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReq, setSelectedReq] = useState<ServiceRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [customControlNo, setCustomControlNo] = useState('');

  // Stats Calculations
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'pending' || r.status === 'processing').length;
  const issuedRequests = requests.filter(r => r.status === 'issued' || r.status === 'ready_for_pickup').length;
  
  const gcashPaymentsCount = requests.filter(r => r.paymentMethod === 'gcash').length;
  const pickupPaymentsCount = requests.filter(r => r.paymentMethod === 'pickup').length;
  
  const totalRevenueCollected = requests
    .filter(r => r.paymentStatus === 'verified' || r.paymentStatus === 'paid')
    .reduce((sum, r) => sum + r.amount, 0);

  // Filtered list
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.referenceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.controlNumber && req.controlNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDoc = filterDoc === 'all' || req.documentType === filterDoc;
    const matchesPayment = filterPayment === 'all' || req.paymentMethod === filterPayment;
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;

    return matchesSearch && matchesDoc && matchesPayment && matchesStatus;
  });

  const handleApprove = (req: ServiceRequest) => {
    const defaultCtrl = customControlNo.trim() || `${req.documentType.substring(0, 3).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newStatus: ApplicationStatus = req.paymentMethod === 'pickup' && req.paymentStatus !== 'verified' ? 'ready_for_pickup' : 'issued';
    const newPaymentStatus = req.paymentMethod === 'pickup' && req.paymentStatus !== 'verified' ? 'verified' : req.paymentStatus;
    
    onUpdateStatus(req.id, newStatus, defaultCtrl, newPaymentStatus);
    setSelectedReq(null);
    setCustomControlNo('');
  };

  const handleReject = (req: ServiceRequest) => {
    if (!rejectionReason.trim()) {
      alert('Please state a reason for rejecting this application.');
      return;
    }
    onUpdateStatus(req.id, 'rejected', undefined, undefined, rejectionReason);
    setSelectedReq(null);
    setRejectionReason('');
  };

  const handleVerifyPayment = (req: ServiceRequest) => {
    onUpdateStatus(req.id, req.status, req.controlNumber, 'verified');
    if (selectedReq) {
      setSelectedReq({ ...selectedReq, paymentStatus: 'verified' });
    }
  };

  return (
    <div>
      {/* Admin Executive Dashboard Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: 'var(--primary-blue)' }}>
            <IconFileText className="w-6 h-6" />
          </div>
          <div>
            <div className="stat-val">{totalRequests}</div>
            <div className="stat-lbl">Total Document Requests</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <IconClock className="w-6 h-6" />
          </div>
          <div>
            <div className="stat-val">{pendingRequests}</div>
            <div className="stat-lbl">Pending Review</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
            <IconCheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="stat-val">{issuedRequests}</div>
            <div className="stat-lbl">Issued Documents</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
            <IconCreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="stat-val">₱{totalRevenueCollected}.00</div>
            <div className="stat-lbl">Revenue ({gcashPaymentsCount} Online, {pickupPaymentsCount} Pickup)</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <IconSearch className="w-4 h-4" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search Resident Name or Ref Code..."
            style={{ paddingLeft: '2.4rem' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <IconFilter className="w-4 h-4" /> Filters:
          </div>

          <select className="form-control" style={{ width: 'auto' }} value={filterDoc} onChange={e => setFilterDoc(e.target.value)}>
            <option value="all">All Service Types</option>
            <option value="residency">Residency Cert</option>
            <option value="indigency">Indigency Cert</option>
            <option value="clearance">Barangay Clearance</option>
          </select>

          <select className="form-control" style={{ width: 'auto' }} value={filterPayment} onChange={e => setFilterPayment(e.target.value)}>
            <option value="all">All Payment Methods</option>
            <option value="gcash">GCash Online Payment</option>
            <option value="pickup">Cash on Pickup</option>
            <option value="waived">Waived / Free</option>
          </select>

          <select className="form-control" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="issued">Issued / Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Admin Requests Data Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Ref Code</th>
              <th>Resident Name</th>
              <th>Service</th>
              <th>Payment Info</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No requests matching the selected filters.
                </td>
              </tr>
            ) : (
              filteredRequests.map(req => (
                <tr key={req.id}>
                  <td>
                    <strong style={{ color: 'var(--primary-navy)' }}>{req.referenceCode}</strong>
                    {req.controlNumber && (
                      <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                        Ctrl: {req.controlNumber}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{req.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.address}</div>
                  </td>
                  <td>
                    <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                      {req.documentType === 'residency' ? 'Residency' : req.documentType === 'indigency' ? 'Indigency' : 'Clearance'}
                    </span>
                  </td>
                  <td>
                    <div>
                      {req.amount === 0 ? (
                        <span className="badge badge-waived">Free</span>
                      ) : (
                        <span className={`badge ${req.paymentMethod === 'gcash' ? 'badge-gcash' : 'badge-pickup'}`}>
                          {req.paymentMethod === 'gcash' ? 'GCash' : 'Cash Pickup'} (₱{req.amount})
                        </span>
                      )}
                    </div>
                    {req.paymentReferenceNumber && (
                      <div style={{ fontSize: '0.75rem', color: '#1d4ed8', marginTop: '0.15rem' }}>
                        Ref: {req.paymentReferenceNumber}
                      </div>
                    )}
                    <div style={{ fontSize: '0.725rem', color: req.paymentStatus === 'verified' ? '#059669' : '#d97706', fontWeight: 600 }}>
                      Payment: {req.paymentStatus.toUpperCase()}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${req.status}`}>
                      {req.status === 'ready_for_pickup' ? 'Ready for Pickup' : req.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.createdAt}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => {
                        setSelectedReq(req);
                        setCustomControlNo(req.controlNumber || `${req.documentType.substring(0, 3).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`);
                      }}>
                        <IconEye className="w-3.5 h-3.5" /> Manage
                      </button>
                      {(req.status === 'issued' || req.status === 'ready_for_pickup') && (
                        <button className="btn btn-success btn-sm" onClick={() => onViewCertificate(req)}>
                          <IconPrinter className="w-3.5 h-3.5" /> Print
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADMIN ACTION & REVIEW MODAL */}
      {selectedReq && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div className="modal-title">Manage Application - {selectedReq.referenceCode}</div>
              <button className="close-btn" onClick={() => setSelectedReq(null)}>&times;</button>
            </div>

            <div className="modal-body">
              {/* Applicant Overview */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div><strong>Applicant Name:</strong> {selectedReq.fullName}</div>
                  <div><strong>Age / DOB:</strong> {selectedReq.age} yrs ({selectedReq.dateOfBirth})</div>
                  <div><strong>Civil Status:</strong> {selectedReq.civilStatus}</div>
                  <div><strong>Citizenship:</strong> {selectedReq.citizenship}</div>
                  <div style={{ gridColumn: '1 / -1' }}><strong>Address:</strong> {selectedReq.address}</div>
                  <div style={{ gridColumn: '1 / -1' }}><strong>Purpose:</strong> {selectedReq.purpose}</div>
                  {selectedReq.residencyPeriod && (
                    <div><strong>Period of Residency:</strong> {selectedReq.residencyPeriod}</div>
                  )}
                </div>
              </div>

              {/* Payment Verification Box */}
              <div style={{ background: selectedReq.paymentMethod === 'gcash' ? '#eff6ff' : '#fff7ed', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid #cbd5e1', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--primary-navy)' }}>
                    Payment Information ({selectedReq.paymentMethod.toUpperCase()})
                  </strong>
                  <span className={`badge badge-${selectedReq.paymentStatus}`}>
                    {selectedReq.paymentStatus}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                  <div><strong>Amount Due:</strong> ₱{selectedReq.amount}.00</div>
                  {selectedReq.paymentReferenceNumber && (
                    <div><strong>GCash Online Ref Code:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1d4ed8' }}>{selectedReq.paymentReferenceNumber}</span></div>
                  )}
                  {selectedReq.paymentMethod === 'pickup' && (
                    <div style={{ color: '#c2410c', marginTop: '0.2rem' }}>
                      Over-the-counter payment at Barangay Cashier upon pickup.
                    </div>
                  )}
                </div>

                {selectedReq.paymentStatus !== 'verified' && selectedReq.amount > 0 && (
                  <button 
                    className="btn btn-primary btn-sm" 
                    style={{ marginTop: '0.75rem', width: '100%' }}
                    onClick={() => handleVerifyPayment(selectedReq)}
                  >
                    <IconCheckCircle className="w-4 h-4" /> Verify & Confirm Payment Received
                  </button>
                )}
              </div>

              {/* Approval Controls */}
              <div className="form-group">
                <label className="form-label">Assign Official Control / Clearance No.</label>
                <input
                  type="text"
                  className="form-control"
                  value={customControlNo}
                  onChange={e => setCustomControlNo(e.target.value)}
                  placeholder="e.g. CLR-2026-0493"
                />
              </div>

              {/* Rejection input */}
              <div className="form-group">
                <label className="form-label">Rejection Reason (if denying application)</label>
                <input
                  type="text"
                  className="form-control"
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="e.g. Incomplete address verification record"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setSelectedReq(null)}>Close</button>
                
                {selectedReq.status !== 'rejected' && (
                  <button className="btn btn-danger" onClick={() => handleReject(selectedReq)}>
                    Reject Application
                  </button>
                )}

                <button className="btn btn-success" onClick={() => handleApprove(selectedReq)}>
                  <IconCheckCircle className="w-4 h-4" /> Approve & Issue Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
