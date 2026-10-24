import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface ScrollRevealProps {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delayMs = 0,
  className = '',
  style
}) => {
  const { ref, isRevealed } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`reveal-on-scroll ${isRevealed ? 'is-revealed' : ''} ${className}`}
      style={{
        transitionDelay: `${delayMs}ms`,
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
