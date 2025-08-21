// FixMo Animation & Interaction Library
// Advanced micro-interactions, gesture-based navigation, and immersive experiences

import { animationConfig } from './design-system';

export interface AnimationPreset {
  name: string;
  duration: string;
  easing: string;
  delay?: string;
  properties: Record<string, string | number>;
}

export interface GestureConfig {
  type: 'swipe' | 'pinch' | 'rotate' | 'pan' | 'tap' | 'longpress';
  direction?: 'up' | 'down' | 'left' | 'right';
  threshold?: number;
  callback: (event: any) => void;
}

export interface MicroInteraction {
  trigger: 'hover' | 'focus' | 'click' | 'load' | 'scroll' | 'gesture';
  animation: AnimationPreset;
  target: string | HTMLElement;
}

// Animation Presets
export const animationPresets: Record<string, AnimationPreset> = {
  // Fade Animations
  fadeIn: {
    name: 'fadeIn',
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.easeOut,
    properties: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  fadeOut: {
    name: 'fadeOut',
    duration: animationConfig.duration.fast,
    easing: animationConfig.easing.easeIn,
    properties: {
      opacity: 0,
      transform: 'translateY(10px)',
    },
  },
  fadeInUp: {
    name: 'fadeInUp',
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.easeOut,
    properties: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  fadeInDown: {
    name: 'fadeInDown',
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.easeOut,
    properties: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },

  // Scale Animations
  scaleIn: {
    name: 'scaleIn',
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.easeOut,
    properties: {
      opacity: 1,
      transform: 'scale(1)',
    },
  },
  scaleOut: {
    name: 'scaleOut',
    duration: animationConfig.duration.fast,
    easing: animationConfig.easing.easeIn,
    properties: {
      opacity: 0,
      transform: 'scale(0.9)',
    },
  },
  scaleUp: {
    name: 'scaleUp',
    duration: animationConfig.duration.fast,
    easing: animationConfig.easing.easeOut,
    properties: {
      transform: 'scale(1.05)',
    },
  },
  scaleDown: {
    name: 'scaleDown',
    duration: animationConfig.duration.fast,
    easing: animationConfig.easing.easeOut,
    properties: {
      transform: 'scale(0.95)',
    },
  },

  // Slide Animations
  slideInLeft: {
    name: 'slideInLeft',
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.easeOut,
    properties: {
      opacity: 1,
      transform: 'translateX(0)',
    },
  },
  slideInRight: {
    name: 'slideInRight',
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.easeOut,
    properties: {
      opacity: 1,
      transform: 'translateX(0)',
    },
  },
  slideInUp: {
    name: 'slideInUp',
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.easeOut,
    properties: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  slideInDown: {
    name: 'slideInDown',
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.easeOut,
    properties: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },

  // Bounce Animations
  bounceIn: {
    name: 'bounceIn',
    duration: animationConfig.duration.slow,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    properties: {
      opacity: 1,
      transform: 'scale(1)',
    },
  },
  bounceOut: {
    name: 'bounceOut',
    duration: animationConfig.duration.normal,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    properties: {
      opacity: 0,
      transform: 'scale(0.3)',
    },
  },

  // Elastic Animations
  elasticIn: {
    name: 'elasticIn',
    duration: animationConfig.duration.slow,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    properties: {
      opacity: 1,
      transform: 'scale(1)',
    },
  },
  elasticOut: {
    name: 'elasticOut',
    duration: animationConfig.duration.slow,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    properties: {
      opacity: 0,
      transform: 'scale(0.3)',
    },
  },

  // Attention Seekers
  pulse: {
    name: 'pulse',
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.easeInOut,
    properties: {
      transform: 'scale(1.05)',
    },
  },
  shake: {
    name: 'shake',
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.easeInOut,
    properties: {
      transform: 'translateX(0)',
    },
  },
  wobble: {
    name: 'wobble',
    duration: animationConfig.duration.slow,
    easing: animationConfig.easing.easeInOut,
    properties: {
      transform: 'rotate(0deg)',
    },
  },

  // Loading Animations
  spin: {
    name: 'spin',
    duration: '1s',
    easing: animationConfig.easing.linear,
    properties: {
      transform: 'rotate(360deg)',
    },
  },
  pulse: {
    name: 'pulse',
    duration: '2s',
    easing: animationConfig.easing.easeInOut,
    properties: {
      opacity: 1,
    },
  },
};

// Gesture Recognition System
export class GestureRecognizer {
  private element: HTMLElement;
  private gestures: GestureConfig[] = [];
  private touchStart: { x: number; y: number } | null = null;
  private touchEnd: { x: number; y: number } | null = null;

  constructor(element: HTMLElement) {
    this.element = element;
    this.initializeEventListeners();
  }

  private initializeEventListeners() {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  private handleTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    this.touchStart = { x: touch.clientX, y: touch.clientY };
  }

  private handleTouchEnd(event: TouchEvent) {
    const touch = event.changedTouches[0];
    this.touchEnd = { x: touch.clientX, y: touch.clientY };
    this.processGesture();
  }

  private handleMouseDown(event: MouseEvent) {
    this.touchStart = { x: event.clientX, y: event.clientY };
  }

  private handleMouseUp(event: MouseEvent) {
    this.touchEnd = { x: event.clientX, y: event.clientY };
    this.processGesture();
  }

  private processGesture() {
    if (!this.touchStart || !this.touchEnd) return;

    const deltaX = this.touchEnd.x - this.touchStart.x;
    const deltaY = this.touchEnd.y - this.touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Determine gesture type
    if (distance < 10) {
      this.triggerGesture('tap', { deltaX, deltaY, distance });
    } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
      const direction = deltaX > 0 ? 'right' : 'left';
      this.triggerGesture('swipe', { direction, deltaX, deltaY, distance });
    } else {
      const direction = deltaY > 0 ? 'down' : 'up';
      this.triggerGesture('swipe', { direction, deltaX, deltaY, distance });
    }

    this.touchStart = null;
    this.touchEnd = null;
  }

  private triggerGesture(type: string, data: any) {
    const matchingGestures = this.gestures.filter(
      gesture => gesture.type === type && (!gesture.direction || gesture.direction === data.direction)
    );

    matchingGestures.forEach(gesture => {
      if (!gesture.threshold || data.distance >= gesture.threshold) {
        gesture.callback(data);
      }
    });
  }

  addGesture(gesture: GestureConfig) {
    this.gestures.push(gesture);
  }

  removeGesture(gesture: GestureConfig) {
    const index = this.gestures.indexOf(gesture);
    if (index > -1) {
      this.gestures.splice(index, 1);
    }
  }
}

// Animation Controller
export class AnimationController {
  private element: HTMLElement;
  private currentAnimation: AnimationPreset | null = null;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  animate(preset: AnimationPreset, options?: { delay?: string; onComplete?: () => void }) {
    // Stop current animation
    this.stop();

    // Set initial state
    this.element.style.transition = `all ${preset.duration} ${preset.easing}`;
    if (options?.delay) {
      this.element.style.transitionDelay = options.delay;
    }

    // Apply animation properties
    Object.entries(preset.properties).forEach(([property, value]) => {
      this.element.style[property as any] = value.toString();
    });

    this.currentAnimation = preset;

    // Handle completion
    if (options?.onComplete) {
      const handleTransitionEnd = () => {
        this.element.removeEventListener('transitionend', handleTransitionEnd);
        options.onComplete?.();
      };
      this.element.addEventListener('transitionend', handleTransitionEnd);
    }
  }

  stop() {
    if (this.currentAnimation) {
      this.element.style.transition = 'none';
      this.currentAnimation = null;
    }
  }

  // Convenience methods
  fadeIn(options?: { delay?: string; onComplete?: () => void }) {
    this.animate(animationPresets.fadeIn, options);
  }

  fadeOut(options?: { delay?: string; onComplete?: () => void }) {
    this.animate(animationPresets.fadeOut, options);
  }

  scaleIn(options?: { delay?: string; onComplete?: () => void }) {
    this.animate(animationPresets.scaleIn, options);
  }

  scaleOut(options?: { delay?: string; onComplete?: () => void }) {
    this.animate(animationPresets.scaleOut, options);
  }

  slideInLeft(options?: { delay?: string; onComplete?: () => void }) {
    this.animate(animationPresets.slideInLeft, options);
  }

  slideInRight(options?: { delay?: string; onComplete?: () => void }) {
    this.animate(animationPresets.slideInRight, options);
  }

  bounceIn(options?: { delay?: string; onComplete?: () => void }) {
    this.animate(animationPresets.bounceIn, options);
  }

  pulse(options?: { delay?: string; onComplete?: () => void }) {
    this.animate(animationPresets.pulse, options);
  }
}

// Micro-Interaction Manager
export class MicroInteractionManager {
  private interactions: MicroInteraction[] = [];
  private gestureRecognizers: Map<HTMLElement, GestureRecognizer> = new Map();
  private animationControllers: Map<HTMLElement, AnimationController> = new Map();

  addInteraction(interaction: MicroInteraction) {
    this.interactions.push(interaction);
    this.setupInteraction(interaction);
  }

  private setupInteraction(interaction: MicroInteraction) {
    const target = typeof interaction.target === 'string' 
      ? document.querySelector(interaction.target) as HTMLElement
      : interaction.target;

    if (!target) return;

    // Get or create animation controller
    let controller = this.animationControllers.get(target);
    if (!controller) {
      controller = new AnimationController(target);
      this.animationControllers.set(target, controller);
    }

    // Setup trigger
    switch (interaction.trigger) {
      case 'hover':
        target.addEventListener('mouseenter', () => {
          controller.animate(interaction.animation);
        });
        target.addEventListener('mouseleave', () => {
          controller.stop();
        });
        break;

      case 'focus':
        target.addEventListener('focus', () => {
          controller.animate(interaction.animation);
        });
        target.addEventListener('blur', () => {
          controller.stop();
        });
        break;

      case 'click':
        target.addEventListener('click', () => {
          controller.animate(interaction.animation);
        });
        break;

      case 'load':
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            controller.animate(interaction.animation);
          });
        } else {
          controller.animate(interaction.animation);
        }
        break;

      case 'scroll':
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              controller.animate(interaction.animation);
            }
          });
        });
        observer.observe(target);
        break;

      case 'gesture':
        let recognizer = this.gestureRecognizers.get(target);
        if (!recognizer) {
          recognizer = new GestureRecognizer(target);
          this.gestureRecognizers.set(target, recognizer);
        }
        // Gesture setup would be handled separately
        break;
    }
  }

  removeInteraction(interaction: MicroInteraction) {
    const index = this.interactions.indexOf(interaction);
    if (index > -1) {
      this.interactions.splice(index, 1);
    }
  }

  // Utility methods for common interactions
  addHoverEffect(selector: string, animation: AnimationPreset) {
    this.addInteraction({
      trigger: 'hover',
      animation,
      target: selector,
    });
  }

  addClickEffect(selector: string, animation: AnimationPreset) {
    this.addInteraction({
      trigger: 'click',
      animation,
      target: selector,
    });
  }

  addScrollReveal(selector: string, animation: AnimationPreset) {
    this.addInteraction({
      trigger: 'scroll',
      animation,
      target: selector,
    });
  }
}

