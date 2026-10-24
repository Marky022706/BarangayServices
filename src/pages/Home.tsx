import React, { useState, useEffect } from 'react';
import { ServiceCard } from '../components/ServiceCard';
import type { DocumentType, ServiceInfo } from '../types';
import { servicesApi } from '../services/api';
import { 
  ArrowRight, 
  ArrowUp,
  Search, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  BarangaySeal, 
  FileCheck
} from '../components/Icons';
import { ScrollReveal } from '../components/ScrollReveal';
import { CardSkeleton } from '../components/SkeletonLoader';

interface HomeProps {
  onNavigate: (path: string, param?: string) => void;
  onApplyService: (serviceId: DocumentType) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, onApplyService }) => {
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState<boolean>(true);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  useEffect(() => {
    setIsLoadingServices(true);
    servicesApi.getAll().then((data) => {
      setServices(data || []);
    }).catch((err) => {
      console.error('Failed to load live services from MySQL:', err);
      setServices([]);
    }).finally(() => {
      setIsLoadingServices(false);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  return (
    <div className="home-page" style={{ width: '100%', minHeight: '100%' }}>
      {/* Hero Section — Full Viewport Screen with Scrolling Barangay Hall Background */}
      <section
        className="hero-section"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(15, 23, 42, 0.78) 0%, rgba(30, 58, 138, 0.68) 50%, rgba(15, 23, 42, 0.84) 100%), url("/barangay-hall.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'scroll',
          backgroundRepeat: 'no-repeat',
          color: '#ffffff',
          minHeight: 'calc(100vh - 68px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '2.5rem 1.5rem 3.5rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid #1e40af',
          boxSizing: 'border-box'
        }}
      >
        {/* Subtle decorative background circles */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0) 70%)',
            pointerEvents: 'none'
          }}
        />

        <div
          style={{
            maxWidth: '1280px',
            width: '100%',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: '3rem',
            position: 'relative',
            zIndex: 1
          }}
          className="hero-two-column"
        >
          {/* Left Column: Text & CTAs */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#93c5fd',
                marginBottom: '1.25rem'
              }}
            >
              <BarangaySeal className="w-4 h-4" />
              <span>Official Citizen Service Window</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.1rem, 4.5vw, 3.25rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                color: '#ffffff',
                marginBottom: '1.25rem',
                letterSpacing: '-0.5px'
              }}
            >
              Barangay Services Made Easier
            </h1>

            <p
              style={{
                fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
                lineHeight: 1.6,
                color: '#cbd5e1',
                marginBottom: '2.25rem',
                maxWidth: '540px'
              }}
            >
              Request your barangay documents online through a simple and convenient application process.
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                alignItems: 'center'
              }}
            >
              <button
                type="button"
                onClick={() => onNavigate('/apply')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.875rem 1.75rem',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)',
                  transition: 'background-color 0.15s ease, transform 0.1s ease'
                }}
                className="hero-btn-primary"
              >
                <span>Apply for a Document</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/track')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.875rem 1.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '1rem',
                  borderRadius: '0.5rem',
                  border: '1.5px solid rgba(255, 255, 255, 0.25)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease'
                }}
                className="hero-btn-secondary"
              >
                <Search className="w-4 h-4 text-blue-300" />
                <span>Track Application</span>
              </button>
            </div>

            {/* Quick Benefits Badges */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.875rem',
                marginTop: '2.5rem',
                paddingTop: '1.75rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '0.85rem'
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  color: '#ffffff',
                  fontWeight: 600
                }}
              >
                <CheckCircle2 className="w-4 h-4" style={{ color: '#4ade80' }} />
                <span>No Long Queues</span>
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  color: '#ffffff',
                  fontWeight: 600
                }}
              >
                <Clock className="w-4 h-4" style={{ color: '#93c5fd' }} />
                <span>24/7 Online Filing</span>
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  color: '#ffffff',
                  fontWeight: 600
                }}
              >
                <ShieldCheck className="w-4 h-4" style={{ color: '#67e8f9' }} />
                <span>DILG & RA 11032 Compliant</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-fidelity document illustration card */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            {/* Visual Document Showcase Card */}
            <div
              style={{
                width: '100%',
                maxWidth: '430px',
                backgroundColor: '#ffffff',
                borderRadius: '1rem',
                padding: '1.75rem',
                color: '#0f172a',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                border: '1px solid #e2e8f0',
                position: 'relative'
              }}
            >
              {/* Document Header Preview */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                  <BarangaySeal className="w-12 h-12" />
                </div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
                  Republic of the Philippines
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a', letterSpacing: '0.5px' }}>
                  OFFICE OF THE PUNONG BARANGAY
                </div>
                <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, marginTop: '0.25rem' }}>
                  ✓ Official e-Document Request
                </div>
              </div>

              {/* Sample Card Summary Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ backgroundColor: '#f0f9ff', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #bae6fd' }}>
                  <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600 }}>Available Document</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0c4a6e' }}>Barangay Clearance & Residency</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Processing</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>1-2 Work Days</div>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Status Tracking</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#16a34a' }}>Real-Time SMS/Web</div>
                  </div>
                </div>

                {/* Step Flow Preview */}
                <div style={{ marginTop: '0.5rem', padding: '0.875rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px dashed #cbd5e1' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                    Step-by-Step Experience (PSAHelpline Inspired)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>1. Document</span>
                    <span>→</span>
                    <span style={{ color: '#2563eb', fontWeight: 700 }}>2. Info</span>
                    <span>→</span>
                    <span>3. Review</span>
                    <span>→</span>
                    <span>4. Claim</span>
                  </div>
                </div>
              </div>

              {/* Verified Ribbon Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.3rem 0.75rem',
                  borderRadius: '9999px',
                  boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Portal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator button to Services */}
        <div
          onClick={() => {
            const el = document.getElementById('services');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.2rem',
            color: '#93c5fd',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            opacity: 0.85,
            zIndex: 2,
            userSelect: 'none',
            transition: 'opacity 0.2s ease, transform 0.2s ease'
          }}
          className="hero-scroll-btn"
        >
          <span>Explore Services</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: 'bounceSlow 1.8s infinite' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* Available Services Section — Full Viewport Screen */}
      <section
        id="services"
        style={{
          minHeight: 'calc(100vh - 68px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '3rem 1.5rem',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          boxSizing: 'border-box',
          scrollMarginTop: '68px'
        }}
      >
        <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
          {/* Section Heading */}
          <ScrollReveal>
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.25rem auto' }}>
              <div
                style={{
                  display: 'inline-block',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#1d4ed8',
                  backgroundColor: '#eff6ff',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                Document Issuance
              </div>
              <h2
                style={{
                  fontSize: 'clamp(1.75rem, 3vw, 2.35rem)',
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.25,
                  marginBottom: '0.5rem'
                }}
              >
                Available Barangay Documents
              </h2>
              <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Select a certificate or clearance below to begin your fast and organized online application.
              </p>
            </div>
          </ScrollReveal>

          {/* 3 Services Cards Grid ONLY */}
          {isLoadingServices ? (
            <CardSkeleton count={3} />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
                gap: '1.75rem'
              }}
            >
              {services.map((service, index) => (
                <ScrollReveal key={service.id} delayMs={index * 120}>
                  <ServiceCard
                    service={service}
                    onApply={(id) => onApplyService(id)}
                  />
                </ScrollReveal>
              ))}
            </div>
          )}

          {/* Note below cards */}
          <div
            style={{
              marginTop: '2rem',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '0.75rem',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              maxWidth: '820px',
              margin: '2rem auto 0 auto'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#dbeafe',
                color: '#1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FileCheck className="w-5 h-5" />
            </div>
            <div style={{ fontSize: '0.875rem', color: '#1e3a8a', lineHeight: 1.45 }}>
              <strong>Need a different barangay certificate?</strong> Please visit the Barangay Hall Public Assistance and Complaints Desk (PACD) during official office hours for specialized certifications.
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section — Full Viewport Screen */}
      <section
        style={{
          minHeight: 'calc(100vh - 68px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '3.5rem 1.5rem',
          backgroundColor: '#ffffff',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
            <div
              style={{
                display: 'inline-block',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#15803d',
                backgroundColor: '#f0fdf4',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Simple Process
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.35rem)',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.25,
                marginBottom: '0.75rem'
              }}
            >
              How It Works
            </h2>
            <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.6 }}>
              Follow these three simple steps to submit your request and track its progress until document claiming.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2.5rem',
              position: 'relative'
            }}
          >
            {/* Step 1 */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: '0.875rem',
                padding: '2.25rem 1.75rem',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#1e40af',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  margin: '0 auto 1.5rem auto',
                  boxShadow: '0 4px 6px rgba(30, 64, 175, 0.25)'
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                Choose Your Document
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#475569', lineHeight: 1.55 }}>
                Select from Barangay Clearance, Certificate of Indigency, or Certificate of Residency based on your current requirements.
              </p>
            </div>

            {/* Step 2 */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: '0.875rem',
                padding: '2.25rem 1.75rem',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  margin: '0 auto 1.5rem auto',
                  boxShadow: '0 4px 6px rgba(37, 99, 235, 0.25)'
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                Fill Out the Application
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#475569', lineHeight: 1.55 }}>
                Enter your personal information, address, and purpose in an organized step-by-step form inspired by PSAHelpline.
              </p>
            </div>

            {/* Step 3 */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: '0.875rem',
                padding: '2.25rem 1.75rem',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  margin: '0 auto 1.5rem auto',
                  boxShadow: '0 4px 6px rgba(22, 163, 74, 0.25)'
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                Track Your Request
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#475569', lineHeight: 1.55 }}>
                Receive an official reference number to check application verification and know immediately when your document is ready for claiming.
              </p>
            </div>
          </div>

          {/* Call to action bar */}
          <div
            style={{
              marginTop: '4rem',
              backgroundColor: '#0f172a',
              borderRadius: '1rem',
              padding: '2.5rem 2rem',
              color: '#ffffff',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                Ready to submit your document request?
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0 }}>
                Average online application time is under 3 minutes.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => onNavigate('/apply')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>Start Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Back to Home / Top Arrow Button */}
      <button
        type="button"
        onClick={handleScrollToTop}
        className="back-to-home-btn"
        aria-label="Back to top of Home"
        title="Back to Home"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 90,
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: '#2563eb',
          backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: '#ffffff',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.45), 0 4px 8px -2px rgba(15, 23, 42, 0.2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: showBackToTop ? 1 : 0,
          visibility: showBackToTop ? 'visible' : 'hidden',
          transform: showBackToTop ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: showBackToTop ? 'auto' : 'none'
        }}
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      <style>{`
        @keyframes bounceSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(6px);
          }
        }
        .hero-scroll-btn:hover {
          opacity: 1 !important;
          color: #ffffff !important;
          transform: translateX(-50%) translateY(2px) !important;
        }
        .back-to-home-btn:hover {
          transform: translateY(-4px) scale(1.08) !important;
          box-shadow: 0 12px 28px -4px rgba(37, 99, 235, 0.65), 0 6px 12px -2px rgba(15, 23, 42, 0.25) !important;
          background-image: linear-gradient(135deg, #60a5fa 0%, #1e40af 100%) !important;
        }
        .back-to-home-btn:active {
          transform: translateY(0) scale(0.96) !important;
        }
      `}</style>
    </div>
  );
};
