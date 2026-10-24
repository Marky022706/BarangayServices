import React from 'react';
import type { ApplicationStatus } from '../types';
import { Clock, CheckCircle2, XCircle, ShieldCheck, FileCheck } from './Icons';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (st: ApplicationStatus) => {
    switch (st) {
      case 'Pending Review':
        return {
          bg: '#fef3c7',
          color: '#92400e',
          border: '#fde68a',
          icon: <Clock className="w-3.5 h-3.5" />
        };
      case 'Under Verification':
        return {
          bg: '#e0e7ff',
          color: '#3730a3',
          border: '#c7d2fe',
          icon: <ShieldCheck className="w-3.5 h-3.5" />
        };
      case 'Approved':
        return {
          bg: '#dcfce7',
          color: '#166534',
          border: '#bbf7d0',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />
        };
      case 'Ready for Claiming':
        return {
          bg: '#dbeafe',
          color: '#1e40af',
          border: '#bfdbfe',
          icon: <FileCheck className="w-3.5 h-3.5" />
        };
      case 'Rejected':
        return {
          bg: '#fee2e2',
          color: '#991b1b',
          border: '#fecaca',
          icon: <XCircle className="w-3.5 h-3.5" />
        };
      default:
        return {
          bg: '#f1f5f9',
          color: '#475569',
          border: '#e2e8f0',
          icon: <Clock className="w-3.5 h-3.5" />
        };
    }
  };

  const config = getStatusConfig(status);

  const sizeStyles = {
    sm: { padding: '0.2rem 0.5rem', fontSize: '0.72rem' },
    md: { padding: '0.28rem 0.65rem', fontSize: '0.8rem' },
    lg: { padding: '0.4rem 0.9rem', fontSize: '0.875rem' }
  }[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        borderRadius: '9999px',
        fontWeight: 600,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        ...sizeStyles
      }}
    >
      {config.icon}
      <span>{status}</span>
    </span>
  );
};
