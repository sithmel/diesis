class Dependency {
  constructor(deps, func) {
    this._deps = deps.map((d) => {
      if (d instanceof Dependency) {
        return d
      } else if (typeof d === 'function' && d.dep instanceof Dependency) {
        return d.dep
      }
      return new Dependency([], d)
    })
    this.id = typeof func === 'function' ? this : func
    this.func = typeof func === 'function' ? func : () => func
  }

  runGraph(_cache = {}) {
    const cache = _cache instanceof Map ? _cache : new Map(Object.entries(_cache))

    const getPromiseFromDep = (dep) => {
      if (!cache.has(dep.id)) {
        const value = getPromisesFromDeps(dep.deps())
          .then((deps) => dep.run(deps))
        cache.set(dep.id, value)
      }
      return cache.get(dep.id)
    }

    const getPromisesFromDeps = (deps) =>
      Promise.all(deps.map(getPromiseFromDep))

    return getPromiseFromDep(this)
  }

  run(deps) {
    return Promise.resolve()
      .then(() => this.func(...deps))
  }

  deps() {
    return this._deps
  }
}

module.exports = Dependency
