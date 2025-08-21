# FixMo Design System Documentation

## 🎨 **Overview**

The FixMo Design System is a comprehensive, enterprise-grade design system that provides consistent, accessible, and beautiful user interfaces. It includes design tokens, component library, animation system, and personalization features.

## 📚 **Table of Contents**

1. [Design Tokens](#design-tokens)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Component Library](#component-library)
6. [Animation System](#animation-system)
7. [Interaction Patterns](#interaction-patterns)
8. [Accessibility Guidelines](#accessibility-guidelines)
9. [Implementation Guide](#implementation-guide)
10. [Best Practices](#best-practices)

---

## 🎯 **Design Tokens**

### Core Design Tokens

Our design system is built on a foundation of design tokens that ensure consistency across all components and interfaces.

```typescript
// Import design tokens
import { designSystem } from '@/lib/design-system';

// Access tokens
const primaryColor = designSystem.utils.getColorValue('primary-500');
const spacing = designSystem.utils.getSpacing('md');
const borderRadius = designSystem.utils.getBorderRadius('lg');
```

### Token Categories

- **Colors**: Primary, secondary, neutral, and semantic colors
- **Typography**: Font families, sizes, weights, and line heights
- **Spacing**: Consistent spacing scale from xs to 4xl
- **Borders**: Border radius and border styles
- **Shadows**: Elevation and depth through shadow system
- **Animation**: Duration, easing, and delay configurations

---

## 🌈 **Color System**

### Primary Colors

```css
/* Primary Color Palette */
--primary-50: #eff6ff;   /* Lightest */
--primary-100: #dbeafe;  /* Light */
--primary-200: #bfdbfe;  /* Lighter */
--primary-300: #93c5fd;  /* Light */
--primary-400: #60a5fa;  /* Medium Light */
--primary-500: #3b82f6;  /* Base */
--primary-600: #2563eb;  /* Medium Dark */
--primary-700: #1d4ed8;  /* Dark */
--primary-800: #1e40af;  /* Darker */
--primary-900: #1e3a8a;  /* Darkest */
```

### Secondary Colors

```css
/* Secondary Color Palette */
--secondary-50: #f0fdf4;   /* Lightest */
--secondary-100: #dcfce7;  /* Light */
--secondary-200: #bbf7d0;  /* Lighter */
--secondary-300: #86efac;  /* Light */
--secondary-400: #4ade80;  /* Medium Light */
--secondary-500: #22c55e;  /* Base */
--secondary-600: #16a34a;  /* Medium Dark */
--secondary-700: #15803d;  /* Dark */
--secondary-800: #166534;  /* Darker */
--secondary-900: #14532d;  /* Darkest */
```

### Semantic Colors

```css
/* Semantic Colors */
--success: #10b981;    /* Green */
--warning: #f59e0b;    /* Amber */
--error: #ef4444;      /* Red */
--info: #3b82f6;       /* Blue */
```

### Usage Guidelines

- **Primary**: Use for main actions, links, and brand elements
- **Secondary**: Use for supporting actions and highlights
- **Semantic**: Use for status indicators and feedback
- **Neutral**: Use for text, backgrounds, and borders

---

## 📝 **Typography**

### Font Families

```css
/* Primary Font */
font-family: 'Inter', system-ui, sans-serif;

/* Monospace Font */
font-family: 'JetBrains Mono', monospace;
```

### Type Scale

```typescript
// Typography Scale
const typography = {
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
```

### Usage Guidelines

- **xs**: Captions, labels, and small text
- **sm**: Body text in compact spaces
- **base**: Default body text
- **lg**: Large body text and subheadings
- **xl**: Section headings
- **2xl**: Page headings
- **3xl**: Large page headings
- **4xl**: Hero headings
- **5xl**: Display headings

---

## 📏 **Spacing & Layout**

### Spacing Scale

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

### Border Radius

```css
/* Border Radius Scale */
--border-radius-none: 0;
--border-radius-sm: 0.125rem;   /* 2px */
--border-radius-md: 0.375rem;   /* 6px */
--border-radius-lg: 0.5rem;     /* 8px */
--border-radius-xl: 0.75rem;    /* 12px */
--border-radius-full: 9999px;   /* Full */
```

### Layout Guidelines

- Use consistent spacing multiples (4px base unit)
- Maintain visual hierarchy through spacing
- Use larger spacing for section breaks
- Apply smaller spacing for related elements

---

## 🧩 **Component Library**

### Enhanced Button

A versatile button component with advanced animations and interactions.

```tsx
import { EnhancedButton } from '@/components/ui/enhanced-button';

// Basic Usage
<EnhancedButton variant="primary" size="md">
  Click Me
</EnhancedButton>

// With Icons and Effects
<EnhancedButton
  variant="primary"
  size="lg"
  icon={<Star className="w-4 h-4" />}
  iconPosition="left"
  animation="bounceIn"
  hoverEffect="glow"
  clickEffect="ripple"
  gradient
>
  Enhanced Button
</EnhancedButton>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'destructive' \| 'success' \| 'warning'` | `'primary'` | Button style variant |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Show loading state |
| `icon` | `React.ReactNode` | - | Icon element |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon position |
| `animation` | `'none' \| 'fadeIn' \| 'scaleIn' \| 'bounceIn' \| 'slideInUp' \| 'slideInLeft'` | `'none'` | Initial animation |
| `hoverEffect` | `'scale' \| 'glow' \| 'slide' \| 'rotate' \| 'none'` | `'scale'` | Hover animation |
| `clickEffect` | `'ripple' \| 'pulse' \| 'shake' \| 'none'` | `'ripple'` | Click animation |
| `gradient` | `boolean` | `false` | Apply gradient background |
| `glass` | `boolean` | `false` | Apply glass morphism effect |

### Immersive Card

An interactive card component with 3D effects and advanced interactions.

```tsx
import { ImmersiveCard } from '@/components/ui/immersive-card';

// Basic Usage
<ImmersiveCard variant="default" size="md">
  <h3>Card Title</h3>
  <p>Card content goes here...</p>
</ImmersiveCard>

// Advanced Usage
<ImmersiveCard
  variant="glass"
  size="lg"
  interactive
  parallax
  tilt
  glow
  animation="fadeIn"
  hoverEffect="lift"
  image="/path/to/image.jpg"
  header={<h3>Card Header</h3>}
  footer={<p>Card Footer</p>}
>
  <p>Interactive card content...</p>
</ImmersiveCard>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'glass' \| 'gradient' \| 'neon' \| 'holographic'` | `'default'` | Card style variant |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Card size |
| `interactive` | `boolean` | `true` | Enable interactions |
| `parallax` | `boolean` | `false` | Enable parallax effect |
| `tilt` | `boolean` | `false` | Enable 3D tilt effect |
| `glow` | `boolean` | `false` | Enable glow effect |
| `animation` | `'none' \| 'fadeIn' \| 'scaleIn' \| 'bounceIn' \| 'slideInUp' \| 'slideInLeft'` | `'none'` | Initial animation |
| `hoverEffect` | `'lift' \| 'glow' \| 'scale' \| 'rotate' \| 'tilt' \| 'none'` | `'lift'` | Hover animation |

### Voice Interface

A voice-controlled interface component with speech recognition and synthesis.

```tsx
import { VoiceInterface } from '@/components/ui/voice-interface';

// Basic Usage
<VoiceInterface
  onCommand={(command) => console.log('Voice command:', command)}
  onMessage={(message) => console.log('Text message:', message)}
/>

// Advanced Usage
<VoiceInterface
  enabled={true}
  autoStart={false}
  showChat={true}
  placeholder="Say something or type a message..."
  commands={[
    {
      phrase: 'open dashboard',
      action: () => router.push('/dashboard'),
      description: 'Navigate to dashboard'
    },
    {
      phrase: 'create task',
      action: () => setShowTaskModal(true),
      description: 'Open task creation modal'
    }
  ]}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onCommand` | `(command: string) => void` | - | Voice command handler |
| `onMessage` | `(message: string) => void` | - | Text message handler |
| `enabled` | `boolean` | `true` | Enable voice features |
| `autoStart` | `boolean` | `false` | Auto-start listening |
| `showChat` | `boolean` | `true` | Show chat interface |
| `commands` | `Array<VoiceCommand>` | `[]` | Custom voice commands |

### Personalized Dashboard

A customizable dashboard component with adaptive interfaces and user preference learning.

```tsx
import { PersonalizedDashboard } from '@/components/ui/personalized-dashboard';

// Basic Usage
<PersonalizedDashboard
  widgets={dashboardWidgets}
  onWidgetUpdate={(widgetId, updates) => {
    console.log('Widget updated:', widgetId, updates);
  }}
/>

// Advanced Usage
<PersonalizedDashboard
  widgets={dashboardWidgets}
  showPersonalization={true}
  onWidgetUpdate={handleWidgetUpdate}
  onLayoutChange={handleLayoutChange}
/>
```

#### Widget Interface

```typescript
interface DashboardWidget {
  id: string;
  title: string;
  type: 'stats' | 'chart' | 'list' | 'progress' | 'alert' | 'info';
  content: React.ReactNode;
  priority: number;
  size: 'small' | 'medium' | 'large';
  category: string;
  isVisible: boolean;
  isPinned: boolean;
}
```

---

## 🎬 **Animation System**

### Animation Presets

Our animation system provides a comprehensive set of pre-built animations for common interactions.

```typescript
import { animationPresets } from '@/lib/animation-library';

// Available Presets
const presets = {
  // Fade Animations
  fadeIn: { duration: '300ms', easing: 'ease-out', properties: { opacity: 1 } },
  fadeOut: { duration: '150ms', easing: 'ease-in', properties: { opacity: 0 } },
  fadeInUp: { duration: '300ms', easing: 'ease-out', properties: { opacity: 1, transform: 'translateY(0)' } },
  fadeInDown: { duration: '300ms', easing: 'ease-out', properties: { opacity: 1, transform: 'translateY(0)' } },
  
  // Scale Animations
  scaleIn: { duration: '300ms', easing: 'ease-out', properties: { opacity: 1, transform: 'scale(1)' } },
  scaleOut: { duration: '150ms', easing: 'ease-in', properties: { opacity: 0, transform: 'scale(0.9)' } },
  scaleUp: { duration: '150ms', easing: 'ease-out', properties: { transform: 'scale(1.05)' } },
  scaleDown: { duration: '150ms', easing: 'ease-out', properties: { transform: 'scale(0.95)' } },
  
  // Slide Animations
  slideInLeft: { duration: '300ms', easing: 'ease-out', properties: { opacity: 1, transform: 'translateX(0)' } },
  slideInRight: { duration: '300ms', easing: 'ease-out', properties: { opacity: 1, transform: 'translateX(0)' } },
  slideInUp: { duration: '300ms', easing: 'ease-out', properties: { opacity: 1, transform: 'translateY(0)' } },
  slideInDown: { duration: '300ms', easing: 'ease-out', properties: { opacity: 1, transform: 'translateY(0)' } },
  
  // Bounce Animations
  bounceIn: { duration: '500ms', easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', properties: { opacity: 1, transform: 'scale(1)' } },
  bounceOut: { duration: '300ms', easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', properties: { opacity: 0, transform: 'scale(0.3)' } },
  
  // Attention Seekers
  pulse: { duration: '300ms', easing: 'ease-in-out', properties: { transform: 'scale(1.05)' } },
  shake: { duration: '300ms', easing: 'ease-in-out', properties: { transform: 'translateX(0)' } },
  wobble: { duration: '500ms', easing: 'ease-in-out', properties: { transform: 'rotate(0deg)' } },
};
```

### Animation Controller

The AnimationController provides programmatic control over animations.

```typescript
import { AnimationController } from '@/lib/animation-library';

// Usage
const element = document.querySelector('.my-element');
const controller = new AnimationController(element);

// Apply animations
controller.fadeIn();
controller.scaleIn();
controller.bounceIn();

// Custom animation
controller.animate(animationPresets.fadeIn, {
  delay: '200ms',
  onComplete: () => console.log('Animation complete')
});
```

### Micro-Interaction Manager

The MicroInteractionManager handles automatic animations based on user interactions.

```typescript
import { MicroInteractionManager } from '@/lib/animation-library';

// Usage
const manager = new MicroInteractionManager();

// Add hover effects
manager.addHoverEffect('.button', animationPresets.scaleUp);

// Add click effects
manager.addClickEffect('.card', animationPresets.pulse);

// Add scroll reveal
manager.addScrollReveal('.section', animationPresets.fadeInUp);
```

---

## 🎯 **Interaction Patterns**

### Gesture Recognition

Our gesture recognition system supports touch and mouse interactions.

```typescript
import { GestureRecognizer } from '@/lib/animation-library';

// Usage
const element = document.querySelector('.interactive-element');
const recognizer = new GestureRecognizer(element);

// Add gesture handlers
recognizer.addGesture({
  type: 'swipe',
  direction: 'left',
  threshold: 50,
  callback: (data) => {
    console.log('Swiped left:', data);
  }
});

recognizer.addGesture({
  type: 'tap',
  callback: (data) => {
    console.log('Tapped:', data);
  }
});
```

### Voice Commands

The voice interface supports custom voice commands.

```typescript
import { VoiceUI } from '@/lib/animation-library';

// Usage
const voiceUI = new VoiceUI();

// Add custom commands
voiceUI.addVoiceCommand('open dashboard', () => {
  router.push('/dashboard');
});

voiceUI.addVoiceCommand('create task', () => {
  setShowTaskModal(true);
});

// Start listening
voiceUI.startListening();

// Speak text
voiceUI.speak('Hello, how can I help you?');
```

### Personalization Engine

The personalization engine learns from user interactions and adapts the interface.

```typescript
import { PersonalizationEngine } from '@/lib/animation-library';

// Usage
const engine = new PersonalizationEngine();

// Set preferences
engine.setPreference('theme', 'dark');
engine.setPreference('layout', 'compact');

// Learn from interactions
engine.learnFromInteraction('button-click', 1);
engine.learnFromInteraction('widget-usage', 5);

// Get predictions
const prediction = engine.getPrediction('button-click');
console.log('Predicted usage:', prediction);
```

---

## ♿ **Accessibility Guidelines**

### Color Contrast

- Ensure minimum contrast ratio of 4.5:1 for normal text
- Ensure minimum contrast ratio of 3:1 for large text
- Test with color blindness simulators

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Use logical tab order
- Provide visible focus indicators
- Support keyboard shortcuts for common actions

### Screen Reader Support

- Use semantic HTML elements
- Provide descriptive alt text for images
- Use ARIA labels and descriptions
- Test with screen readers

### Motion and Animation

- Respect `prefers-reduced-motion` setting
- Provide animation controls
- Ensure animations don't cause motion sickness
- Use subtle animations for better accessibility

### Voice Interface Accessibility

- Provide visual feedback for voice commands
- Support keyboard alternatives for voice features
- Ensure voice commands are discoverable
- Provide clear error messages for voice recognition failures

---

## 🚀 **Implementation Guide**

### Setup

1. Install dependencies:
```bash
npm install @fixmo/design-system
```

2. Import the design system:
```typescript
import { designSystem } from '@/lib/design-system';
```

3. Add CSS variables to your global styles:
```css
:root {
  /* Design tokens will be automatically injected */
}
```

### Basic Usage

```tsx
import { EnhancedButton, ImmersiveCard } from '@/components/ui';

function MyComponent() {
  return (
    <div className="space-y-4">
      <EnhancedButton
        variant="primary"
        size="lg"
        animation="bounceIn"
        hoverEffect="glow"
      >
        Get Started
      </EnhancedButton>
      
      <ImmersiveCard
        variant="glass"
        interactive
        tilt
        animation="fadeIn"
      >
        <h3>Welcome to FixMo</h3>
        <p>Experience the future of task management.</p>
      </ImmersiveCard>
    </div>
  );
}
```

### Advanced Usage

```tsx
import { 
  PersonalizedDashboard, 
  VoiceInterface,
  MicroInteractionManager 
} from '@/components/ui';

function Dashboard() {
  const [widgets, setWidgets] = useState(dashboardWidgets);
  
  // Initialize micro-interactions
  useEffect(() => {
    const manager = new MicroInteractionManager();
    manager.addScrollReveal('.widget', animationPresets.fadeInUp);
  }, []);

  return (
    <div>
      <PersonalizedDashboard
        widgets={widgets}
        onWidgetUpdate={handleWidgetUpdate}
        showPersonalization={true}
      />
      
      <VoiceInterface
        onCommand={handleVoiceCommand}
        commands={voiceCommands}
      />
    </div>
  );
}
```

---

## 📋 **Best Practices**

### Design Principles

1. **Consistency**: Use design tokens consistently across all components
2. **Accessibility**: Ensure all components meet WCAG 2.1 AA standards
3. **Performance**: Optimize animations and interactions for smooth performance
4. **Usability**: Design for real users with real needs
5. **Scalability**: Build components that can grow with your application

### Component Guidelines

1. **Composition**: Build complex components from simple, reusable pieces
2. **Props**: Use clear, descriptive prop names
3. **Defaults**: Provide sensible defaults for all props
4. **Validation**: Validate props and provide helpful error messages
5. **Documentation**: Document all props, examples, and use cases

### Animation Guidelines

1. **Purpose**: Use animations to enhance, not distract
2. **Performance**: Use CSS transforms and opacity for smooth animations
3. **Timing**: Keep animations under 300ms for responsive feel
4. **Easing**: Use appropriate easing functions for natural motion
5. **Accessibility**: Respect user motion preferences

### Voice Interface Guidelines

1. **Feedback**: Provide clear visual and audio feedback
2. **Fallbacks**: Always provide keyboard and mouse alternatives
3. **Discovery**: Make voice commands discoverable and learnable
4. **Error Handling**: Handle recognition errors gracefully
5. **Privacy**: Be transparent about voice data usage

### Personalization Guidelines

1. **Learning**: Learn from user behavior without being intrusive
2. **Control**: Give users control over personalization settings
3. **Transparency**: Be clear about what data is collected and why
4. **Defaults**: Provide good defaults for new users
5. **Privacy**: Respect user privacy and data preferences

---

## 🔧 **Customization**

### Theming

```typescript
// Custom theme configuration
const customTheme = {
  colors: {
    primary: {
      500: '#your-primary-color',
      // ... other shades
    },
    // ... other color categories
  },
  // ... other theme properties
};

// Apply custom theme
designSystem.applyTheme(customTheme);
```

### Custom Components

```tsx
// Create custom component using design tokens
import { designSystem } from '@/lib/design-system';

const CustomComponent = styled.div`
  background-color: ${designSystem.utils.getColorValue('primary-500')};
  padding: ${designSystem.utils.getSpacing('lg')};
  border-radius: ${designSystem.utils.getBorderRadius('md')};
  box-shadow: ${designSystem.utils.getShadow('lg')};
`;
```

### Custom Animations

```typescript
// Create custom animation preset
const customAnimation = {
  name: 'customFade',
  duration: '400ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  properties: {
    opacity: 1,
    transform: 'translateY(0) scale(1)',
  },
};

// Use custom animation
animationController.animate(customAnimation);
```

---

## 📚 **Resources**

### Documentation

- [Component API Reference](./api-reference.md)
- [Design Tokens Reference](./design-tokens.md)
- [Animation Reference](./animation-reference.md)
- [Accessibility Guide](./accessibility-guide.md)

### Tools

- [Design System Playground](./playground)
- [Component Storybook](./storybook)
- [Design Token Generator](./token-generator)
- [Accessibility Checker](./accessibility-checker)

### Support

- [GitHub Issues](https://github.com/fixmo/design-system/issues)
- [Discord Community](https://discord.gg/fixmo)
- [Documentation](https://docs.fixmo.com/design-system)
- [Email Support](mailto:design-system@fixmo.com)

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready 