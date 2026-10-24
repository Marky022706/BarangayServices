import React from 'react';
import type { ApplicationRecord } from '../types';
import { BarangaySeal, Printer, X } from './Icons';

interface CertificatePrintViewProps {
  application: ApplicationRecord;
  onClose: () => void;
}

export const CertificatePrintView: React.FC<CertificatePrintViewProps> = ({
  application,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const fullName = `${application.personalInfo.firstName} ${
    application.personalInfo.middleName ? application.personalInfo.middleName + ' ' : ''
  }${application.personalInfo.lastName} ${application.personalInfo.suffix || ''}`.trim().toUpperCase();

  const completeAddress = [
    application.personalInfo.houseStreet,
    application.personalInfo.purokSitio,
    application.personalInfo.barangay,
    application.personalInfo.cityMunicipality,
    application.personalInfo.province
  ].filter(Boolean).join(', ');

  const formattedDate = new Date().toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const statedPurpose = (
    application.details.purpose === 'Other' 
      ? application.details.otherPurpose 
      : application.details.purpose
  ) || 'LEGAL PURPOSES';

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
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
          maxWidth: '840px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden'
        }}
      >
        {/* Top Control Bar (Hidden during window.print) */}
        <div
          className="no-print"
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e293b'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 700 }}>
            <BarangaySeal className="w-5 h-5" />
            <span>Official Document Preview & Printable Certificate</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.375rem',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <Printer className="w-4 h-4" />
              <span>Print Certificate</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.25rem'
              }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Page */}
        <div
          style={{
            padding: '2.5rem',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            fontFamily: "'Times New Roman', Times, serif",
            color: '#000000',
            lineHeight: 1.6,
            position: 'relative'
          }}
          className="print-area"
        >
          {/* Faint Watermark Seal */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.05,
              pointerEvents: 'none',
              width: '380px',
              height: '380px'
            }}
          >
            <BarangaySeal className="w-full h-full" />
          </div>

          {/* Official Document Border */}
          <div
            style={{
              border: '3px double #1e3a8a',
              padding: '2rem',
              position: 'relative',
              minHeight: '650px'
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <BarangaySeal className="w-16 h-16" />
              </div>
              <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Republic of the Philippines
              </div>
              <div style={{ fontSize: '0.9rem', textTransform: 'uppercase' }}>
                Province of {application.personalInfo.province}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                City of {application.personalInfo.cityMunicipality}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e3a8a', textTransform: 'uppercase', marginTop: '0.25rem' }}>
                OFFICE OF THE PUNONG BARANGAY
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                {application.personalInfo.barangay}
              </div>

              {application.controlNumber && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    color: '#991b1b',
                    fontFamily: 'monospace'
                  }}
                >
                  CTRL NO: {application.controlNumber}
                </div>
              )}
            </div>

            <div style={{ height: '2px', backgroundColor: '#1e3a8a', marginBottom: '2rem' }} />

            {/* Document Specific Title */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 'bold',
                  letterSpacing: '1.5px',
                  color: '#1e3a8a',
                  textTransform: 'uppercase',
                  textDecoration: 'underline',
                  margin: 0
                }}
              >
                {application.documentType === 'clearance' && 'BARANGAY CLEARANCE'}
                {application.documentType === 'indigency' && 'CERTIFICATE OF INDIGENCY'}
                {application.documentType === 'residency' && 'CERTIFICATE OF RESIDENCY'}
              </h2>
            </div>

            {/* Salutation */}
            <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '1.25rem' }}>
              TO WHOM IT MAY CONCERN:
            </div>

            {/* Body Paragraphs */}
            <div style={{ fontSize: '1.05rem', textAlign: 'justify', textIndent: '2.5rem', marginBottom: '1.5rem' }}>
              {application.documentType === 'clearance' && (
                <>
                  <p style={{ marginBottom: '1.25rem' }}>
                    THIS IS TO CERTIFY that <strong>{fullName}</strong>, of legal age, {application.personalInfo.civilStatus.toLowerCase()}, and a bonafide resident of <strong>{completeAddress}</strong>, has been verified through our community and Lupon records.
                  </p>
                  <p style={{ marginBottom: '1.25rem' }}>
                    FURTHER CERTIFIES that the above-named person has NO DEROGATORY RECORD filed in this office, is of good moral standing in the community, and has not violated any barangay ordinance or criminal statute within our jurisdiction.
                  </p>
                </>
              )}

              {application.documentType === 'indigency' && (
                <>
                  <p style={{ marginBottom: '1.25rem' }}>
                    THIS IS TO CERTIFY that <strong>{fullName}</strong>, of legal age, {application.personalInfo.civilStatus.toLowerCase()}, is a permanent resident of <strong>{completeAddress}</strong>.
                  </p>
                  <p style={{ marginBottom: '1.25rem' }}>
                    BASED ON COMMUNITY RECORDS, the above-named person belongs to the indigent or low-income household in this Barangay and is seeking financial or institutional aid for: <strong>{statedPurpose.toUpperCase()}</strong>.
                  </p>
                </>
              )}

              {application.documentType === 'residency' && (
                <>
                  <p style={{ marginBottom: '1.25rem' }}>
                    THIS IS TO CERTIFY that <strong>{fullName}</strong>, of legal age, {application.personalInfo.civilStatus.toLowerCase()}, is a bonafide resident continuously living at <strong>{completeAddress}</strong> for approximately <strong>{application.details.lengthOfResidency || 'several years'}</strong>.
                  </p>
                  <p style={{ marginBottom: '1.25rem' }}>
                    THIS CERTIFICATION is issued to confirm resident status and good community standing.
                  </p>
                </>
              )}

              <p style={{ marginBottom: '1.5rem' }}>
                THIS CERTIFICATION is being issued upon the request of the interested party for the purpose of <strong>{statedPurpose.toUpperCase()}</strong> and for whatever legal intent it may serve.
              </p>

              <p>
                GIVEN AND ISSUED this <strong>{formattedDate}</strong> at the Office of the Punong Barangay, {application.personalInfo.barangay}, {application.personalInfo.cityMunicipality}, {application.personalInfo.province}.
              </p>
            </div>

            {/* Signature & Seal Block */}
            <div style={{ marginTop: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              {/* Left: Applicant Signature */}
              <div style={{ textAlign: 'center', width: '220px' }}>
                <div style={{ height: '40px' }} />
                <div style={{ borderTop: '1px solid #000000', paddingTop: '0.25rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  Signature of Applicant
                </div>
                <div style={{ fontSize: '0.75rem', color: '#555555' }}>
                  Right Thumbmark / ID verified
                </div>
              </div>

              {/* Right: Punong Barangay */}
              <div style={{ textAlign: 'center', width: '260px' }}>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  HON. HONORIO A. REYES
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  Punong Barangay
                </div>
                <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#555555', marginTop: '0.25rem' }}>
                  Barangay San Jose, QC
                </div>
              </div>
            </div>

            {/* Bottom official footer */}
            <div style={{ marginTop: '2rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: '#666666' }}>
              <span>Doc Ref: {application.referenceNumber}</span>
              <span>Not valid without official dry seal</span>
              <span>Barangay e-Services Portal Official Record</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
