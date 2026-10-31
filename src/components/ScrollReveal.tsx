import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export type ScrollRevealVariant = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in';

interface ScrollRevealProps {
  children: React.ReactNode;
  delayMs?: number;
  variant?: ScrollRevealVariant;
  triggerOnce?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delayMs = 0,
  variant = 'fade-up',
  triggerOnce = false,
  className = '',
  style
}) => {
  const { ref, isRevealed } = useScrollReveal({ triggerOnce });

  return (
    <div
      ref={ref}
      className={`reveal-on-scroll reveal-${variant} ${isRevealed ? 'is-revealed' : ''} ${className}`}
      style={{
        transitionDelay: isRevealed ? `${delayMs}ms` : '0ms',
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