// Voice and Conversational UI Support
export class VoiceUI {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private commands: Map<string, () => void> = new Map();

  constructor() {
    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
  }

  private initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        this.processVoiceCommand(transcript);
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
    }
  }

  private initializeSpeechSynthesis() {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  private processVoiceCommand(transcript: string) {
    for (const [command, callback] of this.commands) {
      if (transcript.includes(command.toLowerCase())) {
        callback();
        break;
      }
    }
  }

  startListening() {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
      this.isListening = true;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text: string, options?: SpeechSynthesisUtteranceInit) {
    if (this.synthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      Object.assign(utterance, options);
      this.synthesis.speak(utterance);
    }
  }

  addVoiceCommand(command: string, callback: () => void) {
    this.commands.set(command, callback);
  }

  removeVoiceCommand(command: string) {
    this.commands.delete(command);
  }
}

// Personalization Engine
export class PersonalizationEngine {
  private userPreferences: Map<string, any> = new Map();
  private learningData: Map<string, number[]> = new Map();

  setPreference(key: string, value: any) {
    this.userPreferences.set(key, value);
    this.saveToStorage();
  }

  getPreference(key: string, defaultValue?: any) {
    return this.userPreferences.get(key) ?? defaultValue;
  }

  learnFromInteraction(interactionType: string, value: number) {
    if (!this.learningData.has(interactionType)) {
      this.learningData.set(interactionType, []);
    }
    this.learningData.get(interactionType)!.push(value);
  }

  getPrediction(interactionType: string): number | null {
    const data = this.learningData.get(interactionType);
    if (!data || data.length === 0) return null;

    // Simple average prediction
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  }

  private saveToStorage() {
    try {
      localStorage.setItem('fixmo-preferences', JSON.stringify(Array.from(this.userPreferences.entries())));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('fixmo-preferences');
      if (stored) {
        const preferences = JSON.parse(stored);
        this.userPreferences = new Map(preferences);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }
}

// Export main classes and utilities
export const AnimationLibrary = {
  presets: animationPresets,
  GestureRecognizer,
  AnimationController,
  MicroInteractionManager,
  VoiceUI,
  PersonalizationEngine,
}; 