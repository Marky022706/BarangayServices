import React, { useState } from 'react';
import { BarangaySeal, MapPin, Phone, Mail, Clock, ShieldCheck, FileText } from '../Icons';
import { PrivacyModal } from '../modals/PrivacyModal';
import { TermsModal } from '../modals/TermsModal';
import { ScrollReveal } from '../ScrollReveal';

interface FooterProps {
  onNavigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <>
      <footer
        className="main-footer no-print"
        style={{
          backgroundColor: '#0f172a',
          color: '#cbd5e1',
          borderTop: '4px solid #1d4ed8',
          marginTop: 'auto'
        }}
      >
        {/* Main Footer Info Grid */}
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '3.5rem 1.5rem 2rem 1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2.5rem'
          }}
        >
          {/* Column 1: Identity & Description */}
          <ScrollReveal variant="fade-up" delayMs={0}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #f59e0b',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}
                >
                  <BarangaySeal size={38} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
                    Barangay e-Services
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#93c5fd', margin: 0, textTransform: 'uppercase' }}>
                    Community Public Document Portal
                  </p>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#94a3b8', marginBottom: '1.25rem' }}>
                A modernized digital service portal empowering residents to apply, track, and receive vital community documents efficiently from the comfort of their homes.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                <span>Portal System Active • Phase 1 Frontend</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Column 2: Document Services Quick Links */}
          <ScrollReveal variant="fade-up" delayMs={100}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.25rem' }}>
                Online Services
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('/apply?document=clearance')}
                    style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, textAlign: 'left', transition: 'color 0.15s ease' }}
                    className="footer-link"
                  >
                    Barangay Clearance Application
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('/apply?document=indigency')}
                    style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, textAlign: 'left', transition: 'color 0.15s ease' }}
                    className="footer-link"
                  >
                    Certificate of Indigency
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('/apply?document=residency')}
                    style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, textAlign: 'left', transition: 'color 0.15s ease' }}
                    className="footer-link"
                  >
                    Certificate of Residency
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('/track')}
                    style={{ background: 'none', border: 'none', color: '#93c5fd', fontWeight: 600, cursor: 'pointer', padding: 0, textAlign: 'left' }}
                    className="footer-link"
                  >
                    Track Application Status →
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('/help')}
                    style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, textAlign: 'left', transition: 'color 0.15s ease' }}
                    className="footer-link"
                  >
                    Help, Requirements &amp; FAQs
                  </button>
                </li>
              </ul>
            </div>
          </ScrollReveal>

          {/* Column 3: Contact Placeholders */}
          <ScrollReveal variant="fade-up" delayMs={200}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.25rem' }}>
                Barangay Hall Information
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                  <MapPin size={15} style={{ flexShrink: 0, marginTop: '2px', color: '#60a5fa' }} />
                  <span>
                    <strong style={{ color: '#ffffff', display: 'block' }}>Barangay Hall (Placeholder)</strong>
                    Community Government Center, Main Street, Philippines
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <Phone size={15} style={{ flexShrink: 0, color: '#60a5fa' }} />
                  <span>Hotline: (02) 8000-0000 / 0917-000-0000</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <Mail size={15} style={{ flexShrink: 0, color: '#60a5fa' }} />
                  <span>Email: contact@barangay-sample.gov.ph</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Column 4: Office Hours & Governance */}
          <ScrollReveal variant="fade-up" delayMs={300}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.25rem' }}>
                Office Hours & Assistance
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                  <Clock size={15} style={{ flexShrink: 0, marginTop: '2px', color: '#34d399' }} />
                  <div>
                    <span style={{ color: '#ffffff', fontWeight: 600, display: 'block' }}>
                      Monday – Friday
                    </span>
                    <span style={{ color: '#94a3b8' }}>8:00 AM – 5:00 PM (No Noon Break)</span>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginTop: '2px' }}>
                      Closed on Saturdays, Sundays & Official Holidays
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#1e293b', borderRadius: '0.5rem', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '0.75rem', color: '#e2e8f0', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Document Releasing Window
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                    Window 2 (Public Assistance & Clearances Section)
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Bottom Bar: Legal, Privacy & Disclaimer */}
        <div
          style={{
            borderTop: '1px solid #1e293b',
            backgroundColor: '#090d16',
            padding: '1.25rem 1.5rem',
            fontSize: '0.8rem',
            color: '#64748b'
          }}
        >
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}
          >
            <div>
              <span>© {new Date().getFullYear()} Barangay e-Services System. All rights reserved.</span>
              <span style={{ marginLeft: '0.5rem', color: '#475569' }}>
                Republic of the Philippines
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setPrivacyOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                className="footer-legal-link"
              >
                <ShieldCheck size={14} />
                <span>Privacy Notice</span>
              </button>

              <button
                type="button"
                onClick={() => setTermsOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                className="footer-legal-link"
              >
                <FileText size={14} />
                <span>Terms of Use</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
    </>
  );
};

