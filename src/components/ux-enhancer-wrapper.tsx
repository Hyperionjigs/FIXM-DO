import { UXEnhancer } from './ux-enhancer';

export function UXEnhancerWrapper({ children }: { children: React.ReactNode }) {
  return <UXEnhancer>{children}</UXEnhancer>;
} 