
import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import { MobileEmulatorLauncher } from '@/components/mobile-emulator-launcher';
import { HeaderStateProvider } from '@/hooks/use-header-state';
import { StorageCleanupInitializer } from '@/components/storage-cleanup-initializer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'FixMo',
  description: 'Your friendly neighborhood task-fixer.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className={cn('font-sans antialiased min-h-screen flex flex-col', inter.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <HeaderStateProvider>
              <StorageCleanupInitializer />
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Toaster />
              <MobileEmulatorLauncher />
            </HeaderStateProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
