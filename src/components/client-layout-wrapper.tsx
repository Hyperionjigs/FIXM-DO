"use client"
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import { HeaderStateProvider } from '@/hooks/use-header-state';
import Header from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { MobileEmulatorLauncher } from '@/components/mobile-emulator-launcher';
import { UXEnhancer } from '@/components/ux-enhancer';

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <UXEnhancer>
        <AuthProvider>
          <HeaderStateProvider>
            {/* Skip to main content link for accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
            >
              Skip to main content
            </a>
            
            <Header />
            
            <main id="main-content" className="flex-1" role="main">
              {children}
            </main>
            
            {/* ARIA live regions for accessibility */}
            <div id="notifications" aria-live="polite" className="sr-only" />
            <div id="search-results" aria-live="polite" className="sr-only" />
            <div id="loading-status" aria-live="assertive" className="sr-only" />
            
            <Toaster />
            <MobileEmulatorLauncher />
          </HeaderStateProvider>
        </AuthProvider>
      </UXEnhancer>
    </ThemeProvider>
  );
} 