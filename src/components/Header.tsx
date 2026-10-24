import React from 'react';
import { IconSeal, IconHome, IconUserAdmin } from './Icons';
import type { ResidentProfile } from '../types';

interface HeaderProps {
  activeTab: 'resident' | 'admin';
  setActiveTab: (tab: 'resident' | 'admin') => void;
  resident: ResidentProfile;
  pendingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  resident,
  pendingCount,
}) => {
  return (
    <header className="header-bg no-print">
      <div className="header-inner">
        <div className="brand-section">
          <div className="seal-icon-circle">
            <IconSeal className="w-8 h-8" />
          </div>
          <div>
            <h1 className="brand-title">Barangay San Isidro</h1>
            <p className="brand-subtitle">Official e-Government Services Portal</p>
          </div>
        </div>

        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'resident' ? 'active' : ''}`}
            onClick={() => setActiveTab('resident')}
          >
            <IconHome className="w-4 h-4" />
            <span>Resident Portal</span>
          </button>
          
          <button
            className={`nav-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <IconUserAdmin className="w-4 h-4" />
            <span>Admin Portal</span>
            {pendingCount > 0 && (
              <span style={{
                background: '#ef4444',
                color: '#ffffff',
                borderRadius: '9999px',
                padding: '0.1rem 0.45rem',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {pendingCount}
              </span>
            )}
          </button>
        </nav>

        <div className="user-badge">
          <div className="user-avatar">
            {activeTab === 'admin' ? 'AD' : resident.fullName.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#ffffff', lineHeight: 1.2 }}>
              {activeTab === 'admin' ? 'Barangay Admin Office' : resident.fullName}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#93c5fd' }}>
              {activeTab === 'admin' ? 'Administrator Mode' : 'Verified Resident'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
