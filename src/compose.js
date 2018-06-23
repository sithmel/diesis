function compose (fns) {
  return fns
    .reduce((f, g) => (...args) => f(g.apply(this, args)))
}

module.exports = compose
