import React from 'react';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  ariaLabel?: string;
}

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 28
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'currentColor',
  className = '',
  ariaLabel = 'Loading'
}) => {
  const pixelSize = sizeMap[size];

  return (
    <svg
      className={`animate-spin ${className}`}
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label={ariaLabel}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.25"
      />
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12C2 14.2361 2.73656 16.3025 3.97886 17.9731"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Spinner;
