import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = '0.375rem',
  className = '',
  style
}) => {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
      aria-hidden="true"
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}
      aria-label="Loading application records..."
      role="status"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1.5fr 1.2fr 1fr 1fr 1.2fr',
          gap: '1rem',
          padding: '1rem 1.5rem',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <Skeleton height="14px" width="70%" />
        <Skeleton height="14px" width="60%" />
        <Skeleton height="14px" width="50%" />
        <Skeleton height="14px" width="65%" />
        <Skeleton height="14px" width="45%" />
        <Skeleton height="14px" width="55%" />
      </div>

      <div style={{ padding: '0 1.5rem' }}>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1.5fr 1.2fr 1fr 1fr 1.2fr',
              gap: '1rem',
              alignItems: 'center',
              padding: '1.15rem 0',
              borderBottom: index < rows - 1 ? '1px solid #f1f5f9' : 'none'
            }}
          >
            <div>
              <Skeleton height="16px" width="85%" style={{ marginBottom: '6px' }} />
              <Skeleton height="11px" width="55%" />
            </div>
            <div>
              <Skeleton height="16px" width="75%" style={{ marginBottom: '6px' }} />
              <Skeleton height="11px" width="45%" />
            </div>
            <div>
              <Skeleton height="16px" width="80%" />
            </div>
            <div>
              <Skeleton height="24px" width="85px" borderRadius="9999px" />
            </div>
            <div>
              <Skeleton height="14px" width="60%" />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Skeleton height="32px" width="32px" borderRadius="0.375rem" />
              <Skeleton height="32px" width="32px" borderRadius="0.375rem" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        width: '100%'
      }}
      aria-label="Loading available services..."
      role="status"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            padding: '1.75rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '260px'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <Skeleton height="48px" width="48px" borderRadius="0.625rem" />
              <Skeleton height="20px" width="65px" borderRadius="9999px" />
            </div>
            <Skeleton height="22px" width="75%" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="14px" width="95%" style={{ marginBottom: '0.5rem' }} />
            <Skeleton height="14px" width="85%" style={{ marginBottom: '1.5rem' }} />
          </div>
          <div
            style={{
              paddingTop: '1rem',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Skeleton height="14px" width="35%" />
            <Skeleton height="36px" width="110px" borderRadius="0.5rem" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const TrackingSkeleton: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        padding: '2rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
      }}
      aria-label="Searching application records..."
      role="status"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <Skeleton height="14px" width="120px" style={{ marginBottom: '0.5rem' }} />
          <Skeleton height="24px" width="220px" />
        </div>
        <Skeleton height="32px" width="130px" borderRadius="9999px" />
      </div>

      <div style={{ padding: '1.5rem 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: '1.75rem' }}>
        <Skeleton height="18px" width="160px" style={{ marginBottom: '1.25rem' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <Skeleton height="36px" width="36px" borderRadius="50%" style={{ margin: '0 auto 0.5rem' }} />
              <Skeleton height="12px" width="80%" style={{ margin: '0 auto 0.25rem' }} />
              <Skeleton height="10px" width="60%" style={{ margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div>
          <Skeleton height="12px" width="70px" style={{ marginBottom: '0.35rem' }} />
          <Skeleton height="16px" width="140px" />
        </div>
        <div>
          <Skeleton height="12px" width="70px" style={{ marginBottom: '0.35rem' }} />
          <Skeleton height="16px" width="120px" />
        </div>
        <div>
          <Skeleton height="12px" width="70px" style={{ marginBottom: '0.35rem' }} />
          <Skeleton height="16px" width="160px" />
        </div>
      </div>
    </div>
  );
};
