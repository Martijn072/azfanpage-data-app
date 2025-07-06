import { createContext, useContext, ReactNode } from 'react';
import { InAppBrowser } from '@/components/InAppBrowser';
import { useInAppBrowser } from '@/hooks/useInAppBrowser';

interface InAppBrowserContextType {
  openBrowser: (url: string, title?: string) => void;
  closeBrowser: () => void;
  shouldOpenInApp: (url: string) => boolean;
  handleLinkClick: (event: Event, url: string, title?: string) => boolean;
  processExternalLinks: (element: HTMLElement) => void;
}

const InAppBrowserContext = createContext<InAppBrowserContextType | undefined>(undefined);

export const useInAppBrowserContext = () => {
  const context = useContext(InAppBrowserContext);
  if (!context) {
    throw new Error('useInAppBrowserContext must be used within InAppBrowserProvider');
  }
  return context;
};

interface InAppBrowserProviderProps {
  children: ReactNode;
}

export const InAppBrowserProvider = ({ children }: InAppBrowserProviderProps) => {
  const {
    browserState,
    openBrowser,
    closeBrowser,
    shouldOpenInApp,
    handleLinkClick,
    processExternalLinks
  } = useInAppBrowser();

  return (
    <InAppBrowserContext.Provider value={{
      openBrowser,
      closeBrowser,
      shouldOpenInApp,
      handleLinkClick,
      processExternalLinks
    }}>
      {children}
      <InAppBrowser
        url={browserState.url}
        isOpen={browserState.isOpen}
        onClose={closeBrowser}
        title={browserState.title}
      />
    </InAppBrowserContext.Provider>
  );
};