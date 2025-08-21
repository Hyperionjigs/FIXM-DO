/**
 * Image Quality Assessment System
 * 
 * Implements comprehensive image quality analysis for verification photos:
 * - Brightness analysis
 * - Contrast measurement  
 * - Sharpness detection
 * - Noise level assessment
 * - Quality scoring system
 * - Real-time feedback
 */

export interface QualityMetrics {
  brightness: number;        // 0-100%
  contrast: number;          // 0-100%
  sharpness: number;         // 0-100%
  noise: number;            // 0-100% (lower is better)
  overall: number;          // 0-100%
}

export interface QualityFeedback {
  metrics: QualityMetrics;
  issues: string[];
  suggestions: string[];
  isAcceptable: boolean;
  threshold: {
    brightness: { min: number; max: number; optimal: { min: number; max: number } };
    contrast: { min: number; optimal: number };
    sharpness: { min: number; optimal: number };
    noise: { max: number; optimal: number };
  };
}

export class ImageQualityAssessment {
  private static readonly BRIGHTNESS_THRESHOLD = { min: 25, max: 85, optimal: { min: 45, max: 75 } };
  private static readonly CONTRAST_THRESHOLD = { min: 12, optimal: 20 };
  private static readonly SHARPNESS_THRESHOLD = { min: 50, optimal: 70 };
  private static readonly NOISE_THRESHOLD = { max: 50, optimal: 25 };

  /**
   * Analyze image quality from canvas data
   */
  static analyzeQuality(imageData: ImageData): QualityFeedback {
    const metrics = this.calculateMetrics(imageData);
    const issues = this.identifyIssues(metrics);
    const suggestions = this.generateSuggestions(metrics, issues);
    const isAcceptable = this.isQualityAcceptable(metrics);

    return {
      metrics,
      issues,
      suggestions,
      isAcceptable,
      threshold: {
        brightness: this.BRIGHTNESS_THRESHOLD,
        contrast: this.CONTRAST_THRESHOLD,
        sharpness: this.SHARPNESS_THRESHOLD,
        noise: this.NOISE_THRESHOLD
      }
    };
  }

  /**
   * Calculate all quality metrics
   */
  private static calculateMetrics(imageData: ImageData): QualityMetrics {
    const brightness = this.calculateBrightness(imageData);
    const contrast = this.calculateContrast(imageData);
    const sharpness = this.calculateSharpness(imageData);
    const noise = this.calculateNoise(imageData);
    
    // Calculate overall score with weighted average
    const overall = (
      brightness * 0.25 +
      contrast * 0.25 +
      sharpness * 0.3 +
      (100 - noise) * 0.2  // Invert noise (lower is better)
    );

    return {
      brightness,
      contrast,
      sharpness,
      noise,
      overall: Math.round(overall)
    };
  }

  /**
   * Calculate image brightness (0-100%)
   */
  private static calculateBrightness(imageData: ImageData): number {
    const { data, width, height } = imageData;
    let totalBrightness = 0;
    let pixelCount = 0;

    // Sample every 4th pixel for performance
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Calculate perceived brightness using luminance formula
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      totalBrightness += brightness;
      pixelCount++;
    }

