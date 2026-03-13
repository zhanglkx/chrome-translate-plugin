// utils/cacheManager.js - 缓存管理器
class CacheManager {
    constructor() {
        this.cache = {};
        this.maxCacheSize = 100; // 最大缓存条数
        this.loadCache();
    }

    loadCache() {
        try {
            const cachedData = localStorage.getItem('translationCache');
            if (cachedData) {
                this.cache = JSON.parse(cachedData);
            }
        } catch (e) {
            console.error('加载缓存失败:', e);
        }
    }

    saveCache() {
        try {
            // 清理过期缓存
            const now = Date.now();
            const cleanedCache = {};
            
            for (const [key, value] of Object.entries(this.cache)) {
                if (now - value.timestamp < 24 * 60 * 60 * 1000) { // 24小时过期
                    cleanedCache[key] = value;
                }
            }
            
            this.cache = cleanedCache;
            localStorage.setItem('translationCache', JSON.stringify(this.cache));
        } catch (e) {
            console.error('保存缓存失败:', e);
        }
    }

    async get(key) {
        const item = this.cache[key];
        if (item && Date.now() - item.timestamp < 24 * 60 * 60 * 1000) {
            return item.data;
        }
        return null;
    }

    async set(key, data) {
        // 检查缓存大小
        if (Object.keys(this.cache).length >= this.maxCacheSize) {
            // 简单的LRU策略：删除最旧的条目
            const oldestKey = Object.keys(this.cache).reduce((oldest, key) => {
                return this.cache[key].timestamp < this.cache[oldest].timestamp ? key : oldest;
            });
            delete this.cache[oldestKey];
        }

        this.cache[key] = {
            data: data,
            timestamp: Date.now()
        };
        this.saveCache();
    }

    clear() {
        this.cache = {};
        localStorage.removeItem('translationCache');
    }

    getSize() {
        return Object.keys(this.cache).length;
    }
}

// 导出单例实例
const cacheManager = new CacheManager();
export { cacheManager };