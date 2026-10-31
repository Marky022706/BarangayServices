import React from 'react';
import { AlertCircle } from '../Icons';

interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  type?: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea' | 'number';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  helperText?: string;
  error?: string;
  rows?: number;
  maxLength?: number;
  min?: string;
  max?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  className?: string;
  style?: React.CSSProperties;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  options = [],
  helperText,
  error,
  rows = 3,
  maxLength,
  min,
  max,
  autoComplete,
  inputMode,
  className = '',
  style
}) => {
  const errorId = `${name}-error`;
  const helperId = `${name}-helper`;
  const describedBy = error ? errorId : helperText ? helperId : undefined;

  const baseInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    borderRadius: '0.5rem',
    border: `1.5px solid ${error ? '#ef4444' : '#cbd5e1'}`,
    backgroundColor: disabled ? '#f8fafc' : '#ffffff',
    color: '#1e293b',
    fontSize: '0.925rem',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
    boxShadow: error
      ? '0 0 0 1px rgba(239, 68, 68, 0.2)'
      : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    boxSizing: 'border-box'
  };

  return (
    <div className={`form-group ${className}`} style={{ marginBottom: '1.25rem', ...style }}>
      <label 
        htmlFor={name}
        style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: error ? '#b91c1c' : '#1e293b',
          marginBottom: '0.375rem',
          transition: 'color 0.2s ease'
        }}
      >
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>

      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          style={{
            ...baseInputStyle,
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
          className="focus-ring"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          style={{
            ...baseInputStyle,
            resize: 'vertical'
          }}
          className="focus-ring"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          min={min}
          max={max}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          style={baseInputStyle}
          className="focus-ring"
        />
      )}

      {helperText && !error && (
        <p
          id={helperId}
          style={{
            margin: '0.35rem 0 0 0',
            fontSize: '0.775rem',
            color: '#64748b'
          }}
        >
          {helperText}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          style={{
            margin: '0.35rem 0 0 0',
            fontSize: '0.775rem',
            color: '#dc2626',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
          role="alert"
        >
          <AlertCircle className="w-3.5 h-3.5" style={{ flexShrink: 0, color: '#dc2626' }} />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default FormInput;
