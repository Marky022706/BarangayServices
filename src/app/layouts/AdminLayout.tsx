import React, { useState } from 'react';
import { BarangaySeal, ShieldCheck, LogOut, User, FileText, Menu, X } from '../../components/Icons';

export type StaffTab = 'dashboard' | 'applications';

export interface AdminLayoutProps {
  children: React.ReactNode;
  staffUser: string;
  onLogout: () => void;
  activeTab?: StaffTab;
  onTabChange?: (tab: StaffTab) => void;
  pendingCount?: number;
  totalCount?: number;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  staffUser,
  onLogout,
  activeTab = 'dashboard',
  onTabChange,
  pendingCount = 0,
  totalCount = 0
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSelectTab = (tab: StaffTab) => {
    onTabChange?.(tab);
    setMobileSidebarOpen(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f1f5f9'
      }}
    >
      {/* Staff-only Top Header */}
      <header
        style={{
          backgroundColor: '#0f172a',
          borderBottom: '3px solid #2563eb',
          position: 'sticky',
          top: 0,
          zIndex: 60,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.15)',
          minHeight: '68px',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '100%',
            minHeight: '65px',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxSizing: 'border-box'
          }}
        >
          {/* Left: Mobile Sidebar Toggle + Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="staff-mobile-sidebar-btn"
              aria-label="Toggle Admin Sidebar"
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '0.5rem',
                border: '1px solid #334155',
                backgroundColor: '#1e293b',
                color: '#f8fafc',
                cursor: 'pointer'
              }}
            >
              {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

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
                padding: '0.45rem 0.85rem',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.25)',
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

      {/* Main Body with Left Sidebar + Page Workspace */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Mobile Overlay */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.55)',
              zIndex: 45
            }}
          />
        )}

        {/* Admin Sidebar Navigation - Sticky/Fixed so it does not scroll along with the page */}
        <aside
          className={`staff-sidebar ${mobileSidebarOpen ? 'open' : ''}`}
          aria-label="Admin Navigation Sidebar"
          style={{
            width: '260px',
            backgroundColor: '#0f172a',
            color: '#cbd5e1',
            borderRight: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexShrink: 0,
            padding: '1.5rem 1rem',
            boxSizing: 'border-box',
            zIndex: 50,
            position: 'sticky',
            top: '68px',
            height: 'calc(100vh - 68px)',
            alignSelf: 'flex-start',
            overflowY: 'auto'
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#64748b',
                padding: '0 0.75rem',
                marginBottom: '0.75rem'
              }}
            >
              Administration Menu
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {/* 1. Dashboard Page */}
              <button
                type="button"
                onClick={() => handleSelectTab('dashboard')}
                className="staff-nav-item"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '0.8rem 0.9rem',
                  borderRadius: '0.6rem',
                  border: activeTab === 'dashboard' ? '1px solid #3b82f6' : '1px solid transparent',
                  backgroundColor: activeTab === 'dashboard' ? '#1e3a8a' : 'transparent',
                  color: activeTab === 'dashboard' ? '#ffffff' : '#cbd5e1',
                  fontWeight: activeTab === 'dashboard' ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {/* Bar Chart Icon */}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: activeTab === 'dashboard' ? '#60a5fa' : '#94a3b8', flexShrink: 0 }}
                  >
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                  <span>Dashboard</span>
                </div>
              </button>

              {/* 2. Applications Management Page */}
              <button
                type="button"
                onClick={() => handleSelectTab('applications')}
                className="staff-nav-item"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '0.8rem 0.9rem',
                  borderRadius: '0.6rem',
                  border: activeTab === 'applications' ? '1px solid #3b82f6' : '1px solid transparent',
                  backgroundColor: activeTab === 'applications' ? '#1e3a8a' : 'transparent',
                  color: activeTab === 'applications' ? '#ffffff' : '#cbd5e1',
                  fontWeight: activeTab === 'applications' ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileText
                    size={18}
                    style={{ color: activeTab === 'applications' ? '#60a5fa' : '#94a3b8', flexShrink: 0 }}
                  />
                  <span>Applications</span>
                </div>
                <span
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.55rem',
                    borderRadius: '9999px',
                    backgroundColor: pendingCount > 0 ? '#f59e0b' : '#334155',
                    color: pendingCount > 0 ? '#0f172a' : '#e2e8f0'
                  }}
                  title={pendingCount > 0 ? `${pendingCount} Pending Review` : `${totalCount} Total Applications`}
                >
                  {pendingCount > 0 ? pendingCount : totalCount}
                </span>
              </button>
            </nav>
          </div>

          {/* Bottom Sidebar System Status */}
          <div
            style={{
              padding: '0.75rem 0.85rem',
              backgroundColor: 'rgba(30, 41, 59, 0.65)',
              borderRadius: '0.5rem',
              border: '1px solid #1e293b',
              marginTop: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  display: 'inline-block',
                  boxShadow: '0 0 6px #22c55e'
                }}
              />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f1f5f9' }}>
                System Online
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', lineHeight: 1.35 }}>
              Staff Portal active &amp; connected
            </div>
          </div>
        </aside>

        {/* Staff Dashboard Content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>

      <style>{`
        .staff-logout-btn:hover {
          background-color: rgba(239, 68, 68, 0.22) !important;
          border-color: rgba(239, 68, 68, 0.5) !important;
        }
        .staff-nav-item:hover {
          background-color: rgba(30, 58, 138, 0.55) !important;
          color: #ffffff !important;
        }
        .staff-sidebar::-webkit-scrollbar {
          width: 5px;
        }
        .staff-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        .staff-sidebar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }
        .staff-sidebar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
        @media (min-width: 769px) {
          .staff-sidebar {
            position: sticky !important;
            top: 68px !important;
            height: calc(100vh - 68px) !important;
            align-self: flex-start !important;
            overflow-y: auto !important;
          }
        }
        @media (max-width: 768px) {
          .staff-mobile-sidebar-btn {
            display: inline-flex !important;
          }
          .staff-sidebar {
            position: fixed !important;
            top: 68px !important;
            bottom: 0 !important;
            left: 0 !important;
            height: calc(100vh - 68px) !important;
            transform: translateX(-100%);
            transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            overflow-y: auto !important;
          }
          .staff-sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export const StaffLayout = AdminLayout;
export type { AdminLayoutProps as StaffLayoutProps };
