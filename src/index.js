class Value {
  constructor (value) {
    this.deps = () => []
    this.id = value
    this.func = () => value
  }
}

class Func {
  constructor (func) {
    this.deps = () => []
    this.id = func
    this.func = func
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
      } else if (typeof d === 'function') {
        return new Func(d)
      } else if (typeof d === 'string') {
        return new Value(d)
      }
      throw new Error('A dependency should depend on an array of dependencies or values (not a dependency or a string)')
    })
  }
}

class DependencyMemo extends Dependency {
  constructor (deps, func) {
    super(deps, func)
    const originalFunction = this.func

    this.func = (...args) => {
      if (this.isMemoized) {
        return this.memo
      }
      const p = Promise.resolve()
        .then(() => originalFunction(...args))
        .catch((err) => {
          this.reset()
          throw err
        })
      this.isMemoized = true
      this.memo = p
      return p
    }
    this.reset()
  }

  deps (cache) {
    if (this.isMemoized) return []
    return super.deps(cache)
  }

  reset () {
    this.isMemoized = false
    this.memo = undefined
  }
}

function dependency (deps, func) {
  const dep = new Dependency(deps, func)
  function _run (obj) {
    return run(dep, obj)
  }
  _run.dep = dep
  return _run
}

function dependencyMemo (deps, func) {
  const dep = new DependencyMemo(deps, func)
  function _run (obj) {
    return run(dep, obj)
  }
  _run.dep = dep
  return _run
}

function cacheToMap(obj) {
  if (obj instanceof Map) {
    return obj
  }
  if (Array.isArray(obj)) {
    return new Map(obj) // I consider obj to be an array of key value pairs
  }
  if (typeof obj === 'object') {
    return new Map(Object.entries(obj))
  }
  throw new Error('Cache must be either a Map, an array of key7value pairs or an object')
}

function run (deps, _cache = {}) {
  if (Array.isArray(deps)) {
    const dep = new Dependency(deps, (...deps) => deps)
    return run(dep, _cache)
  } else if (typeof deps === 'function' && deps.dep instanceof Dependency) {
    return run(deps.dep, _cache)
  }

  const cache = cacheToMap(_cache)

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

  return getPromiseFromDep(deps)
}

module.exports = {
  Dependency,
  dependency,
  DependencyMemo,
  dependencyMemo,
  run
}
