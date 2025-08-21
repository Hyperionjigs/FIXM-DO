"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface HeaderState {
  isAtTop: boolean;
  hasScrolled: boolean;
}

const HeaderStateContext = createContext<HeaderState>({
  isAtTop: true,
  hasScrolled: false,
});

export function HeaderStateProvider({ children }: { children: ReactNode }) {
  const [isAtTop, setIsAtTop] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const lastScrollY = useRef(0);

  // Scroll handler for header animation (Mobile Only)
  useEffect(() => {
    const handleScroll = () => {
      // Only apply animation on mobile devices
      if (window.innerWidth >= 768) {
        setIsAtTop(true);
        setHasScrolled(false);
        return;
      }
      
      const currentScrollY = window.scrollY;
      const scrollThreshold = 100; // Start animation after 100px scroll
      
      // Determine if we're at the very top (within 20px)
      const atTop = currentScrollY <= 20;
      setIsAtTop(atTop);
      
      // Set hasScrolled flag
      if (currentScrollY > scrollThreshold) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    // Handle resize events to reset animation on desktop
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsAtTop(true);
        setHasScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Initial check
    handleResize();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <HeaderStateContext.Provider value={{ isAtTop, hasScrolled }}>
      {children}
    </HeaderStateContext.Provider>
  );
}

export function useHeaderState() {
  const context = useContext(HeaderStateContext);
  if (context === undefined) {
    throw new Error('useHeaderState must be used within a HeaderStateProvider');
  }
  return context;
} 