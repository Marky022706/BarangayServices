import React, { useState } from 'react';

interface StaffLoginGateProps {
  onAuthenticated: () => void;
}

import { authApi } from '../services/api';
import { BarangaySeal, ShieldCheck } from './Icons';

export const StaffLoginGate: React.FC<StaffLoginGateProps> = ({ onAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setError('');
    setIsLoading(true);
    setIsSuccess(false);

    const startTime = Date.now();

    try {
      await authApi.login({
        username: username.trim(),
        password
      });

      // Maintain visible loading animation for at least 650ms for smooth feedback
      const elapsed = Date.now() - startTime;
      if (elapsed < 650) {
        await new Promise((resolve) => setTimeout(resolve, 650 - elapsed));
      }

      setIsSuccess(true);
      // Brief pause to show the successful authentication transition
      await new Promise((resolve) => setTimeout(resolve, 450));
      onAuthenticated();
    } catch (err: any) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 400) {
        await new Promise((resolve) => setTimeout(resolve, 400 - elapsed));
      }
      setError(err.message || 'Incorrect username or password.');
      setIsLoading(false);
      setIsSuccess(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Header with Official Logo at the Top */}
      <header
        style={{
          width: '100%',
          backgroundColor: '#0f172a',
          borderBottom: '3px solid #2563eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
          padding: '0.875rem 2rem',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '2px solid #f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)'
            }}
          >
            <BarangaySeal size={38} />
          </div>

          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
              Barangay e-Services
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: '#f59e0b',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <ShieldCheck size={12} style={{ color: '#f59e0b' }} />
              <span>Staff Management Portal</span>
            </div>
          </div>
        </div>

        <a
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '0.8rem',
            fontWeight: 500,
            padding: '0.45rem 0.85rem',
            borderRadius: '0.375rem',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid #334155',
            transition: 'all 0.15s ease'
          }}
          className="staff-back-link"
        >
          <span>&larr;</span>
          <span>Return to Public Portal</span>
        </a>
      </header>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1.5rem',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ width: '100%', maxWidth: '380px' }}>

          {/* Login Card */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: '#1e293b',
              borderRadius: '0.875rem',
              padding: '1.85rem 1.75rem',
              border: '1px solid #334155',
              boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)'
            }}
          >
            {/* Animated Indeterminate Progress Bar on Card Top during loading */}
            {isLoading && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  backgroundColor: 'rgba(37, 99, 235, 0.2)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: '50%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, #38bdf8, #2563eb, transparent)',
                    borderRadius: '9999px',
                    animation: 'indeterminateProgress 1.2s ease-in-out infinite'
                  }}
                />
              </div>
            )}

            {/* Logo at the top of the card */}
            <div style={{ textAlign: 'center', marginBottom: '1.35rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '2.5px solid #f59e0b',
                  marginBottom: '0.75rem',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)'
                }}
              >
                <BarangaySeal size={50} />
              </div>
              <div
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: '#f1f5f9',
                  marginBottom: '0.2rem'
                }}
              >
                Authorized Staff Login
              </div>
              <div
                style={{
                  fontSize: '0.73rem',
                  color: '#64748b'
                }}
              >
                Barangay Personnel Only — Restricted Access
              </div>
            </div>

          {/* Error */}
          {error && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.55rem 0.75rem',
                backgroundColor: 'rgba(220, 38, 38, 0.12)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                borderRadius: '0.375rem',
                color: '#f87171',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span style={{ fontSize: '0.9rem' }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            {/* Username */}
            <div style={{ marginBottom: '0.875rem' }}>
              <label
                htmlFor="staff-username"
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#94a3b8',
                  marginBottom: '0.3rem'
                }}
              >
                Username
              </label>
              <input
                id="staff-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading || isSuccess}
                placeholder="Enter username"
                required
                autoComplete="username"
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  backgroundColor: '#0f172a',
                  border: '1.5px solid #334155',
                  borderRadius: '0.375rem',
                  color: '#f1f5f9',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  opacity: (isLoading || isSuccess) ? 0.7 : 1,
                  transition: 'border-color 0.15s ease'
                }}
                className="staff-input-focus"
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="staff-password"
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#94a3b8',
                  marginBottom: '0.3rem'
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="staff-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isSuccess}
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '0.55rem 2.25rem 0.55rem 0.75rem',
                    backgroundColor: '#0f172a',
                    border: '1.5px solid #334155',
                    borderRadius: '0.375rem',
                    color: '#f1f5f9',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    opacity: (isLoading || isSuccess) ? 0.7 : 1,
                    transition: 'border-color 0.15s ease'
                  }}
                  className="staff-input-focus"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isSuccess}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: (isLoading || isSuccess) ? 'not-allowed' : 'pointer',
                    padding: '2px',
                    fontSize: '11px',
                    lineHeight: 1
                  }}
                  aria-label={showPassword ? 'Hide' : 'Show'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="staff-login-btn"
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                backgroundColor: isSuccess ? '#16a34a' : isLoading ? '#1d4ed8' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.4rem',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: (isLoading || isSuccess) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isSuccess
                  ? '0 0 16px rgba(22, 163, 74, 0.45)'
                  : isLoading
                  ? '0 0 16px rgba(37, 99, 235, 0.45)'
                  : '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}
            >
              {isSuccess ? (
                <>
                  <svg
                    style={{ width: '16px', height: '16px', flexShrink: 0 }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Access Granted — Entering Portal…</span>
                </>
              ) : isLoading ? (
                <>
                  <svg
                    style={{
                      width: '16px',
                      height: '16px',
                      animation: 'spin 0.75s linear infinite',
                      flexShrink: 0
                    }}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="rgba(255, 255, 255, 0.25)"
                      strokeWidth="3"
                    />
                    <path
                      d="M12 3a9 9 0 0 1 9 9"
                      stroke="#ffffff"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>Authenticating credentials…</span>
                </>
              ) : (
                <>
                  <svg
                    style={{ width: '15px', height: '15px', flexShrink: 0 }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Official Security Notice */}
        <div
          style={{
            marginTop: '1rem',
            padding: '0.625rem 0.875rem',
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '0.4rem',
            fontSize: '0.73rem',
            color: '#86efac',
            lineHeight: 1.5
          }}
        >
          <strong style={{ color: '#4ade80' }}>Secured System:</strong>{' '}
          Session authenticated against the live MySQL database with bcrypt security.
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.68rem', color: '#334155' }}>
          Unauthorized access is prohibited under R.A. 8792.
        </div>
      </div>
    </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes indeterminateProgress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(200%); }
        }
        .staff-back-link:hover {
          color: #ffffff !important;
          border-color: #64748b !important;
          background-color: rgba(255, 255, 255, 0.08) !important;
        }
        .staff-login-btn:hover:not(:disabled) {
          background-color: #1d4ed8 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35) !important;
        }
        .staff-login-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .staff-input-focus:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
        }
      `}</style>
    </div>
  );
};
