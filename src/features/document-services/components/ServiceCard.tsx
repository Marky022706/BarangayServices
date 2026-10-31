import React from 'react';
import type { ServiceInfo } from '../../../types';
import { FileCheck, HandHeart, House, ArrowRight, Check } from '../../../components/Icons';

interface ServiceCardProps {
  service: ServiceInfo;
  onApply: (serviceId: ServiceInfo['id']) => void;
  isSelectable?: boolean;
  isSelected?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onApply,
  isSelectable = false,
  isSelected = false
}) => {
  const renderIcon = (name: ServiceInfo['iconName']) => {
    switch (name) {
      case 'FileCheck':
        return <FileCheck className="w-7 h-7" />;
      case 'HandHeart':
        return <HandHeart className="w-7 h-7" />;
      case 'House':
        return <House className="w-7 h-7" />;
      default:
        return <FileCheck className="w-7 h-7" />;
    }
  };

  const getAccentColor = (id: ServiceInfo['id']) => {
    switch (id) {
      case 'clearance':
        return {
          iconBg: '#eff6ff',
          iconColor: '#1d4ed8',
          borderHover: '#3b82f6'
        };
      case 'indigency':
        return {
          iconBg: '#fef2f2',
          iconColor: '#b91c1c',
          borderHover: '#ef4444'
        };
      case 'residency':
        return {
          iconBg: '#f0fdf4',
          iconColor: '#15803d',
          borderHover: '#22c55e'
        };
      default:
        return {
          iconBg: '#eff6ff',
          iconColor: '#1d4ed8',
          borderHover: '#3b82f6'
        };
    }
  };

  const colors = getAccentColor(service.id);

  if (isSelectable) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        onClick={() => onApply(service.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onApply(service.id);
          }
        }}
        className={`selectable-service-card interactive-card ${isSelected ? 'selected' : ''}`}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          padding: '1.25rem',
          border: isSelected ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
          boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.12)' : '0 1px 3px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          outline: 'none'
        }}
      >
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(37,99,235,0.3)'
            }}
          >
            <Check className="w-3.5 h-3.5" />
          </div>
        )}

        <div>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.625rem',
              backgroundColor: colors.iconBg,
              color: colors.iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
          >
            {renderIcon(service.iconName)}
          </div>

          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: '0.4rem',
              lineHeight: 1.3
            }}
          >
            {service.title}
          </h3>

          <p
            style={{
              fontSize: '0.85rem',
              color: '#475569',
              lineHeight: 1.45,
              marginBottom: '1rem'
            }}
          >
            {service.shortDescription}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.75rem',
            borderTop: '1px solid #f1f5f9',
            fontSize: '0.775rem'
          }}
        >
          <span style={{ fontWeight: 600, color: '#1e3a8a' }}>{service.standardFee}</span>
          <span
            style={{
              color: isSelected ? '#2563eb' : '#64748b',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            {isSelected ? 'Selected' : 'Select'}
          </span>
        </div>
      </div>
    );
  }

  // Standard Homepage Presentation Card
  return (
    <div
      className="service-card"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.875rem',
        padding: '1.75rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
      }}
    >
      <div>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '0.75rem',
            backgroundColor: colors.iconBg,
            color: colors.iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem'
          }}
        >
          {renderIcon(service.iconName)}
        </div>

        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '0.625rem',
            lineHeight: 1.3
          }}
        >
          {service.title}
        </h3>

        <p
          style={{
            fontSize: '0.925rem',
            color: '#475569',
            lineHeight: 1.55,
            marginBottom: '1.5rem'
          }}
        >
          {service.shortDescription}
        </p>

        <div style={{ marginBottom: '1.25rem', fontSize: '0.825rem', color: '#64748b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
            <span>Processing Time:</span>
            <strong style={{ color: '#1e293b' }}>{service.processingTime}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
            <span>Fee:</span>
            <strong style={{ color: '#1e293b' }}>{service.standardFee}</strong>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onApply(service.id)}
        className="btn-apply-service"
        style={{
          width: '100%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.25rem',
          backgroundColor: '#1e40af',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.925rem',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.15s ease, transform 0.1s ease',
          boxShadow: '0 2px 4px rgba(30, 64, 175, 0.2)'
        }}
      >
        <span>Apply Now</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

