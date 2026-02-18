/**
 * Simple in-memory cache with TTL support
 * For production, consider using Redis
 */
class Cache {
  constructor() {
    this.store = new Map();
    this.timers = new Map();
  }

  /**
   * Set cache value with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   */
  set(key, value, ttl = 300) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set value
    this.store.set(key, {
      value,
      expires: Date.now() + (ttl * 1000)
    });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl * 1000);

    this.timers.set(key, timer);
  }

  /**
   * Get cache value
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if expired/not found
   */
  get(key) {
    const item = this.store.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expires) {
      this.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Delete cache entry
   * @param {string} key - Cache key
   */
  delete(key) {
    // Clear timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    // Delete from store
    this.store.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.timers.clear();
    this.store.clear();
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   * @param {string} key - Cache key
   * @param {Function} fn - Function to compute value if not cached
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>} Cached or computed value
   */
  async getOrSet(key, fn, ttl = 300) {
    const cached = this.get(key);
    
    if (cached !== null) {
      return cached;
    }

    const value = await fn();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Get cache stats
   */
  stats() {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys())
    };
  }
}

// Singleton instance
const cache = new Cache();

module.exports = cache;
