import { ReactNode } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { DesktopNavigation } from './DesktopNavigation';
import { Breadcrumb } from './Breadcrumb';
import { DynamicSidebar } from './DynamicSidebar';

interface ResponsiveLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  showSidebar?: boolean;
}

export const ResponsiveLayout = ({ 
  children, 
  activeTab, 
  onTabChange, 
  showSidebar = true 
}: ResponsiveLayoutProps) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile) {
    // Mobile layout - unchanged
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pb-16">
          {children}
        </main>
        <BottomNavigation activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    );
  }

  // Desktop/Tablet layout
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Desktop Navigation */}
      {isDesktop && <DesktopNavigation />}
      
      {/* Breadcrumb */}
      <Breadcrumb />
      
      {/* Main Content Grid */}
      <div className={`container mx-auto px-4 ${
        isDesktop && showSidebar 
          ? 'grid grid-cols-1 lg:grid-cols-4 gap-6' 
          : 'max-w-6xl'
      }`}>
        {/* Main Content */}
        <main className={isDesktop && showSidebar ? 'lg:col-span-3' : 'w-full'}>
          {children}
        </main>
        
        {/* Sidebar - Desktop only */}
        {isDesktop && showSidebar && (
          <aside className="lg:col-span-1">
            <DynamicSidebar />
          </aside>
        )}
      </div>
      
      {/* Tablet still has bottom navigation */}
      {isTablet && (
        <BottomNavigation activeTab={activeTab} onTabChange={onTabChange} />
      )}
    </div>
  );
};
