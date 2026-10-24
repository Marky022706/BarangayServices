import React, { useState } from 'react';
import { BarangaySeal, Menu, X, ArrowRight } from './Icons';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string, param?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/#services' },
    { label: 'Track Application', path: '/track' },
  ];

  const handleLinkClick = (path: string) => {
    setMobileMenuOpen(false);
    if (path.startsWith('/#')) {
      if (currentPath !== '/') {
        onNavigate('/');
        setTimeout(() => {
          const el = document.getElementById(path.replace('/#', ''));
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        const el = document.getElementById(path.replace('/#', ''));
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      className="navbar-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#0f172a',
        borderBottom: '3px solid #2563eb',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Brand Emblem & Name */}
        <div
          onClick={() => handleLinkClick('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
            cursor: 'pointer'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #f59e0b',
              boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            <BarangaySeal size={40} />
          </div>
          <div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '0.5px',
                lineHeight: 1.2
              }}
            >
              Barangay e-Services
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: '#93c5fd',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                fontWeight: 500
              }}
            >
              Online Document Request Portal
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1.75rem'
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.label}
                type="button"
                onClick={() => handleLinkClick(link.path)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isActive ? '#60a5fa' : '#e2e8f0',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.925rem',
                  cursor: 'pointer',
                  padding: '0.5rem 0.25rem',
                  position: 'relative',
                  transition: 'color 0.15s ease'
                }}
                className="nav-link-btn"
              >
                {link.label}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      backgroundColor: '#60a5fa',
                      borderRadius: '2px'
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action: Apply Button only (Staff Portal is hidden at /staff) */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1rem' }} className="desktop-actions">
          <button
            type="button"
            onClick={() => onNavigate('/apply')}
            style={{
              padding: '0.55rem 1.1rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              borderRadius: '0.5rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              boxShadow: '0 2px 4px rgba(37,99,235,0.3)',
              transition: 'background-color 0.15s ease'
            }}
          >
            <span>Apply Now</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-menu-toggle"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            color: '#ffffff',
            padding: '0.5rem',
            cursor: 'pointer'
          }}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#1e293b',
            borderTop: '1px solid #334155',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
          className="mobile-dropdown-menu"
        >
          {navLinks.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => handleLinkClick(link.path)}
              style={{
                textAlign: 'left',
                background: 'none',
                border: 'none',
                color: currentPath === link.path ? '#60a5fa' : '#e2e8f0',
                padding: '0.625rem 0',
                fontSize: '1rem',
                fontWeight: currentPath === link.path ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {link.label}
            </button>
          ))}

          <div style={{ height: '1px', backgroundColor: '#334155', margin: '0.5rem 0' }} />

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('/apply');
            }}
            style={{
              padding: '0.75rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              borderRadius: '0.5rem',
              fontWeight: 600,
              fontSize: '0.925rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span>Apply for a Document</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>
      )}
    </header>
  );
};
