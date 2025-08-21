# FixMo Design System Guide

## 🎨 **Overview**

The FixMo Design System provides enterprise-grade UI components with advanced animations, voice interfaces, and personalization features.

## 🚀 **Quick Start**

```tsx
import { EnhancedButton, ImmersiveCard, VoiceInterface } from '@/components/ui';

// Enhanced Button with animations
<EnhancedButton
  variant="primary"
  size="lg"
  animation="bounceIn"
  hoverEffect="glow"
  clickEffect="ripple"
  gradient
>
  Get Started
</EnhancedButton>

// Immersive Card with 3D effects
<ImmersiveCard
  variant="glass"
  interactive
  tilt
  parallax
  animation="fadeIn"
  hoverEffect="lift"
>
  <h3>Welcome to FixMo</h3>
  <p>Experience the future of task management.</p>
</ImmersiveCard>

// Voice Interface
<VoiceInterface
  onCommand={(command) => console.log(command)}
  commands={[
    { phrase: 'open dashboard', action: () => router.push('/dashboard') }
  ]}
/>
```

## 🎯 **Key Features**

### 1. **Design Tokens**
- Consistent color palette, typography, spacing
- Semantic color system
- Responsive design tokens

### 2. **Advanced Animations**
- 20+ pre-built animation presets
- Micro-interactions and hover effects
- Gesture recognition for mobile
- Performance-optimized CSS animations

### 3. **Voice & Conversational UI**
- Speech recognition and synthesis
- Custom voice commands
- Chat interface integration
- Accessibility-focused design

### 4. **Personalization Engine**
- User preference learning
- Adaptive interfaces
- Customizable dashboards
- Usage-based recommendations

### 5. **Immersive Components**
- 3D tilt effects
- Parallax scrolling
- Glass morphism
- Holographic effects

## 📚 **Component Library**

### EnhancedButton
```tsx
<EnhancedButton
  variant="primary|secondary|outline|ghost|destructive|success|warning"
  size="sm|md|lg|xl"
  animation="fadeIn|scaleIn|bounceIn|slideInUp|slideInLeft"
  hoverEffect="scale|glow|slide|rotate|none"
  clickEffect="ripple|pulse|shake|none"
  loading={boolean}
  gradient={boolean}
  glass={boolean}
/>
```

### ImmersiveCard
```tsx
<ImmersiveCard
  variant="default|glass|gradient|neon|holographic"
  size="sm|md|lg|xl"
  interactive={boolean}
  parallax={boolean}
  tilt={boolean}
  glow={boolean}
  animation="fadeIn|scaleIn|bounceIn|slideInUp|slideInLeft"
  hoverEffect="lift|glow|scale|rotate|tilt|none"
/>
```

### VoiceInterface
```tsx
<VoiceInterface
  enabled={boolean}
  autoStart={boolean}
  showChat={boolean}
  onCommand={(command) => void}
  onMessage={(message) => void}
  commands={VoiceCommand[]}
/>
```

### PersonalizedDashboard
```tsx
<PersonalizedDashboard
  widgets={DashboardWidget[]}
  showPersonalization={boolean}
  onWidgetUpdate={(widgetId, updates) => void}
  onLayoutChange={(layout) => void}
/>
```

## 🎬 **Animation System**

### Animation Presets
```typescript
import { animationPresets } from '@/lib/animation-library';

// Available presets
fadeIn, fadeOut, fadeInUp, fadeInDown
scaleIn, scaleOut, scaleUp, scaleDown
slideInLeft, slideInRight, slideInUp, slideInDown
bounceIn, bounceOut, elasticIn, elasticOut
pulse, shake, wobble, spin
```

### Animation Controller
```typescript
import { AnimationController } from '@/lib/animation-library';

const controller = new AnimationController(element);
controller.fadeIn();
controller.scaleIn();
controller.bounceIn();
```

### Micro-Interactions
```typescript
import { MicroInteractionManager } from '@/lib/animation-library';

const manager = new MicroInteractionManager();
manager.addHoverEffect('.button', animationPresets.scaleUp);
manager.addClickEffect('.card', animationPresets.pulse);
manager.addScrollReveal('.section', animationPresets.fadeInUp);
```

## 🎨 **Design Tokens**

### Colors
```css
/* Primary Colors */
--primary-50: #eff6ff;
--primary-500: #3b82f6;
--primary-900: #1e3a8a;

/* Secondary Colors */
--secondary-50: #f0fdf4;
--secondary-500: #22c55e;
--secondary-900: #14532d;

/* Semantic Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### Typography
```css
/* Font Sizes */
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
--font-size-2xl: 1.5rem;
--font-size-3xl: 1.875rem;
--font-size-4xl: 2.25rem;
--font-size-5xl: 3rem;
```

### Spacing
```css
/* Spacing Scale */
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */
--spacing-4xl: 6rem;     /* 96px */
```

## ♿ **Accessibility**

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader optimization
- Motion preference respect
- High contrast support
- Voice command alternatives

## 🚀 **Performance**

- CSS-based animations for smooth performance
- Lazy loading for components
- Optimized bundle size
- Efficient gesture recognition
- Memory-conscious personalization

## 📱 **Mobile Support**

- Touch gesture recognition
- Responsive design
- Mobile-optimized animations
- Voice interface optimization
- Adaptive layouts

## 🔧 **Customization**

### Custom Theme
```typescript
import { designSystem } from '@/lib/design-system';

const customTheme = {
  colors: {
    primary: { 500: '#your-color' }
  }
};

designSystem.applyTheme(customTheme);
```

### Custom Animations
```typescript
const customAnimation = {
  name: 'customFade',
  duration: '400ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  properties: { opacity: 1, transform: 'translateY(0)' }
};
```

## 📚 **Resources**

- [Full Documentation](./DESIGN_SYSTEM_DOCUMENTATION.md)
- [Component Examples](./examples)
- [Design Tokens](./tokens)
- [Accessibility Guide](./accessibility)

---

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: December 2024 