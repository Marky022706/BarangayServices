import React, { useState, useRef } from 'react';
import { authService as authApi } from '../services/authService';
import type { AuthUserResponse } from '../types/auth.types';
import { BarangaySeal, ShieldCheck, AlertCircle } from '../../../components/Icons';

interface StaffLoginGateProps {
  onAuthenticated: (user?: AuthUserResponse, fromSuccessfulLogin?: boolean) => void;
}

export const StaffLoginGate: React.FC<StaffLoginGateProps> = ({ onAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const usernameInputRef = useRef<HTMLInputElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const validateUsernameField = (rawVal: string): string => {
    const val = rawVal.trim();
    if (!val) {
      return 'Please enter your email or username.';
    }
    if (val.length < 3) {
      return 'Username or email must be at least 3 characters long.';
    }
    if (val.length > 80) {
      return 'Username or email cannot exceed 80 characters.';
    }
    if (val.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) {
      return 'Please enter a valid email address format (e.g. staff@barangay.gov.ph).';
    }
    if (!val.includes('@') && !/^[A-Za-z0-9._-]+$/.test(val)) {
      return 'Username can only contain letters, numbers, dots, underscores, or hyphens.';
    }
    return '';
  };

  const validatePasswordField = (rawVal: string): string => {
    if (!rawVal) {
      return 'Please enter your password.';
    }
    if (rawVal.length < 4) {
      return 'Password must be at least 4 characters long.';
    }
    if (rawVal.length > 128) {
      return 'Password cannot exceed 128 characters.';
    }
    return '';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate login requests while loading
    if (isLoading) {
      return;
    }

    const trimmedIdentifier = username.trim();
    const uErr = validateUsernameField(username);
    const pErr = validatePasswordField(password);

    setUsernameError(uErr);
    setPasswordError(pErr);

    if (uErr || pErr) {
      setError('');
      if (uErr) {
        usernameInputRef.current?.focus();
      } else {
        passwordInputRef.current?.focus();
      }
      return;
    }

    setError('');
    setUsernameError('');
    setPasswordError('');
    setIsLoading(true);

    try {
      const response = await authApi.login({
        username: trimmedIdentifier,
        password
      });

      const verifiedUser = response.data?.user || (response as any).user;
      if (!response.success || !verifiedUser) {
        throw new Error(response.message || 'Invalid email or password. Please try again.');
      }

      // Hide loading overlay and enter dashboard immediately
      setIsLoading(false);
      onAuthenticated(verifiedUser, true);
    } catch (err: any) {
      setIsLoading(false);

      const errorMessage = err?.message || 'Invalid email or password. Please try again.';
      setError(errorMessage);

      // Preserve username/email input and focus password for easy retry
      window.setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 50);
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
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      {/* 1. Full-Page Sign-In Loading Overlay with Smooth Fade-In / Fade-Out Transition */}
      <div
        role="status"
        aria-live="assertive"
        aria-busy={isLoading}
        aria-hidden={!isLoading}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          backgroundColor: 'rgba(15, 23, 42, 0.82)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          boxSizing: 'border-box',
          opacity: isLoading ? 1 : 0,
          visibility: isLoading ? 'visible' : 'hidden',
          pointerEvents: isLoading ? 'all' : 'none',
          transition: 'opacity 0.25s ease-in-out, visibility 0.25s ease-in-out'
        }}
      >
        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '1rem',
            padding: '2.25rem 2.5rem',
            maxWidth: '360px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)',
            transform: isLoading ? 'scale(1)' : 'scale(0.96)',
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Centered Loading Spinner */}
          <div
            style={{
              width: '60px',
              height: '60px',
              margin: '0 auto 1.25rem auto',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg
              style={{
                width: '60px',
                height: '60px',
                animation: 'spin 0.85s linear infinite'
              }}
              viewBox="0 0 50 50"
              fill="none"
            >
              <circle
                cx="25"
                cy="25"
                r="20"
                stroke="rgba(59, 130, 246, 0.22)"
                strokeWidth="4.5"
              />
              <path
                d="M25 5a20 20 0 0 1 20 20"
                stroke="#3b82f6"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#f8fafc',
              marginBottom: '0.4rem',
              letterSpacing: '0.2px'
            }}
          >
            Signing you in...
          </div>
          <p
            style={{
              fontSize: '0.825rem',
              color: '#94a3b8',
              margin: 0,
              lineHeight: 1.5
            }}
          >
            Verifying your credentials with the Barangay e-Services System. Please wait.
          </p>
        </div>
      </div>

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
            transition: 'all 0.15s ease',
            pointerEvents: isLoading ? 'none' : 'auto'
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
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Login Card */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: '#1e293b',
              borderRadius: '0.875rem',
              padding: '2rem 1.85rem',
              border: '1px solid #334155',
              boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)'
            }}
          >
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
              <h1
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#f1f5f9',
                  margin: '0 0 0.25rem 0'
                }}
              >
                Authorized Staff Sign In
              </h1>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8'
                }}
              >
                Barangay Personnel Only — Restricted Access
              </div>
            </div>

            {/* Inline Authentication Error Banner */}
            {error && (
              <div
                id="staff-auth-error"
                role="alert"
                aria-live="assertive"
                style={{
                  marginBottom: '1.1rem',
                  padding: '0.75rem 0.9rem',
                  backgroundColor: 'rgba(220, 38, 38, 0.15)',
                  border: '1.5px solid rgba(248, 113, 113, 0.5)',
                  borderRadius: '0.5rem',
                  color: '#fca5a5',
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.55rem'
                }}
              >
                <AlertCircle className="w-4 h-4" style={{ color: '#f87171', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#fecaca', marginBottom: '0.1rem' }}>
                    Sign In Failed
                  </div>
                  <div>{error}</div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} noValidate>
              {/* Email or Username */}
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="staff-username"
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: usernameError ? '#fca5a5' : '#cbd5e1',
                    marginBottom: '0.35rem'
                  }}
                >
                  Email or Username
                </label>
                <input
                  ref={usernameInputRef}
                  id="staff-username"
                  type="text"
                  maxLength={80}
                  value={username}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUsername(val);
                    if (usernameError) setUsernameError(validateUsernameField(val));
                    if (error) setError('');
                  }}
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      setUsernameError(validateUsernameField(e.target.value));
                    }
                  }}
                  disabled={isLoading}
                  placeholder="Enter your email or username (e.g. admin)"
                  required
                  aria-invalid={Boolean(usernameError || error)}
                  aria-describedby={
                    usernameError ? 'staff-username-error' : error ? 'staff-auth-error' : undefined
                  }
                  autoComplete="username"
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.85rem',
                    backgroundColor: '#0f172a',
                    border: `1.5px solid ${usernameError || error ? '#ef4444' : '#334155'}`,
                    borderRadius: '0.45rem',
                    color: '#f1f5f9',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    opacity: isLoading ? 0.65 : 1,
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                  }}
                  className="staff-input-focus"
                />
                {usernameError && (
                  <div
                    id="staff-username-error"
                    role="alert"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginTop: '0.4rem',
                      fontSize: '0.76rem',
                      fontWeight: 500,
                      color: '#fca5a5',
                      lineHeight: 1.35
                    }}
                  >
                    <AlertCircle className="w-3.5 h-3.5" style={{ color: '#f87171', flexShrink: 0 }} />
                    <span>{usernameError}</span>
                  </div>
                )}
              </div>

              {/* Password */}
              <div style={{ marginBottom: '1.35rem' }}>
                <label
                  htmlFor="staff-password"
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: passwordError ? '#fca5a5' : '#cbd5e1',
                    marginBottom: '0.35rem'
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    ref={passwordInputRef}
                    id="staff-password"
                    type={showPassword ? 'text' : 'password'}
                    maxLength={128}
                    value={password}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPassword(val);
                      if (passwordError) setPasswordError(validatePasswordField(val));
                      if (error) setError('');
                    }}
                    onBlur={(e) => {
                      if (e.target.value) {
                        setPasswordError(validatePasswordField(e.target.value));
                      }
                    }}
                    disabled={isLoading}
                    placeholder="Enter your password"
                    required
                    aria-invalid={Boolean(passwordError || error)}
                    aria-describedby={
                      passwordError ? 'staff-password-error' : error ? 'staff-auth-error' : undefined
                    }
                    autoComplete="current-password"
                    style={{
                      width: '100%',
                      padding: '0.625rem 2.5rem 0.625rem 0.85rem',
                      backgroundColor: '#0f172a',
                      border: `1.5px solid ${passwordError || error ? '#ef4444' : '#334155'}`,
                      borderRadius: '0.45rem',
                      color: '#f1f5f9',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      opacity: isLoading ? 0.65 : 1,
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                    }}
                    className="staff-input-focus"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      padding: '4px 6px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      lineHeight: 1
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {passwordError && (
                  <div
                    id="staff-password-error"
                    role="alert"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginTop: '0.4rem',
                      fontSize: '0.76rem',
                      fontWeight: 500,
                      color: '#fca5a5',
                      lineHeight: 1.35
                    }}
                  >
                    <AlertCircle className="w-3.5 h-3.5" style={{ color: '#f87171', flexShrink: 0 }} />
                    <span>{passwordError}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="staff-login-btn"
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem',
                  backgroundColor: isLoading ? '#1d4ed8' : '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.45rem',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  opacity: isLoading ? 0.85 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)'
                }}
              >
                {isLoading ? (
                  <>
                    <svg
                      style={{
                        width: '17px',
                        height: '17px',
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
                    <span>Signing you in...</span>
                  </>
                ) : (
                  <>
                    <svg
                      style={{ width: '16px', height: '16px', flexShrink: 0 }}
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
            Role-based access authenticated against the official Barangay e-Services Registry.
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.68rem', color: '#475569' }}>
            Unauthorized access is prohibited under Republic Act No. 8792.
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes modalBackdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalCardPopIn {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes checkmarkCircleScale {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.06); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes checkmarkDraw {
          to { stroke-dashoffset: 0; }
        }
        .staff-back-link:hover {
          color: #ffffff !important;
          border-color: #64748b !important;
          background-color: rgba(255, 255, 255, 0.08) !important;
        }
        .staff-login-btn:hover:not(:disabled) {
          background-color: #1d4ed8 !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(37, 99, 235, 0.4) !important;
        }
        .staff-login-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .staff-input-focus:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25) !important;
        }
        .success-modal-continue-btn:hover {
          background-color: #15803d !important;
          transform: translateY(-1px);
        }
        .success-modal-continue-btn:focus-visible {
          outline: 3px solid #22c55e;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

