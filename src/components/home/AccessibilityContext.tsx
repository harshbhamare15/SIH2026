'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type FontSize = 'small' | 'normal' | 'large';

interface AccessibilityContextProps {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextProps | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>('normal');
  const [highContrast, setHighContrastState] = useState<boolean>(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSize = localStorage.getItem('accessibility-font-size') as FontSize;
    const savedContrast = localStorage.getItem('accessibility-high-contrast') === 'true';
    if (savedSize) setFontSizeState(savedSize);
    if (savedContrast !== undefined) setHighContrastState(savedContrast);
  }, []);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem('accessibility-font-size', size);
  };

  const setHighContrast = (val: boolean) => {
    setHighContrastState(val);
    localStorage.setItem('accessibility-high-contrast', String(val));
  };

  // Sync classes to body tag
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const body = document.body;
      
      // Remove all sizing classes
      body.classList.remove('font-sz-small', 'font-sz-normal', 'font-sz-large');
      body.classList.add(`font-sz-${fontSize}`);

      // Toggle contrast class
      if (highContrast) {
        body.classList.add('high-contrast');
      } else {
        body.classList.remove('high-contrast');
      }
    }
  }, [fontSize, highContrast]);

  return (
    <AccessibilityContext.Provider value={{ fontSize, setFontSize, highContrast, setHighContrast }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
