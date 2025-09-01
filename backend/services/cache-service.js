class CacheService {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = parseInt(process.env.CACHE_TTL) || 30000; // 30 seconds
        this.cleanupInterval = null;
    }

    /**
     * Initialize cache service
     */
    init() {
        // Clean up expired entries every minute
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60000);

        console.log('💾 Cache service initialized');
    }

    /**
     * Set a value in cache
     */
    set(key, value, ttl = this.defaultTTL) {
        const expiry = Date.now() + ttl;
        this.cache.set(key, {
            value,
            expiry,
            timestamp: Date.now()
        });
    }

    /**
     * Get a value from cache
     */
    get(key) {
        const item = this.cache.get(key);
        
        if (!item) {
            return null;
        }

        // Check if expired
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    /**
     * Check if key exists and is not expired
     */
    has(key) {
        const item = this.cache.get(key);
        
        if (!item) {
            return false;
        }

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Delete a key from cache
     */
    delete(key) {
        return this.cache.delete(key);
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Get cache size
     */
    size() {
        return this.cache.size;
    }

    /**
     * Get cache keys
     */
    keys() {
        return Array.from(this.cache.keys());
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const now = Date.now();
        const stats = {
            totalEntries: this.cache.size,
            activeEntries: 0,
            expiredEntries: 0,
            totalSize: 0,
            averageAge: 0
        };

        let totalAge = 0;
        let activeCount = 0;
        let expiredCount = 0;

        for (const [key, item] of this.cache.entries()) {
            const age = now - item.timestamp;
            totalAge += age;

            if (now > item.expiry) {
                expiredCount++;
            } else {
                activeCount++;
            }

            // Estimate size (rough calculation)
            stats.totalSize += JSON.stringify(item.value).length;
        }

        stats.activeEntries = activeCount;
        stats.expiredEntries = expiredCount;
        stats.averageAge = activeCount > 0 ? totalAge / activeCount : 0;

        return stats;
    }

    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            console.log(`🧹 Cleaned up ${cleanedCount} expired cache entries`);
        }
    }

    /**
     * Get cache entry info
     */
    getEntryInfo(key) {
        const item = this.cache.get(key);
        
        if (!item) {
            return null;
        }

        const now = Date.now();
        const age = now - item.timestamp;
        const timeToExpiry = item.expiry - now;
        const isExpired = now > item.expiry;

        return {
            key,
            value: item.value,
            timestamp: item.timestamp,
            expiry: item.expiry,
            age,
            timeToExpiry,
            isExpired,
            size: JSON.stringify(item.value).length
        };
    }

    /**
     * Set multiple values at once
     */
    setMultiple(entries, ttl = this.defaultTTL) {
        entries.forEach(([key, value]) => {
            this.set(key, value, ttl);
        });
    }

    /**
     * Get multiple values at once
     */
    getMultiple(keys) {
        const result = {};
        keys.forEach(key => {
            const value = this.get(key);
            if (value !== null) {
                result[key] = value;
            }
        });
        return result;
    }

    /**
     * Extend TTL for a key
     */
    extend(key, additionalTTL) {
        const item = this.cache.get(key);
        
        if (item) {
            item.expiry += additionalTTL;
            return true;
        }
        
        return false;
    }

    /**
     * Stop the service
     */
    stop() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.clear();
        console.log('🛑 Cache service stopped');
    }
}

module.exports = new CacheService();
