import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function triggerHapticFeedback(pattern: VibratePattern = 75) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      // Prevent vibration on non-mobile devices that might support the API
      if (!/Mobi|Android/i.test(navigator.userAgent)) {
        return;
      }
      navigator.vibrate(pattern);
    } catch (e) {
      console.error("Haptic feedback failed", e);
    }
  }
}
