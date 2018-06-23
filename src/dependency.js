class Value {
  constructor (value) {
    this.deps = () => []
    this.id = value
    this.func = () => value
  }
}

class Dependency {
  constructor (deps, func) {
    if (typeof func === 'undefined') {
      func = deps
      deps = []
    }
    deps = deps || []
    this._deps = typeof deps === 'function' ? deps : () => deps
    this.id = this
    this.func = typeof func === 'function' ? func : () => func
  }

  run (_cache = {}) {
    const cache = _cache instanceof Map ? _cache : new Map(Object.entries(_cache))

    const getPromiseFromDep = (dep) =>
      Promise.resolve()
        .then(() => {
          if (!cache.has(dep.id)) {
            const value = getPromisesFromDeps(dep.deps(cache))
              .then((deps) => dep.func(...deps))
            cache.set(dep.id, value)
          }
          return cache.get(dep.id)
        })

    const getPromisesFromDeps = (deps) =>
      Promise.all(deps.map(getPromiseFromDep))

    return getPromiseFromDep(this)
  }

  deps (cache) {
    const _deps = this._deps(cache)
    if (!Array.isArray(_deps)) {
      throw new Error('A dependency should depend on an array of dependencies or values (not an array)')
    }
    return _deps.map((d) => {
      if (d instanceof Dependency) {
        return d
      } else if (typeof d === 'function' && d.dep instanceof Dependency) {
        return d.dep
      } else if (typeof d === 'string') {
        return new Value(d)
      }
      throw new Error('A dependency should depend on an array of dependencies or values (not a dependency or a string)')
    })
  }
}

module.exports = Dependency
