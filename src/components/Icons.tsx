import React from 'react';

export interface IconProps {
  className?: string;
  style?: React.CSSProperties;
  size?: number | string;
}

// FileCheck icon for Barangay Clearance
export const FileCheck: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="m9 15 2 2 4-4" />
  </svg>
);

// HandHeart icon for Certificate of Indigency
export const HandHeart: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16" />
    <path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.8-2.8L15 13" />
    <path d="M15 3.5a3.5 3.5 0 0 0-5 0l-.5.5-.5-.5a3.5 3.5 0 0 0-5 5L12 16.5l8-8a3.5 3.5 0 0 0 0-5z" />
  </svg>
);

// House icon for Certificate of Residency
export const House: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

export const CheckCircle2: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const Clock: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const AlertCircle: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

export const XCircle: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

export const Search: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const ArrowRight: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export const ArrowLeft: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

export const ArrowUp: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M12 19V5" />
    <path d="m5 12 7-7 7 7" />
  </svg>
);

export const Check: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const ShieldCheck: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const Printer: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect width="12" height="8" x="6" y="14" />
  </svg>
);

export const Eye: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const Filter: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const X: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const Menu: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

export const ChevronRight: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const ChevronLeft: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const LayoutDashboard: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

export const Database: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5V19A9 3 0 0 0 21 19V5" />
    <path d="M3 12A9 3 0 0 0 21 12" />
  </svg>
);

export const User: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const MapPin: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const Phone: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const Mail: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export const Calendar: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

export const FileText: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

export const Info: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

export const Building2: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v8h4" />
    <path d="M18 9h2a2 2 0 0 1 2 2v11h-4" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </svg>
);

export const RefreshCw: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

export const ExternalLink: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

export const EyeOff: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

export const LogOut: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

// Official Seal / Logo
export const BarangaySeal: React.FC<IconProps> = ({ className = 'w-8 h-8', style, size }) => {
  let widthVal = size ? (typeof size === 'number' ? `${size}px` : size) : undefined;
  let heightVal = size ? (typeof size === 'number' ? `${size}px` : size) : undefined;

  if (!widthVal && className) {
    if (className.includes('w-3.5')) { widthVal = '14px'; heightVal = '14px'; }
    else if (className.includes('w-4')) { widthVal = '16px'; heightVal = '16px'; }
    else if (className.includes('w-5')) { widthVal = '20px'; heightVal = '20px'; }
    else if (className.includes('w-6')) { widthVal = '24px'; heightVal = '24px'; }
    else if (className.includes('w-8')) { widthVal = '32px'; heightVal = '32px'; }
    else if (className.includes('w-10')) { widthVal = '40px'; heightVal = '40px'; }
    else if (className.includes('w-12')) { widthVal = '48px'; heightVal = '48px'; }
    else if (className.includes('w-14')) { widthVal = '56px'; heightVal = '56px'; }
    else if (className.includes('w-16')) { widthVal = '64px'; heightVal = '64px'; }
    else if (className.includes('w-20')) { widthVal = '80px'; heightVal = '80px'; }
    else if (className.includes('w-full')) { widthVal = '100%'; heightVal = '100%'; }
  }

  return (
    <img
      src="/logo.png"
      alt="Barangay Official Seal"
      className={`barangay-seal-img ${className}`}
      style={{
        width: widthVal || '32px',
        height: heightVal || '32px',
        objectFit: 'contain',
        ...style
      }}
    />
  );
};

// Copy icon
export const Copy: React.FC<IconProps> = ({ className = 'w-4 h-4', style, size }) => (
  <svg
    width={size}
    height={size}
    className={className}
    style={style}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);


export const IconCreditCard: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg
    width={size}
    height={size}
    className={className}
    style={style}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

export const IconCash: React.FC<IconProps> = ({ className = 'w-6 h-6', style, size }) => (
  <svg
    width={size}
    height={size}
    className={className}
    style={style}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="12" x="2" y="6" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

// Backward-compatible named exports for legacy references
export const IconSeal = BarangaySeal;
export const IconHome = House;
export const IconFileText = FileText;
export const IconShieldCheck = ShieldCheck;
export const IconHeartHandshake = HandHeart;
export const IconPrinter = Printer;
export const IconCheckCircle = CheckCircle2;
export const IconClock = Clock;
export const IconXCircle = XCircle;
export const IconSearch = Search;
export const IconFilter = Filter;
export const IconEye = Eye;
export const IconUserAdmin = User;

