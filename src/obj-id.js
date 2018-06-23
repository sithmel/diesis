let id = 0

function getId () {
  id++
  return id.toString(36)
}

function stringHash (str) {
  let hash = 5381
  let i = str.length

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i)
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return (hash >>> 0).toString(36)
}

function ObjId () {
  this.keys = new WeakMap()
}

ObjId.prototype.getIdFromValue = function (value) {
  if (value === null) {
    return 'l#'
  }
  if (typeof value === 'undefined') {
    return 'u#'
  }
  if (typeof value === 'string') {
    return `s#${stringHash(value)}`
  }
  if (typeof value === 'number') {
    return `n#${value.toString(36)}`
  }
  if (typeof value === 'boolean') {
    return `b#${value ? 't' : 'f'}`
  }
  if (typeof value === 'object' || typeof value === 'function') {
    if (!this.keys.has(value)) {
      this.keys.set(value, getId())
    }
    return this.keys.get(value)
  }
  throw new Error('Cannot compute id')
}

ObjId.prototype.getIdFromValues = function (deps) {
  const fields = deps
    .map((dep) => this.getIdFromValue(dep))
    .join('/')
  return `a#${fields}`
}

ObjId.prototype.getIdFromAttributes = function (deps) {
  const depsNames = Object.keys(deps)
  depsNames.sort()
  const fields = depsNames
    .map((depName) => `${stringHash(depName)}:${this.getIdFromValue(deps[depName])}`)
    .join('/')
  return `o#${fields}`
}

module.exports = new ObjId()
