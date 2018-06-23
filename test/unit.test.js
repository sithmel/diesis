/* eslint-env node, mocha */
const dependency = require('../es2015').dependency
const dependsOn = require('../es2015').dependsOn
const Dependency = require('../es2015').Dependency

const assert = require('chai').assert

describe('dependsOn', () => {
  it('curries', () => {
    const a = dependency(1)
    const b = dependency(2)
    const func = () => {}
    const d = dependsOn([a, b])(func)
    assert.equal(d.dep.deps().length, 2)
  })
})

describe('dependency', () => {
  it('returns a function', () => {
    assert.typeOf(dependency, 'function')
    assert.typeOf(dependency([], () => {}), 'function')
  })

  it('works without deps', () => {
    const func = () => {}
    const d = dependency(func)
    assert.equal(d.dep.deps().length, 0)
  })

  it('exposes dependencies', () => {
    const a = dependency(1)
    const b = dependency(2)
    const d = dependency([a, b], () => {})
    assert.equal(d.dep.deps().length, 2)
    for (const dep of d.dep.deps()) {
      assert.instanceOf(dep, Dependency)
    }
  })
})

describe('Dependency', () => {
  describe('run', () => {
    it('resolve single function', (done) => {
      const d = new Dependency([], 3)
      d.run()
        .then((res) => {
          assert.equal(res, 3)
          done()
        })
    })

    it('resolve a single dependency', (done) => {
      const d1 = new Dependency([], 3)
      const d2 = new Dependency([d1], (d1) => d1 * 2)
      d2.run()
        .then((res) => {
          assert.equal(res, 6)
          done()
        })
    })

    it('resolve 2 dependencies', (done) => {
      const d1 = new Dependency([], 5)
      const d2 = new Dependency([], 2)
      const d3 = new Dependency([d1, d2], (d1, d2) => d1 * d2)
      d3.run()
        .then((res) => {
          assert.equal(res, 10)
          done()
        })
    })

    it('execute only once', (done) => {
      let d1Execution = 0
      const d1 = new Dependency([], () => {
        d1Execution++
        return 2
      })
      const d2 = new Dependency([d1], () => {
        return 2 + 3
      })
      const d3 = new Dependency([d1, d2], (d1, d2) => d1 * d2)

      d3.run()
        .then((res) => {
          assert.equal(res, 10)
          assert.equal(d1Execution, 1)
          done()
        })
    })

    it('allows injecting a value', (done) => {
      let d1Execution = 0
      const d1 = new Dependency([], () => {
        d1Execution++
        return 2
      })
      const d2 = new Dependency([d1], () => {
        return 2 + 3
      })
      const d3 = new Dependency([d1, d2, 'mul'], (d1, d2, mul) => d1 * d2 * mul)

      d3.run({ mul: 10 })
        .then((res) => {
          assert.equal(res, 100)
          assert.equal(d1Execution, 1)
          done()
        })
    })

    it('does not allows injecting a value (use obj)', (done) => {
      const obj = {}
      const d3 = new Dependency([obj], (mul) => 10 * mul)

      d3.run(new Map([[obj, 10]]))
        .catch(e => {
          assert.equal(e.message, 'A dependency should depend on an array of dependencies or values (not a dependency or a string)')
          done()
        })
    })

    it('allows overriding a value', (done) => {
      let d1Execution = 0
      const d1 = new Dependency([], () => {
        d1Execution++
        return 2
      })
      const d2 = new Dependency([d1], () => {
        return 2 + 3
      })
      const d3 = new Dependency([d1, d2, 'mul'], (d1, d2, mul) => d1 * d2 * mul)

      d3.run(new Map([['mul', 10], [d2, 11]]))
        .then((res) => {
          assert.equal(res, 220)
          assert.equal(d1Execution, 1)
          done()
        })
    })
  })
})
