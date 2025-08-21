// Advanced Caching System for FixMo
// Intelligent cache management with TTL, memory optimization, and predictive caching

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  priority: CachePriority;
  tags: string[];
}

export enum CachePriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4
}

export interface CacheConfig {
  maxSize: number; // Maximum cache size in bytes
  maxEntries: number; // Maximum number of entries
  defaultTTL: number; // Default TTL in milliseconds
  cleanupInterval: number; // Cleanup interval in milliseconds
  enablePredictiveCaching: boolean;
  enableCompression: boolean;
  enablePersistentStorage: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalSize: number;
  entryCount: number;
  evictions: number;
  compressionRatio: number;
}

class AdvancedCache {
  private static instance: AdvancedCache;
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private compressionWorker: Worker | null = null;
  private predictiveCache: Map<string, number> = new Map();

  private constructor() {
    this.config = {
      maxSize: 50 * 1024 * 1024, // 50MB
      maxEntries: 1000,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      cleanupInterval: 60 * 1000, // 1 minute
      enablePredictiveCaching: true,
      enableCompression: true,
      enablePersistentStorage: true
    };

    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalSize: 0,
      entryCount: 0,
      evictions: 0,
      compressionRatio: 1
    };

    this.initialize();
  }

  static getInstance(): AdvancedCache {
    if (!AdvancedCache.instance) {
      AdvancedCache.instance = new AdvancedCache();
    }
    return AdvancedCache.instance;
  }

  private initialize(): void {
    this.loadFromPersistentStorage();
    this.startCleanupInterval();
    this.initializeCompressionWorker();
    this.setupPredictiveCaching();
    
    console.log('[Cache] Advanced cache system initialized');
  }

  private async loadFromPersistentStorage(): Promise<void> {
    if (!this.config.enablePersistentStorage) return;

    try {
      const stored = localStorage.getItem('fixmo-cache');
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        
        // Only load non-expired entries
        for (const [key, entry] of Object.entries(data)) {
          const cacheEntry = entry as CacheEntry;
          if (now - cacheEntry.timestamp < cacheEntry.ttl) {
            this.cache.set(key, cacheEntry);
          }
        }
        
        this.updateStats();
        console.log(`[Cache] Loaded ${this.cache.size} entries from persistent storage`);
      }
    } catch (error) {
      console.error('[Cache] Failed to load from persistent storage:', error);
    }
  }

  private saveToPersistentStorage(): void {
    if (!this.config.enablePersistentStorage) return;

    try {
      const data: Record<string, CacheEntry> = {};
      this.cache.forEach((entry, key) => {
        data[key] = entry;
      });
      
      localStorage.setItem('fixmo-cache', JSON.stringify(data));
    } catch (error) {
      console.error('[Cache] Failed to save to persistent storage:', error);
    }
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private initializeCompressionWorker(): void {
    if (!this.config.enableCompression) return;

    try {
      // Create a simple compression worker
      const workerCode = `
        self.onmessage = function(e) {
          const { type, data } = e.data;
          
          if (type === 'compress') {
            try {
              // Simple compression using JSON.stringify and base64
              const compressed = btoa(JSON.stringify(data));
              self.postMessage({ type: 'compressed', data: compressed });
            } catch (error) {
              self.postMessage({ type: 'error', error: error.message });
            }
          } else if (type === 'decompress') {
            try {
              const decompressed = JSON.parse(atob(data));
              self.postMessage({ type: 'decompressed', data: decompressed });
            } catch (error) {
              self.postMessage({ type: 'error', error: error.message });
            }
          }
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.compressionWorker = new Worker(URL.createObjectURL(blob));
    } catch (error) {
      console.warn('[Cache] Compression worker not supported:', error);
    }
  }

  private setupPredictiveCaching(): void {
    if (!this.config.enablePredictiveCaching) return;

    // Monitor user navigation patterns
    let currentPath = window.location.pathname;
    
    const observer = new MutationObserver(() => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        this.recordNavigationPattern(currentPath, newPath);
        currentPath = newPath;
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  private recordNavigationPattern(from: string, to: string): void {
    const key = `${from}->${to}`;
    const count = this.predictiveCache.get(key) || 0;
    this.predictiveCache.set(key, count + 1);
  }

  // Public API
  public async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    this.stats.hits++;
    this.updateStats();

    // Decompress if needed
    if (this.config.enableCompression && entry.value && typeof entry.value === 'string') {
      try {
        const decompressed = await this.decompress(entry.value);
        return decompressed as T;
      } catch (error) {
        console.error('[Cache] Failed to decompress value:', error);
        return entry.value as T;
      }
    }

    return entry.value as T;
  }

  public async set<T>(
    key: string, 
    value: T, 
    options: {
      ttl?: number;
      priority?: CachePriority;
      tags?: string[];
      compress?: boolean;
    } = {}
  ): Promise<void> {
    const {
      ttl = this.config.defaultTTL,
      priority = CachePriority.NORMAL,
      tags = [],
      compress = this.config.enableCompression
    } = options;

    // Compress if enabled
    let processedValue = value;
    if (compress && typeof value === 'object') {
      try {
        processedValue = await this.compress(value);
      } catch (error) {
        console.warn('[Cache] Failed to compress value:', error);
      }
    }

    const entry: CacheEntry<T> = {
      key,
      value: processedValue as T,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
      size: this.calculateSize(processedValue),
      priority,
      tags
    };

    // Check if we need to evict entries
    if (this.shouldEvict(entry.size)) {
      this.evictEntries(entry.size);
    }

    this.cache.set(key, entry);
    this.updateStats();
    this.saveToPersistentStorage();
  }

  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.updateStats();
      this.saveToPersistentStorage();
    }
    return deleted;
  }

  public clear(): void {
    this.cache.clear();
    this.updateStats();
    this.saveToPersistentStorage();
  }

  public has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  public getStats(): CacheStats {
    return { ...this.stats };
  }

  public getConfig(): CacheConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart cleanup interval if changed
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.startCleanupInterval();
    }
  }

  public invalidateByTag(tag: string): number {
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    if (count > 0) {
      this.updateStats();
      this.saveToPersistentStorage();
    }
    
    return count;
  }

  public async prefetch(keys: string[]): Promise<void> {
    // Implement predictive prefetching based on navigation patterns
    for (const key of keys) {
      if (!this.has(key)) {
        // This would typically trigger an API call to fetch the data
        console.log(`[Cache] Prefetching: ${key}`);
      }
    }
  }

  // Private helper methods
  private shouldEvict(newEntrySize: number): boolean {
    return this.stats.totalSize + newEntrySize > this.config.maxSize ||
           this.stats.entryCount >= this.config.maxEntries;
  }

  private evictEntries(requiredSpace: number): void {
    const entries = Array.from(this.cache.values());
    
    // Sort by priority, then by access count, then by last accessed
    entries.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      if (a.accessCount !== b.accessCount) {
        return a.accessCount - b.accessCount;
      }
      return a.lastAccessed - b.lastAccessed;
    });

    let freedSpace = 0;
    const entriesToRemove: string[] = [];

    for (const entry of entries) {
      if (freedSpace >= requiredSpace) break;
      
      entriesToRemove.push(entry.key);
      freedSpace += entry.size;
    }

    // Remove entries
    for (const key of entriesToRemove) {
      this.cache.delete(key);
      this.stats.evictions++;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      this.cache.delete(key);
    }

    if (keysToRemove.length > 0) {
      this.updateStats();
      this.saveToPersistentStorage();
      console.log(`[Cache] Cleaned up ${keysToRemove.length} expired entries`);
    }
  }

  private updateStats(): void {
    this.stats.totalSize = 0;
    this.stats.entryCount = this.cache.size;
    
    for (const entry of this.cache.values()) {
      this.stats.totalSize += entry.size;
    }
    
    this.stats.hitRate = this.stats.hits / (this.stats.hits + this.stats.misses);
  }

  private calculateSize(value: any): number {
    return new Blob([JSON.stringify(value)]).size;
  }

  private async compress(data: any): Promise<string> {
    if (!this.compressionWorker) {
      return JSON.stringify(data);
    }

    return new Promise((resolve, reject) => {
      const messageHandler = (e: MessageEvent) => {
        if (e.data.type === 'compressed') {
          this.compressionWorker!.removeEventListener('message', messageHandler);
          resolve(e.data.data);
        } else if (e.data.type === 'error') {
          this.compressionWorker!.removeEventListener('message', messageHandler);
          reject(new Error(e.data.error));
        }
      };

      this.compressionWorker!.addEventListener('message', messageHandler);
      this.compressionWorker!.postMessage({ type: 'compress', data });
    });
  }

  private async decompress(data: string): Promise<any> {
    if (!this.compressionWorker) {
      return JSON.parse(data);
    }

    return new Promise((resolve, reject) => {
      const messageHandler = (e: MessageEvent) => {
        if (e.data.type === 'decompressed') {
          this.compressionWorker!.removeEventListener('message', messageHandler);
          resolve(e.data.data);
        } else if (e.data.type === 'error') {
          this.compressionWorker!.removeEventListener('message', messageHandler);
          reject(new Error(e.data.error));
        }
      };

      this.compressionWorker!.addEventListener('message', messageHandler);
      this.compressionWorker!.postMessage({ type: 'decompress', data });
    });
  }
}

// Export singleton instance
export const advancedCache = AdvancedCache.getInstance();

// Cache decorator for methods
export function Cached(options: {
  ttl?: number;
  priority?: CachePriority;
  tags?: string[];
  key?: string;
} = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = options.key || `${target.constructor.name}.${propertyName}.${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = await advancedCache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
      
      // Execute method and cache result
      const result = await method.apply(this, args);
      await advancedCache.set(cacheKey, result, options);
      
      return result;
    };
  };
} 