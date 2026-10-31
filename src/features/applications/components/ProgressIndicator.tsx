import React from 'react';
import { Check } from '../../../components/Icons';

interface ProgressIndicatorProps {
  currentStep: number; // 1 to 6
  steps?: string[];
  onStepClick?: (step: number) => void;
  allowStepClick?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  steps = [
    'Document',
    'Personal Info',
    'App. Details',
    'Review',
    'Payment',
    'Confirmation'
  ],
  onStepClick,
  allowStepClick = false
}) => {
  return (
    <div className="progress-indicator-container" style={{ width: '100%', margin: '1.5rem 0 2.5rem 0' }}>
      {/* Desktop & Tablet View */}
      <div className="progress-steps-row">
        {steps.map((label, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div 
              key={label} 
              className={`progress-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                cursor: allowStepClick && isCompleted ? 'pointer' : 'default'
              }}
              onClick={() => {
                if (allowStepClick && isCompleted && onStepClick) {
                  onStepClick(stepNumber);
                }
              }}
            >
              {/* Connector line behind circles */}
              {idx > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '50%',
                    width: '100%',
                    height: '3px',
                    backgroundColor: stepNumber <= currentStep ? '#16a34a' : '#e2e8f0',
                    zIndex: 1,
                    transition: 'background-color 0.3s ease'
                  }}
                />
              )}

              {/* Step Circle Badge */}
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  zIndex: 2,
                  transition: 'all 0.25s ease',
                  backgroundColor: isCompleted 
                    ? '#16a34a' 
                    : isActive 
                    ? '#1e40af' 
                    : '#ffffff',
                  color: isCompleted || isActive ? '#ffffff' : '#64748b',
                  border: isCompleted 
                    ? '2px solid #16a34a' 
                    : isActive 
                    ? '3px solid #bfdbfe' 
                    : '2px solid #cbd5e1',
                  boxShadow: isActive ? '0 0 0 4px rgba(37, 99, 235, 0.15)' : 'none'
                }}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>

              {/* Step Label */}
              <div
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : isCompleted ? 600 : 500,
                  color: isActive ? '#1e3a8a' : isCompleted ? '#166534' : '#64748b',
                  textAlign: 'center',
                  lineHeight: 1.25,
                  maxWidth: '120px'
                }}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Compact Progress Bar */}
      <div className="progress-mobile-compact">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e3a8a' }}>
            Step {currentStep} of {steps.length}: <strong style={{ color: '#0f172a' }}>{steps[currentStep - 1]}</strong>
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {Math.round(((currentStep - 1) / (steps.length - 1)) * 100)}% Complete
          </span>
        </div>
        <div style={{ height: '6px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              backgroundColor: '#16a34a',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>
    </div>
  );
};