    return Math.round((totalBrightness / pixelCount) * 100);
  }

  /**
   * Calculate image contrast (0-100%)
   */
  private static calculateContrast(imageData: ImageData): number {
    const { data, width, height } = imageData;
    const brightnessValues: number[] = [];

    // Calculate brightness for each pixel
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      brightnessValues.push(brightness);
    }

    // Calculate standard deviation as contrast measure
    const mean = brightnessValues.reduce((sum, val) => sum + val, 0) / brightnessValues.length;
    const variance = brightnessValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / brightnessValues.length;
    const stdDev = Math.sqrt(variance);

    // Convert to percentage (0-100%)
    return Math.round(Math.min(stdDev * 100, 100));
  }

  /**
   * Calculate image sharpness using Laplacian variance
   */
  private static calculateSharpness(imageData: ImageData): number {
    const { data, width, height } = imageData;
    let sharpnessSum = 0;
    let pixelCount = 0;

    // Apply Laplacian filter for edge detection
    for (let y = 1; y < height - 1; y += 2) {
      for (let x = 1; x < width - 1; x += 2) {
        const idx = (y * width + x) * 4;
        
        // Get surrounding pixels
        const center = this.getBrightness(data, idx);
        const top = this.getBrightness(data, idx - width * 4);
        const bottom = this.getBrightness(data, idx + width * 4);
        const left = this.getBrightness(data, idx - 4);
        const right = this.getBrightness(data, idx + 4);

        // Laplacian operator
        const laplacian = Math.abs(4 * center - top - bottom - left - right);
        sharpnessSum += laplacian;
        pixelCount++;
      }
    }

    const averageSharpness = sharpnessSum / pixelCount;
    // Normalize to 0-100% range
    return Math.round(Math.min(averageSharpness * 10, 100));
  }

  /**
   * Calculate image noise level
   */
  private static calculateNoise(imageData: ImageData): number {
    const { data, width, height } = imageData;
    let noiseSum = 0;
    let pixelCount = 0;

    // Calculate local variance as noise measure
    for (let y = 1; y < height - 1; y += 2) {
      for (let x = 1; x < width - 1; x += 2) {
        const idx = (y * width + x) * 4;
        
        const center = this.getBrightness(data, idx);
        const neighbors = [
          this.getBrightness(data, idx - width * 4),
          this.getBrightness(data, idx + width * 4),
          this.getBrightness(data, idx - 4),
          this.getBrightness(data, idx + 4)
        ];

        // Calculate local variance
        const mean = (center + neighbors.reduce((sum, val) => sum + val, 0)) / 5;
        const variance = neighbors.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / 4;
        
        noiseSum += variance;
        pixelCount++;
      }
    }

    const averageNoise = noiseSum / pixelCount;
    // Normalize to 0-100% range (lower is better)
    return Math.round(Math.min(averageNoise * 100, 100));
  }

  /**
   * Get brightness value from pixel data
   */
  private static getBrightness(data: Uint8ClampedArray, index: number): number {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  /**
   * Identify quality issues
   */
  private static identifyIssues(metrics: QualityMetrics): string[] {
    const issues: string[] = [];

    if (metrics.brightness < this.BRIGHTNESS_THRESHOLD.min) {
      issues.push('Image is too dark');
    } else if (metrics.brightness > this.BRIGHTNESS_THRESHOLD.max) {
      issues.push('Image is too bright');
    }

    if (metrics.contrast < this.CONTRAST_THRESHOLD.min) {
      issues.push('Image lacks contrast');
    }

    if (metrics.sharpness < this.SHARPNESS_THRESHOLD.min) {
      issues.push('Image is blurry');
    }

    if (metrics.noise > this.NOISE_THRESHOLD.max) {
      issues.push('Image has too much noise');
    }

    return issues;
  }

  /**
   * Generate improvement suggestions
   */
  private static generateSuggestions(metrics: QualityMetrics, issues: string[]): string[] {
    const suggestions: string[] = [];

    if (metrics.brightness < this.BRIGHTNESS_THRESHOLD.min) {
      suggestions.push('Move to a brighter area or turn on more lights');
    } else if (metrics.brightness > this.BRIGHTNESS_THRESHOLD.max) {
      suggestions.push('Move to a less bright area or reduce lighting');
    }

    if (metrics.contrast < this.CONTRAST_THRESHOLD.min) {
      suggestions.push('Ensure good lighting and avoid flat backgrounds');
    }

    if (metrics.sharpness < this.SHARPNESS_THRESHOLD.min) {
      suggestions.push('Hold the camera steady and ensure it\'s focused');
    }

    if (metrics.noise > this.NOISE_THRESHOLD.max) {
      suggestions.push('Use better lighting and avoid low-light conditions');
    }

    if (suggestions.length === 0) {
      suggestions.push('Image quality looks good!');
    }

    return suggestions;
  }

  /**
   * Check if quality meets acceptable thresholds
   */
  private static isQualityAcceptable(metrics: QualityMetrics): boolean {
    return (
      metrics.brightness >= this.BRIGHTNESS_THRESHOLD.min &&
      metrics.brightness <= this.BRIGHTNESS_THRESHOLD.max &&
      metrics.contrast >= this.CONTRAST_THRESHOLD.min &&
      metrics.sharpness >= this.SHARPNESS_THRESHOLD.min &&
      metrics.noise <= this.NOISE_THRESHOLD.max
    );
  }

  /**
   * Get quality score with color coding
   */
  static getQualityColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Get quality status text
   */
  static getQualityStatus(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  }
} 