import React from 'react';
import { BarangaySeal, ShieldCheck, LogOut, User } from './Icons';

interface StaffLayoutProps {
  children: React.ReactNode;
  staffUser: string;
  onLogout: () => void;
}

export const StaffLayout: React.FC<StaffLayoutProps> = ({ children, staffUser, onLogout }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f1f5f9'
      }}
    >
      {/* Staff-only header — completely separate from public Navbar */}
      <header
        style={{
          backgroundColor: '#0f172a',
          borderBottom: '3px solid #2563eb',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.15)'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '100%',
            padding: '0.875rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxSizing: 'border-box'
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
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
              <BarangaySeal size={34} />
            </div>

            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                Barangay e-Services
              </div>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: '#f59e0b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <ShieldCheck size={12} style={{ color: '#f59e0b' }} />
                <span>Staff Management Portal</span>
              </div>
            </div>
          </div>

          {/* Right: Session Info + Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#93c5fd'
                }}
              >
                <User size={16} style={{ color: '#93c5fd' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                  {staffUser}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  Barangay Official / Staff
                </div>
              </div>
            </div>

            <div
              style={{
                width: '1px',
                height: '32px',
                backgroundColor: '#334155'
              }}
            />

            <button
              type="button"
              onClick={onLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              className="staff-logout-btn"
              title="Sign out of Staff Portal"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Staff Dashboard Content */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      <style>{`
        .staff-logout-btn:hover {
          background-color: rgba(239, 68, 68, 0.2) !important;
          border-color: rgba(239, 68, 68, 0.5) !important;
        }
      `}</style>
    </div>
  );
};
