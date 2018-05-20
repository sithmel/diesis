const objUUID = require('obj-uuid')
const LRUCache = require('little-ds-toolkit/lib/lru-cache')

function cacheDependency ({ len, ttl }) {
  return function _cacheDependency (func) {
    const cache = new LRUCache({ maxLen: len, defaultTTL: ttl })
    return function cachedService (...deps) {
      const key = objUUID.getIdFromValues(deps)
      if (cache.has(key)) {
        return cache.get(key)
      }
      const result = func(...deps)
      if (typeof result === 'object' && 'then' in result) {
        return result
          .then((res) => {
            cache.set(key, result)
            return Promise.resolve(res)
          })
      } else {
        cache.set(key, result)
        return result
      }
    }
  }
}

module.exports = cacheDependency
