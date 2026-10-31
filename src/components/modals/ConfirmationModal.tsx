import React, { useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, XCircle, X } from '../Icons';
import { Spinner } from '../ui/Spinner';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'success' | 'danger';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  // Optional reason input for rejections
  requiresReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  reasonValue?: string;
  reasonError?: string;
  onReasonChange?: (value: string) => void;
  // Inline error message if the confirmation action fails
  actionError?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
  onConfirm,
  onCancel,
  requiresReason = false,
  reasonLabel = 'Reason for Rejection',
  reasonPlaceholder = 'Please specify why this application cannot be approved...',
  reasonValue = '',
  reasonError,
  onReasonChange,
  actionError
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Esc key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const variantStyles = {
    primary: {
      headerBg: '#eff6ff',
      iconColor: '#2563eb',
      confirmBg: '#2563eb',
      confirmHover: '#1d4ed8',
      icon: <AlertCircle className="w-6 h-6" />
    },
    success: {
      headerBg: '#f0fdf4',
      iconColor: '#16a34a',
      confirmBg: '#16a34a',
      confirmHover: '#15803d',
      icon: <CheckCircle2 className="w-6 h-6" />
    },
    danger: {
      headerBg: '#fef2f2',
      iconColor: '#dc2626',
      confirmBg: '#dc2626',
      confirmHover: '#b91c1c',
      icon: <XCircle className="w-6 h-6" />
    }
  }[variant];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onCancel();
        }
      }}
    >
      <div
        ref={modalRef}
        className="modal-enter"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          maxWidth: '500px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: variantStyles.headerBg,
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ color: variantStyles.iconColor, display: 'flex' }}>
              {variantStyles.icon}
            </div>
            <h3
              id="modal-title"
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#0f172a',
                margin: 0
              }}
            >
              {title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Close dialog"
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              padding: '0.35rem',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          <p
            id="modal-description"
            style={{
              fontSize: '0.925rem',
              color: '#475569',
              lineHeight: 1.55,
              margin: '0 0 1.25rem 0'
            }}
          >
            {message}
          </p>

          {/* Reason text area if required */}
          {requiresReason && (
            <div style={{ marginTop: '1rem' }}>
              <label
                htmlFor="reasonInput"
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: reasonError ? '#b91c1c' : '#1e293b',
                  marginBottom: '0.35rem'
                }}
              >
                {reasonLabel} <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                id="reasonInput"
                maxLength={300}
                value={reasonValue}
                onChange={(e) => onReasonChange?.(e.target.value)}
                disabled={isLoading}
                placeholder={reasonPlaceholder}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.85rem',
                  borderRadius: '0.5rem',
                  border: `1.5px solid ${reasonError ? '#ef4444' : '#cbd5e1'}`,
                  boxShadow: reasonError ? '0 0 0 1px rgba(239, 68, 68, 0.2)' : 'none',
                  fontSize: '0.9rem',
                  color: '#1e293b',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                className="focus-ring"
                aria-invalid={!!reasonError}
                aria-describedby={reasonError ? 'reason-error' : undefined}
              />
              {reasonError && (
                <div
                  id="reason-error"
                  role="alert"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.775rem',
                    color: '#dc2626',
                    marginTop: '0.4rem',
                    fontWeight: 600
                  }}
                >
                  <AlertCircle className="w-4 h-4" style={{ flexShrink: 0 }} />
                  <span>{reasonError}</span>
                </div>
              )}
            </div>
          )}

          {/* Inline Action Error State */}
          {actionError && (
            <div
              role="alert"
              aria-live="assertive"
              style={{
                marginTop: '1rem',
                padding: '0.75rem 0.95rem',
                backgroundColor: '#fef2f2',
                border: '1.5px solid #fecaca',
                borderRadius: '0.5rem',
                color: '#991b1b',
                fontSize: '0.825rem',
                lineHeight: 1.45,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.55rem'
              }}
            >
              <AlertCircle className="w-4 h-4" style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, color: '#7f1d1d', marginBottom: '0.1rem' }}>
                  Unable to Complete Action
                </div>
                <div>{actionError}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '0.5rem',
              backgroundColor: '#ffffff',
              border: '1.5px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
            className="interactive-btn"
          >
            {cancelLabel}
          </button>

          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '0.625rem 1.35rem',
              borderRadius: '0.5rem',
              backgroundColor: variantStyles.confirmBg,
              border: 'none',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            className="interactive-btn"
          >
            {isLoading && <Spinner size="sm" color="#ffffff" />}
            <span>{isLoading ? 'Processing...' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

