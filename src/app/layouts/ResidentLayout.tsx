import React from 'react';
import { Navbar } from '../../components/navigation/Navbar';
import { Footer } from '../../components/navigation/Footer';

interface ResidentLayoutProps {
  currentPath: string;
  onNavigate: (path: string, param?: string) => void;
  children: React.ReactNode;
}

export const ResidentLayout: React.FC<ResidentLayoutProps> = ({
  currentPath,
  onNavigate,
  children
}) => {
  return (
    <div className="app-root" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar currentPath={currentPath} onNavigate={onNavigate} />
      <main className="main-content" style={{ flex: 1 }}>
        {children}
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

