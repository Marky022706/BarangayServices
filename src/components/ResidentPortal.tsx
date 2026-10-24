import React, { useState } from 'react';
import type { DocumentType, PaymentMethod, PaymentStatus, ServiceRequest, ResidentProfile, CivilStatus } from '../types';
import { 
  IconFileText, 
  IconShieldCheck, 
  IconHeartHandshake, 
  IconHome, 
  IconCreditCard, 
  IconCash, 
  IconClock, 
  IconEye 
} from './Icons';

interface ResidentPortalProps {
  resident: ResidentProfile;
  requests: ServiceRequest[];
  onSubmitRequest: (newReq: Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt' | 'referenceCode' | 'status'>) => void;
  onViewCertificate: (req: ServiceRequest) => void;
}

export const ResidentPortal: React.FC<ResidentPortalProps> = ({
  resident,
  requests,
  onSubmitRequest,
  onViewCertificate,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'services' | 'history'>('services');

  // Form State
  const [fullName, setFullName] = useState(resident.fullName);
  const [age, setAge] = useState(resident.age);
  const [dateOfBirth, setDateOfBirth] = useState(resident.dateOfBirth);
  const [civilStatus, setCivilStatus] = useState<CivilStatus>(resident.civilStatus);
  const [citizenship, setCitizenship] = useState(resident.citizenship);
  const [address, setAddress] = useState(resident.address);
  const [residencyPeriod, setResidencyPeriod] = useState('5 Years');
  const [purpose, setPurpose] = useState('');
  const [indigencyStatementAccepted, setIndigencyStatementAccepted] = useState(true);
  const [noDerogatoryRecordConfirmed, setNoDerogatoryRecordConfirmed] = useState(true);
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');
  const [paymentReferenceNumber, setPaymentReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openRequestForm = (type: DocumentType) => {
    setSelectedDoc(type);
    setPurpose(
      type === 'residency' 
        ? 'Bank Account Opening & Proof of Address' 
        : type === 'indigency' 
        ? 'Medical Assistance' 
        : 'Local Employment Requirement'
    );
    setPaymentMethod(type === 'indigency' ? 'waived' : 'gcash');
  };

  const getFee = (type: DocumentType): number => {
    if (type === 'residency') return 50;
    if (type === 'clearance') return 100;
    return 0; // Indigency is free
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    if (!purpose.trim()) {
      alert('Please enter the purpose of your request.');
      return;
    }

    if (selectedDoc !== 'indigency' && paymentMethod === 'gcash' && !paymentReferenceNumber.trim()) {
      alert('Please enter your Online Payment (GCash / Reference Number) after sending payment.');
      return;
    }

    setIsSubmitting(true);

    const fee = getFee(selectedDoc);
    const pStatus: PaymentStatus = selectedDoc === 'indigency' ? 'waived' : (paymentMethod === 'gcash' ? 'paid' : 'pending');

    setTimeout(() => {
      const newRequestData = {
        documentType: selectedDoc,
        fullName,
        age: Number(age),
        dateOfBirth,
        civilStatus,
        citizenship,
        address,
        contactNumber: resident.contactNumber,
        email: resident.email,
        residencyPeriod: selectedDoc === 'residency' ? residencyPeriod : undefined,
        purpose,
        indigencyStatementAccepted: selectedDoc === 'indigency' ? indigencyStatementAccepted : undefined,
        noDerogatoryRecordConfirmed: selectedDoc === 'clearance' ? noDerogatoryRecordConfirmed : undefined,
        paymentMethod,
        paymentStatus: pStatus,
        amount: fee,
        paymentReferenceNumber: paymentMethod === 'gcash' ? paymentReferenceNumber : undefined,
        paymentDate: paymentMethod === 'gcash' ? new Date().toLocaleString() : undefined,
        punongBarangay: 'Hon. Honorio A. Reyes',
        barangayName: 'Barangay San Jose',
        cityMunicipality: 'Quezon City',
        province: 'Metro Manila',
      };

      onSubmitRequest(newRequestData);
      setIsSubmitting(false);
      setSelectedDoc(null);
      setPaymentReferenceNumber('');
      setActiveSubTab('history');
    }, 600);
  };

  // Filter requests for logged-in resident
  const residentRequests = requests.filter(r => r.fullName.toLowerCase() === resident.fullName.toLowerCase());

  return (
    <div>
      {/* Tab bar inside Resident Portal */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${activeSubTab === 'services' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('services')}
        >
          <IconFileText className="w-4 h-4" /> Available Services
        </button>
        <button
          className={`btn ${activeSubTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('history')}
        >
          <IconClock className="w-4 h-4" /> My Request History ({residentRequests.length})
        </button>
      </div>

      {activeSubTab === 'services' && (
        <>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              Online Document Request Services
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Select an official barangay document below to file your request instantly with online or over-the-counter payment.
            </p>
          </div>

          <div className="cards-grid">
            {/* 1. Residency Certificate */}
            <div className="service-card">
              <div className="card-header">
                <div className="card-icon-wrapper">
                  <IconHome className="w-6 h-6" />
                </div>
                <span className="fee-tag">₱50.00 Fee</span>
              </div>
              <h3 className="card-title">Barangay Certificate of Residency</h3>
              <p className="card-description">
                Official certification confirming resident's home address and period of residency within Barangay San Jose.
              </p>
              <div className="requirements-list">
                <strong>Includes:</strong> Full Name, Age, Civil Status, Citizenship, Address, Residency Period, Seal & Signatures.
              </div>
              <button className="btn btn-primary" onClick={() => openRequestForm('residency')}>
                Request Residency Cert
              </button>
            </div>

            {/* 2. Indigency Certificate */}
            <div className="service-card gold">
              <div className="card-header">
                <div className="card-icon-wrapper">
                  <IconHeartHandshake className="w-6 h-6" />
                </div>
                <span className="fee-tag free">FREE (₱0.00)</span>
              </div>
              <h3 className="card-title">Barangay Certificate of Indigency</h3>
              <p className="card-description">
                Certification verifying low-income or indigent status required for medical, financial, or educational assistance.
              </p>
              <div className="requirements-list">
                <strong>Includes:</strong> Indigent Declaration Statement, Purpose, Date Issued, Punong Barangay Signature & Seal.
              </div>
              <button className="btn btn-primary" onClick={() => openRequestForm('indigency')}>
                Request Indigency Cert
              </button>
            </div>

            {/* 3. Barangay Clearance */}
            <div className="service-card">
              <div className="card-header">
                <div className="card-icon-wrapper">
                  <IconShieldCheck className="w-6 h-6" />
                </div>
                <span className="fee-tag">₱100.00 Fee</span>
              </div>
              <h3 className="card-title">Barangay Clearance</h3>
              <p className="card-description">
                Official clearance certifying good moral standing and absence of derogatory criminal records in the barangay.
              </p>
              <div className="requirements-list">
                <strong>Includes:</strong> Clearance Control No., Non-derogatory statement, Purpose, Official Verification Stamp.
              </div>
              <button className="btn btn-primary" onClick={() => openRequestForm('clearance')}>
                Request Clearance
              </button>
            </div>
          </div>
        </>
      )}

      {/* History Sub-tab */}
      {activeSubTab === 'history' && (
        <div className="table-container">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)' }}>Your Submitted Document Requests</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Showing {residentRequests.length} request(s)</span>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>Ref Code</th>
                <th>Document Type</th>
                <th>Purpose</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Submitted Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {residentRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No requests found. Select a service from above to submit a new application.
                  </td>
                </tr>
              ) : (
                residentRequests.map(req => (
                  <tr key={req.id}>
                    <td><strong style={{ color: 'var(--primary-navy)' }}>{req.referenceCode}</strong></td>
                    <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                      {req.documentType === 'residency' ? 'Residency Certificate' : req.documentType === 'indigency' ? 'Indigency Certificate' : 'Barangay Clearance'}
                    </td>
                    <td>{req.purpose}</td>
                    <td>
                      <div>
                        {req.amount === 0 ? (
                          <span className="badge badge-waived">FREE (₱0)</span>
                        ) : (
                          <span className={`badge ${req.paymentMethod === 'gcash' ? 'badge-gcash' : 'badge-pickup'}`}>
                            {req.paymentMethod === 'gcash' ? 'GCash Online' : 'Cash Pickup'} (₱{req.amount})
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Status: {req.paymentStatus}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${req.status}`}>
                        {req.status === 'ready_for_pickup' ? 'Ready for Pickup' : req.status}
                      </span>
                    </td>
                    <td>{req.createdAt}</td>
                    <td>
                      {(req.status === 'issued' || req.status === 'ready_for_pickup') ? (
                        <button className="btn btn-primary btn-sm" onClick={() => onViewCertificate(req)}>
                          <IconEye className="w-3.5 h-3.5" /> View / Print
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>In Review</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* REQUEST FORM MODAL */}
      {selectedDoc && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                Request Form - {selectedDoc === 'residency' ? 'Barangay Residency Certificate' : selectedDoc === 'indigency' ? 'Certificate of Indigency' : 'Barangay Clearance'}
              </div>
              <button className="close-btn" onClick={() => setSelectedDoc(null)}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Personal Information */}
                <div style={{ marginBottom: '1rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-navy)', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
                  Resident Profile Details
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input type="number" className="form-control" value={age} onChange={e => setAge(Number(e.target.value))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-control" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Civil Status</label>
                    <select className="form-control" value={civilStatus} onChange={e => setCivilStatus(e.target.value as CivilStatus)}>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Separated">Separated</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Citizenship</label>
                    <input type="text" className="form-control" value={citizenship} onChange={e => setCitizenship(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Complete Home Address</label>
                  <input type="text" className="form-control" value={address} onChange={e => setAddress(e.target.value)} required />
                </div>

                {/* Document Specific Section */}
                <div style={{ margin: '1.5rem 0 1rem 0', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-navy)', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
                  Document Specific Information
                </div>

                {selectedDoc === 'residency' && (
                  <div className="form-group">
                    <label className="form-label">Length / Period of Residency</label>
                    <input type="text" className="form-control" placeholder="e.g. 5 Years, 10 Months" value={residencyPeriod} onChange={e => setResidencyPeriod(e.target.value)} required />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Purpose of Certification / Clearance</label>
                  <input type="text" className="form-control" placeholder="e.g. Bank Requirement, Employment, Medical, Scholarship" value={purpose} onChange={e => setPurpose(e.target.value)} required />
                </div>

                {selectedDoc === 'indigency' && (
                  <div className="form-group" style={{ background: '#fffbe6', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #fef08a' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#854d0e' }}>
                      <input 
                        type="checkbox" 
                        checked={indigencyStatementAccepted} 
                        onChange={e => setIndigencyStatementAccepted(e.target.checked)} 
                        style={{ marginTop: '0.2rem' }}
                        required
                      />
                      <span>
                        <strong>Indigency Declaration:</strong> I hereby declare that I am a low-income resident of Barangay San Jose with insufficient financial income, seeking official assistance.
                      </span>
                    </label>
                  </div>
                )}

                {selectedDoc === 'clearance' && (
                  <div className="form-group" style={{ background: '#eff6ff', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#1e40af' }}>
                      <input 
                        type="checkbox" 
                        checked={noDerogatoryRecordConfirmed} 
                        onChange={e => setNoDerogatoryRecordConfirmed(e.target.checked)} 
                        style={{ marginTop: '0.2rem' }}
                        required
                      />
                      <span>
                        <strong>Non-Derogatory Declaration:</strong> I certify that I have no pending criminal record or active barangay dispute cases in Barangay San Jose.
                      </span>
                    </label>
                  </div>
                )}

                {/* Payment Option */}
                {selectedDoc !== 'indigency' ? (
                  <div style={{ marginTop: '1.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                      Select Payment Option (Fee: ₱{getFee(selectedDoc)}.00)
                    </div>
                    
                    <div className="payment-methods-grid">
                      <div 
                        className={`payment-option-card ${paymentMethod === 'gcash' ? 'selected' : ''}`}
                        onClick={() => setPaymentMethod('gcash')}
                      >
                        <div className="payment-icon">
                          <IconCreditCard className="w-5 h-5" />
                        </div>
                        <div className="payment-title">GCash / Online QR</div>
                        <div className="payment-desc">Instant online verification</div>
                      </div>

                      <div 
                        className={`payment-option-card ${paymentMethod === 'pickup' ? 'selected' : ''}`}
                        onClick={() => setPaymentMethod('pickup')}
                      >
                        <div className="payment-icon">
                          <IconCash className="w-5 h-5" />
                        </div>
                        <div className="payment-title">Cash on Pickup</div>
                        <div className="payment-desc">Pay at Barangay Treasury counter</div>
                      </div>
                    </div>

                    {paymentMethod === 'gcash' && (
                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-lg)', marginTop: '1rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                          <div style={{ width: '60px', height: '60px', background: '#0052cc', borderRadius: '8px', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                            QR Ph
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Barangay San Jose Official GCash</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Account No: <strong>0917-888-9999</strong></div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Amount to Pay: <strong>₱{getFee(selectedDoc)}.00</strong></div>
                          </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Enter GCash Payment Reference No.</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="e.g. GCASH-123456789" 
                            value={paymentReferenceNumber}
                            onChange={e => setPaymentReferenceNumber(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ background: '#d1fae5', color: '#065f46', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 600, marginTop: '1rem' }}>
                    ✓ Fee Waived: Certificate of Indigency is completely free of charge.
                  </div>
                )}
              </div>

              <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedDoc(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Official Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
