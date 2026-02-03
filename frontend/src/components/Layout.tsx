import React, { ReactNode } from 'react';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-16">
      <main className="flex-grow max-w-md mx-auto w-full px-4 py-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;
