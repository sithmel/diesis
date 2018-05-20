class Dependency {
  constructor (deps, func) {
    if (typeof func === 'undefined') {
      func = deps
      deps = []
    }
    deps = deps || []
    this._deps = typeof deps === 'function' ? deps : () => deps
    this.id = typeof func === 'function' ? this : func
    this.func = typeof func === 'function' ? func : () => func
  }

  run (_cache = {}) {
    const cache = _cache instanceof Map ? _cache : new Map(Object.entries(_cache))

    const getPromiseFromDep = (dep) => {
      if (!cache.has(dep.id)) {
        const value = getPromisesFromDeps(dep.deps(cache))
          .then((deps) => dep.func(...deps))
        cache.set(dep.id, value)
      }
      return cache.get(dep.id)
    }

    const getPromisesFromDeps = (deps) =>
      Promise.all(deps.map(getPromiseFromDep))

    return getPromiseFromDep(this)
  }

  deps (cache) {
    return this._deps(cache).map((d) => {
      if (d instanceof Dependency) {
        return d
      } else if (typeof d === 'function' && d.dep instanceof Dependency) {
        return d.dep
      }
      return new Dependency([], d)
    })
  }
}

module.exports = Dependency
