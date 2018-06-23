const Dependency = require('./dependency')
const cacheDependency = require('./cache-dependency')
const memoize = require('./memoize')
const compose = require('./compose')
const decorate = require('./decorate')
const noUndef = require('./no-undef')

function dependsOn (deps) {
  function curried (func) {
    const dep = new Dependency(deps, func)
    function _dependsOn (obj) {
      return dep.run(obj)
    }
    _dependsOn.dep = dep
    return _dependsOn
  }
  return curried
}

function dependency (deps, func) {
  return dependsOn(deps)(func)
}

function runMulti (deps, obj) {
  const dep = new Dependency(deps, (...deps) => deps)
  return dep.run(obj)
}

module.exports = {
  Dependency,
  dependency,
  dependsOn,
  runMulti,
  cacheDependency,
  memoize,
  compose,
  decorate,
  noUndef
}
