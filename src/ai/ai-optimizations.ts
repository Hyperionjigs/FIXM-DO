/**
 * AI Engineering Optimizations for FixMo
 * 
 * Key improvements:
 * - Token usage tracking
 * - Prompt optimization
 * - Error handling
 * - Performance monitoring
 */

// Token usage tracking
export class TokenTracker {
  private usage: Array<{
    model: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    timestamp: Date;
  }> = [];

  trackUsage(model: string, inputTokens: number, outputTokens: number): void {
    const cost = this.calculateCost(model, inputTokens, outputTokens);
    this.usage.push({
      model,
      inputTokens,
      outputTokens,
      cost,
      timestamp: new Date()
    });
  }

  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const costRates = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
      'claude-3': { input: 0.015, output: 0.075 },
      'gemini-pro': { input: 0.0005, output: 0.0015 }
    };
    
    const rate = costRates[model as keyof typeof costRates] || costRates['gpt-3.5-turbo'];
    return (inputTokens / 1000) * rate.input + (outputTokens / 1000) * rate.output;
  }

  getTotalCost(): number {
    return this.usage.reduce((sum, u) => sum + u.cost, 0);
  }
}

// Prompt optimization
export class PromptOptimizer {
  private prompts = new Map<string, string>();

  setPrompt(key: string, prompt: string): void {
    this.prompts.set(key, prompt);
  }

  getPrompt(key: string): string | null {
    return this.prompts.get(key) || null;
  }

  optimizePrompt(prompt: string, context: any): string {
    // Add context-specific optimizations
    let optimized = prompt;
    
    if (context.deviceInfo) {
      optimized += `\nDevice context: ${JSON.stringify(context.deviceInfo)}`;
    }
    
    if (context.userHistory) {
      optimized += `\nUser history: ${context.userHistory.length} previous attempts`;
    }
    
    return optimized;
  }
}

// Error handling with fallbacks
export class AIErrorHandler {
  static handleError(error: any, fallback: any): any {
    console.error('AI Error:', error);
    
    // Return fallback with error context
    return {
      ...fallback,
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN',
        timestamp: new Date()
      }
    };
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Array<{
    operation: string;
    duration: number;
    success: boolean;
    timestamp: Date;
  }> = [];

  startOperation(operation: string): () => void {
    const startTime = Date.now();
    
    return (success = true) => {
      const duration = Date.now() - startTime;
      this.metrics.push({
        operation,
        duration,
        success,
        timestamp: new Date()
      });
    };
  }

  getAverageResponseTime(operation?: string): number {
    const relevantMetrics = operation 
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics;
    
    if (relevantMetrics.length === 0) return 0;
    
    const totalTime = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
    return totalTime / relevantMetrics.length;
  }
}

// Global instances
export const tokenTracker = new TokenTracker();
export const promptOptimizer = new PromptOptimizer();
export const performanceMonitor = new PerformanceMonitor(); 