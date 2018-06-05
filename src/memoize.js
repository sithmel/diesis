function memoize (func) {
  let cache
  return function _memoize (...deps) {
    if (cache) {
      return cache
    }
    const result = func(...deps)
    if (typeof result === 'object' && 'then' in result) {
      return result
        .then((res) => {
          cache = result
          return result
        })
    } else {
      cache = result
      return result
    }
  }
}

module.exports = memoize
