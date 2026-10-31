import React, { useEffect, useRef } from 'react';
import { ShieldCheck } from '../../../components/Icons';

export interface SignInSuccessModalProps {
  isOpen: boolean;
  user: {
    fullName: string;
    role: string;
    username?: string;
  } | null;
  onContinue: () => void;
}

export const SignInSuccessModal: React.FC<SignInSuccessModalProps> = ({
  isOpen,
  user,
  onContinue
}) => {
  const continueBtnRef = useRef<HTMLButtonElement | null>(null);

  // Auto-focus the Continue button, trap focus/handle Escape, and auto-dismiss after 3s
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      continueBtnRef.current?.focus();
    }, 60);

    // Auto-dismiss after 3 seconds
    const autoDismissTimer = setTimeout(() => {
      onContinue();
    }, 3000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        onContinue();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        continueBtnRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      clearTimeout(autoDismissTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onContinue]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-success-title"
      aria-describedby="signin-success-message"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        boxSizing: 'border-box',
        animation: 'modalBackdropFadeIn 0.25s ease-out forwards'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          padding: '2.25rem 2rem',
          maxWidth: '430px',
          width: '100%',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          animation: 'modalCardPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        {/* Success Icon with Animated Checkmark */}
        <div
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            backgroundColor: '#dcfce7',
            border: '3px solid #22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.35rem auto',
            boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.35)',
            animation: 'checkmarkCircleScale 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          <svg
            width="38"
            height="38"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline
              points="20 6 9 17 4 12"
              style={{
                strokeDasharray: 24,
                strokeDashoffset: 24,
                animation: 'checkmarkDraw 0.4s 0.15s ease-out forwards'
              }}
            />
          </svg>
        </div>

        {/* Modal Title */}
        <h2
          id="signin-success-title"
          style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 0.65rem 0',
            lineHeight: 1.25
          }}
        >
          Sign In Successful!
        </h2>

        {/* Modal Message */}
        <p
          id="signin-success-message"
          style={{
            fontSize: '0.925rem',
            color: '#475569',
            lineHeight: 1.6,
            margin: '0 0 1.25rem 0'
          }}
        >
          Welcome back! You have successfully signed in to the Barangay e-Services System.
        </p>

        {/* Authenticated Account & Role Badge */}
        {user && (
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.625rem',
              padding: '0.65rem 1rem',
              marginBottom: '1.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.825rem',
              color: '#334155'
            }}
          >
            <ShieldCheck size={16} style={{ color: '#2563eb', flexShrink: 0 }} />
            <span>
              Signed in as <strong style={{ color: '#0f172a' }}>{user.fullName}</strong>{' '}
              <span
                style={{
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '9999px',
                  marginLeft: '0.25rem'
                }}
              >
                {user.role}
              </span>
            </span>
          </div>
        )}

        {/* Continue Button */}
        <button
          ref={continueBtnRef}
          type="button"
          onClick={onContinue}
          className="success-modal-continue-btn"
          style={{
            width: '100%',
            padding: '0.8rem 1.5rem',
            backgroundColor: '#16a34a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)',
            transition: 'background-color 0.15s ease, transform 0.1s ease'
          }}
        >
          <span>Continue</span>
          <span aria-hidden="true">&rarr;</span>
        </button>

        {/* 3-Second Auto-dismiss Progress Bar & Indicator */}
        <div
          style={{
            marginTop: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#f1f5f9',
              borderRadius: '9999px',
              overflow: 'hidden',
              border: '1px solid #e2e8f0'
            }}
          >
            <div
              style={{
                height: '100%',
                backgroundColor: '#22c55e',
                borderRadius: '9999px',
                animation: 'autoDismissProgress 3s linear forwards'
              }}
            />
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
            Automatically entering dashboard in 3s...
          </span>
        </div>
      </div>

      <style>{`
        @keyframes autoDismissProgress {
          from { width: 100%; }
          to { width: 0%; }
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

