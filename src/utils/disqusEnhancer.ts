
// Enhanced Disqus configuration utilities for better dark mode support
export interface DisqusConfig {
  identifier: string;
  title: string;
  url?: string;
  colorScheme?: 'light' | 'dark' | 'auto';
  theme?: 'light' | 'dark';
}

export const enhanceDisqusForDarkMode = (config: DisqusConfig) => {
  // Standard Disqus configuration
  const baseConfig = {
    page: {
      url: config.url || window.location.href,
      identifier: config.identifier,
      title: config.title
    }
  };

  // Attempt to add dark mode configuration (may not work due to Disqus limitations)
  try {
    return {
      ...baseConfig,
      colorScheme: config.colorScheme || 'auto',
      theme: config.theme || 'light',
      // Additional dark mode hints
      appearance: {
        theme: config.theme || 'light',
        colorScheme: config.colorScheme || 'auto'
      }
    };
  } catch (e) {
    console.log('Could not enhance Disqus config:', e);
    return baseConfig;
  }
};

export const applyDisqusDarkModePostLoad = (method: 'enhanced' | 'sepia' | 'high-contrast' | 'fallback' = 'enhanced') => {
  // Apply post-load styling adjustments
  const disqusThread = document.getElementById('disqus_thread');
  if (!disqusThread) return;

  // Remove existing dark mode classes
  disqusThread.classList.remove('disqus-enhanced-dark', 'disqus-sepia-dark', 'disqus-high-contrast', 'disqus-fallback');
  
  // Apply new dark mode class
  const className = {
    enhanced: 'disqus-enhanced-dark',
    sepia: 'disqus-sepia-dark',
    'high-contrast': 'disqus-high-contrast',
    fallback: 'disqus-fallback'
  }[method];
  
  if (document.documentElement.classList.contains('dark')) {
    disqusThread.classList.add(className);
  }

  // Try to access iframe and apply additional styling (limited by CORS)
  setTimeout(() => {
    const iframe = disqusThread.querySelector('iframe');
    if (iframe) {
      try {
        // Attempt to communicate with iframe (will likely fail due to CORS)
        iframe.style.backgroundColor = '#1f2937';
        iframe.style.borderRadius = '8px';
      } catch (e) {
        console.log('Could not directly style Disqus iframe (expected due to CORS)');
      }
    }
  }, 1000);
};

// Utility to detect if Disqus has loaded successfully
export const waitForDisqusLoad = (callback: () => void, timeout = 10000) => {
  const startTime = Date.now();
  
  const checkLoad = () => {
    const disqusThread = document.getElementById('disqus_thread');
    const hasContent = disqusThread && (
      disqusThread.children.length > 0 || 
      disqusThread.querySelector('iframe') ||
      disqusThread.innerText.trim().length > 0
    );
    
    if (hasContent) {
      callback();
    } else if (Date.now() - startTime < timeout) {
      setTimeout(checkLoad, 500);
    } else {
      console.log('Disqus load timeout');
    }
  };
  
  checkLoad();
};
