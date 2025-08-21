// FixMo Design System
// Comprehensive design tokens, component library, and brand consistency framework

export interface DesignToken {
  name: string;
  value: string | number;
  category: 'color' | 'typography' | 'spacing' | 'border' | 'shadow' | 'animation';
  description?: string;
}

export interface ColorPalette {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface TypographyScale {
  xs: { fontSize: string; lineHeight: string; fontWeight: string };
  sm: { fontSize: string; lineHeight: string; fontWeight: string };
  base: { fontSize: string; lineHeight: string; fontWeight: string };
  lg: { fontSize: string; lineHeight: string; fontWeight: string };
  xl: { fontSize: string; lineHeight: string; fontWeight: string };
  '2xl': { fontSize: string; lineHeight: string; fontWeight: string };
  '3xl': { fontSize: string; lineHeight: string; fontWeight: string };
  '4xl': { fontSize: string; lineHeight: string; fontWeight: string };
  '5xl': { fontSize: string; lineHeight: string; fontWeight: string };
}

export interface SpacingScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface BorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface ShadowScale {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface AnimationConfig {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    linear: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
  delay: {
    none: string;
    short: string;
    medium: string;
    long: string;
  };
}

// Design Tokens
export const designTokens: DesignToken[] = [
  // Colors
  { name: 'primary-50', value: '#eff6ff', category: 'color', description: 'Primary color lightest shade' },
  { name: 'primary-100', value: '#dbeafe', category: 'color', description: 'Primary color light shade' },
  { name: 'primary-200', value: '#bfdbfe', category: 'color', description: 'Primary color lighter shade' },
  { name: 'primary-300', value: '#93c5fd', category: 'color', description: 'Primary color light shade' },
  { name: 'primary-400', value: '#60a5fa', category: 'color', description: 'Primary color medium-light shade' },
  { name: 'primary-500', value: '#3b82f6', category: 'color', description: 'Primary color base' },
  { name: 'primary-600', value: '#2563eb', category: 'color', description: 'Primary color medium-dark shade' },
  { name: 'primary-700', value: '#1d4ed8', category: 'color', description: 'Primary color dark shade' },
  { name: 'primary-800', value: '#1e40af', category: 'color', description: 'Primary color darker shade' },
  { name: 'primary-900', value: '#1e3a8a', category: 'color', description: 'Primary color darkest shade' },
  
  // Secondary Colors
  { name: 'secondary-50', value: '#f0fdf4', category: 'color', description: 'Secondary color lightest shade' },
  { name: 'secondary-100', value: '#dcfce7', category: 'color', description: 'Secondary color light shade' },
  { name: 'secondary-200', value: '#bbf7d0', category: 'color', description: 'Secondary color lighter shade' },
  { name: 'secondary-300', value: '#86efac', category: 'color', description: 'Secondary color light shade' },
  { name: 'secondary-400', value: '#4ade80', category: 'color', description: 'Secondary color medium-light shade' },
  { name: 'secondary-500', value: '#22c55e', category: 'color', description: 'Secondary color base' },
  { name: 'secondary-600', value: '#16a34a', category: 'color', description: 'Secondary color medium-dark shade' },
  { name: 'secondary-700', value: '#15803d', category: 'color', description: 'Secondary color dark shade' },
  { name: 'secondary-800', value: '#166534', category: 'color', description: 'Secondary color darker shade' },
  { name: 'secondary-900', value: '#14532d', category: 'color', description: 'Secondary color darkest shade' },
  
  // Semantic Colors
  { name: 'success', value: '#10b981', category: 'color', description: 'Success state color' },
  { name: 'warning', value: '#f59e0b', category: 'color', description: 'Warning state color' },
  { name: 'error', value: '#ef4444', category: 'color', description: 'Error state color' },
  { name: 'info', value: '#3b82f6', category: 'color', description: 'Info state color' },
  
  // Typography
  { name: 'font-family-sans', value: 'Inter, system-ui, sans-serif', category: 'typography', description: 'Primary font family' },
  { name: 'font-family-mono', value: 'JetBrains Mono, monospace', category: 'typography', description: 'Monospace font family' },
  { name: 'font-size-xs', value: '0.75rem', category: 'typography', description: 'Extra small font size' },
  { name: 'font-size-sm', value: '0.875rem', category: 'typography', description: 'Small font size' },
  { name: 'font-size-base', value: '1rem', category: 'typography', description: 'Base font size' },
  { name: 'font-size-lg', value: '1.125rem', category: 'typography', description: 'Large font size' },
  { name: 'font-size-xl', value: '1.25rem', category: 'typography', description: 'Extra large font size' },
  { name: 'font-size-2xl', value: '1.5rem', category: 'typography', description: '2XL font size' },
  { name: 'font-size-3xl', value: '1.875rem', category: 'typography', description: '3XL font size' },
  { name: 'font-size-4xl', value: '2.25rem', category: 'typography', description: '4XL font size' },
  { name: 'font-size-5xl', value: '3rem', category: 'typography', description: '5XL font size' },
  
  // Spacing
  { name: 'spacing-xs', value: '0.25rem', category: 'spacing', description: 'Extra small spacing' },
  { name: 'spacing-sm', value: '0.5rem', category: 'spacing', description: 'Small spacing' },
  { name: 'spacing-md', value: '1rem', category: 'spacing', description: 'Medium spacing' },
  { name: 'spacing-lg', value: '1.5rem', category: 'spacing', description: 'Large spacing' },
  { name: 'spacing-xl', value: '2rem', category: 'spacing', description: 'Extra large spacing' },
  { name: 'spacing-2xl', value: '3rem', category: 'spacing', description: '2XL spacing' },
  { name: 'spacing-3xl', value: '4rem', category: 'spacing', description: '3XL spacing' },
  { name: 'spacing-4xl', value: '6rem', category: 'spacing', description: '4XL spacing' },
  
  // Border Radius
  { name: 'border-radius-none', value: '0', category: 'border', description: 'No border radius' },
  { name: 'border-radius-sm', value: '0.125rem', category: 'border', description: 'Small border radius' },
  { name: 'border-radius-md', value: '0.375rem', category: 'border', description: 'Medium border radius' },
  { name: 'border-radius-lg', value: '0.5rem', category: 'border', description: 'Large border radius' },
  { name: 'border-radius-xl', value: '0.75rem', category: 'border', description: 'Extra large border radius' },
  { name: 'border-radius-full', value: '9999px', category: 'border', description: 'Full border radius' },
  
  // Shadows
  { name: 'shadow-sm', value: '0 1px 2px 0 rgb(0 0 0 / 0.05)', category: 'shadow', description: 'Small shadow' },
  { name: 'shadow-md', value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', category: 'shadow', description: 'Medium shadow' },
  { name: 'shadow-lg', value: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', category: 'shadow', description: 'Large shadow' },
  { name: 'shadow-xl', value: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', category: 'shadow', description: 'Extra large shadow' },
  { name: 'shadow-2xl', value: '0 25px 50px -12px rgb(0 0 0 / 0.25)', category: 'shadow', description: '2XL shadow' },
  
  // Animation
  { name: 'duration-fast', value: '150ms', category: 'animation', description: 'Fast animation duration' },
  { name: 'duration-normal', value: '300ms', category: 'animation', description: 'Normal animation duration' },
  { name: 'duration-slow', value: '500ms', category: 'animation', description: 'Slow animation duration' },
  { name: 'easing-linear', value: 'linear', category: 'animation', description: 'Linear easing' },
  { name: 'easing-ease', value: 'cubic-bezier(0.4, 0, 0.2, 1)', category: 'animation', description: 'Standard ease' },
  { name: 'easing-ease-in', value: 'cubic-bezier(0.4, 0, 1, 1)', category: 'animation', description: 'Ease in' },
  { name: 'easing-ease-out', value: 'cubic-bezier(0, 0, 0.2, 1)', category: 'animation', description: 'Ease out' },
  { name: 'easing-ease-in-out', value: 'cubic-bezier(0.4, 0, 0.2, 1)', category: 'animation', description: 'Ease in out' },
];

// Color Palette
export const colorPalette: ColorPalette = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
};

// Typography Scale
export const typographyScale: TypographyScale = {
  xs: { fontSize: '0.75rem', lineHeight: '1rem', fontWeight: '400' },
  sm: { fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: '400' },
  base: { fontSize: '1rem', lineHeight: '1.5rem', fontWeight: '400' },
  lg: { fontSize: '1.125rem', lineHeight: '1.75rem', fontWeight: '400' },
  xl: { fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: '500' },
  '2xl': { fontSize: '1.5rem', lineHeight: '2rem', fontWeight: '600' },
  '3xl': { fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: '600' },
  '4xl': { fontSize: '2.25rem', lineHeight: '2.5rem', fontWeight: '700' },
  '5xl': { fontSize: '3rem', lineHeight: '1', fontWeight: '700' },
};

// Spacing Scale
export const spacingScale: SpacingScale = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem',
};

// Border Radius
export const borderRadius: BorderRadius = {
  none: '0',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  full: '9999px',
};

// Shadow Scale
export const shadowScale: ShadowScale = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
};

// Animation Configuration
export const animationConfig: AnimationConfig = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    linear: 'linear',
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  delay: {
    none: '0ms',
    short: '100ms',
    medium: '200ms',
    long: '300ms',
  },
};

// Utility Functions
export function getTokenValue(tokenName: string): string | number | undefined {
  const token = designTokens.find(t => t.name === tokenName);
  return token?.value;
}

export function getColorValue(colorName: string): string | undefined {
  const [category, shade] = colorName.split('-');
  if (category === 'semantic') {
    return colorPalette.semantic[shade as keyof typeof colorPalette.semantic];
  }
  return colorPalette[category as keyof Omit<ColorPalette, 'semantic'>]?.[shade as keyof typeof colorPalette.primary];
}

export function getTypographyStyle(size: keyof TypographyScale) {
  return typographyScale[size];
}

export function getSpacing(size: keyof SpacingScale) {
  return spacingScale[size];
}

export function getBorderRadius(size: keyof BorderRadius) {
  return borderRadius[size];
}

export function getShadow(size: keyof ShadowScale) {
  return shadowScale[size];
}

export function getAnimationDuration(type: keyof AnimationConfig['duration']) {
  return animationConfig.duration[type];
}

export function getAnimationEasing(type: keyof AnimationConfig['easing']) {
  return animationConfig.easing[type];
}

// CSS Custom Properties Generator
export function generateCSSVariables(): string {
  return designTokens
    .map(token => `--${token.name}: ${token.value};`)
    .join('\n  ');
}

// Design System Export
export const designSystem = {
  tokens: designTokens,
  colors: colorPalette,
  typography: typographyScale,
  spacing: spacingScale,
  borderRadius,
  shadows: shadowScale,
  animation: animationConfig,
  utils: {
    getTokenValue,
    getColorValue,
    getTypographyStyle,
    getSpacing,
    getBorderRadius,
    getShadow,
    getAnimationDuration,
    getAnimationEasing,
    generateCSSVariables,
  },
}; 