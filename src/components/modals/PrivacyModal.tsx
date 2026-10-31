import React from 'react';
import { X, ShieldCheck } from '../Icons';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
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
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Data Privacy Notice
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                Compliance with Republic Act No. 10173 (Data Privacy Act of 2012)
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
            The <strong>Barangay e-Services Portal</strong> is committed to safeguarding your personal data in accordance with <strong>Republic Act No. 10173</strong>, otherwise known as the Philippine Data Privacy Act of 2012.
          </p>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '1rem', marginBottom: '0.4rem' }}>
            1. Collection of Personal Data
          </h4>
          <p style={{ marginBottom: '0.75rem' }}>
            We collect personal information necessary for document issuance, including your legal name, date of birth, place of birth, residential address, contact number, civil status, and specific purpose of request.
          </p>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '1rem', marginBottom: '0.4rem' }}>
            2. Purpose of Processing
          </h4>
          <p style={{ marginBottom: '0.75rem' }}>
            Your information will strictly be processed by authorized Barangay personnel solely for verifying residency, cross-checking community records (Lupon Tagapamayapa records), and issuing authentic official certifications.
          </p>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '1rem', marginBottom: '0.4rem' }}>
            3. Data Retention and Security
          </h4>
          <p style={{ marginBottom: '0.75rem' }}>
            Application records are retained in compliance with local government archiving guidelines and protected against unauthorized access, disclosure, or alteration.
          </p>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '1rem', marginBottom: '0.4rem' }}>
            4. Resident Rights
          </h4>
          <p>
            As a data subject, you have the right to be informed, access your submitted data, object to processing, and rectify inaccurate details by contacting the Barangay Data Protection Officer.
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
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

