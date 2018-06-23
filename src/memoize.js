function memoize (func) {
  let cache
  return function _memoize (...deps) {
    if (cache) {
      return cache
    }
    const result = func(...deps)
    if (result instanceof Promise) {
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
