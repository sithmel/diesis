const objId = require('./obj-id')
const LRUCache = require('little-ds-toolkit/lib/lru-cache')

function cacheDependency ({ len, ttl }) {
  return function _cacheDependency (func) {
    const cache = new LRUCache({ maxLen: len, defaultTTL: ttl })
    return function cachedService (...deps) {
      const key = objId.getIdFromValues(deps)
      if (cache.has(key)) {
        return cache.get(key)
      }
      const result = func(...deps)
      if (result instanceof Promise) {
        return result
          .then((res) => {
            cache.set(key, result)
            return result // resolved promise
          })
      } else {
        cache.set(key, result)
        return result
      }
    }
  }
}

module.exports = cacheDependency
