const Dependency = require('./dependency')

function diesis(deps, func) {
  const hasDependencies = Array.isArray(deps)
  if (!hasDependencies) {
    func = deps
    deps = []
  }
  const shouldCurry = typeof func === 'undefined'

  function curried(func) {
    const dep = new Dependency(deps, func)
    function _diesis(obj) {
      return dep.runGraph(obj)
    }
    _diesis.dep = dep
    return _diesis
  }

  if (!shouldCurry) {
    return curried(func)
  }
  return curried
}

module.exports = diesis
