/* eslint-env node, mocha */
const dependency = require('../src').dependency
const dependsOn = require('../src').dependsOn
const Dependency = require('../src/dependency')
const assert = require('chai').assert

describe('dependsOn', () => {
  it('curries', () => {
    const a = 1
    const b = 2
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
    const a = 1
    const b = 2
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

    it('allows injecting a value (use obj)', (done) => {
      const obj = {}
      let d1Execution = 0
      const d1 = new Dependency([], () => {
        d1Execution++
        return 2
      })
      const d2 = new Dependency([d1], () => {
        return 2 + 3
      })
      const d3 = new Dependency([d1, d2, obj], (d1, d2, mul) => d1 * d2 * mul)

      d3.run(new Map([[obj, 10]]))
        .then((res) => {
          assert.equal(res, 100)
          assert.equal(d1Execution, 1)
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
