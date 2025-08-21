import { ClientLayoutWrapper } from './client-layout-wrapper';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return <ClientLayoutWrapper>{children}</ClientLayoutWrapper>;
} 