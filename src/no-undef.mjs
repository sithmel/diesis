function noUndef (func) {
  return function _noUndef (...args) {
    args.forEach((arg, index) => {
      if (typeof arg === 'undefined') {
        throw new Error(`Argument ${index} undefined`)
      }
    })
    return func(...args)
  }
}

module.exports = noUndef
