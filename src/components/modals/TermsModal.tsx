import React from 'react';
import { X, FileText } from '../Icons';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
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
    }}>
      <div 
        className="modal-content"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Terms of Use
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                Barangay Online Document Application Guidelines
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div style={{
          padding: '1.5rem',
          overflowY: 'auto',
          fontSize: '0.875rem',
          color: '#334155',
          lineHeight: 1.6
        }}>
          <p style={{ marginBottom: '1rem' }}>
            By submitting an online application via this portal, you agree to the following terms and conditions governed by the Local Government Code of 1991 (RA 7160) and applicable barangay ordinances.
          </p>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '1rem', marginBottom: '0.4rem' }}>
            1. Truthfulness and Accuracy
          </h4>
          <p style={{ marginBottom: '0.75rem' }}>
            The applicant certifies under penalty of law (including perjury under the Revised Penal Code) that all representations, names, residential address details, and declarations are genuine, accurate, and current.
          </p>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '1rem', marginBottom: '0.4rem' }}>
            2. Subject to Physical Verification
          </h4>
          <p style={{ marginBottom: '0.75rem' }}>
            Submitting an online request does not guarantee instant certificate issuance. All applications undergo verification against the Barangay Registry of Inhabitants, blotter records, and Lupon Tagapamayapa case files.
          </p>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '1rem', marginBottom: '0.4rem' }}>
            3. Document Release Protocol
          </h4>
          <p style={{ marginBottom: '0.75rem' }}>
            Certificates and Clearances must be claimed by the applicant in person with a valid government photo ID. If an authorized representative claims the document, a signed Authorization Letter and valid IDs of both parties are strictly required.
          </p>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '1rem', marginBottom: '0.4rem' }}>
            4. Official Government Records Notice
          </h4>
          <p>
            All document requests and application records are submitted directly to the Barangay San Isidro database management system. Submissions are subject to verification under Philippine laws and local barangay ordinances.
          </p>
        </div>

        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: '#f8fafc',
          borderBottomLeftRadius: '0.75rem',
          borderBottomRightRadius: '0.75rem'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.5rem 1.25rem',
              backgroundColor: '#1e40af',
              color: '#ffffff',
              borderRadius: '0.5rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Agree & Close
          </button>
        </div>
      </div>
    </div>
  );
};

