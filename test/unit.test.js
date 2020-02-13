const Dependency = require('../src').Dependency
const run = require('../src').run
const assert = require('chai').assert

describe('Dependency', () => {
  describe('run', () => {
    it('resolve single function', (done) => {
      const d = new Dependency([], 3)
      run(d)
        .then((res) => {
          assert.equal(res, 3)
          done()
        })
    })

    it('resolve a single dependency', (done) => {
      const d1 = new Dependency([], 3)
      const d2 = new Dependency([d1], (d1) => d1 * 2)
      run(d2)
        .then((res) => {
          assert.equal(res, 6)
          done()
        })
    })

    it('can rely on simple function', (done) => {
      const d1 = () => 3
      const d2 = new Dependency([d1], (d1) => d1 * 2)
      run(d2)
        .then((res) => {
          assert.equal(res, 6)
          done()
        })
    })

    it('resolve 2 dependencies', (done) => {
      const d1 = new Dependency([], 5)
      const d2 = new Dependency([], 2)
      const d3 = new Dependency([d1, d2], (d1, d2) => d1 * d2)
      run(d3)
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

      run(d3)
        .then((res) => {
          assert.equal(res, 10)
          assert.equal(d1Execution, 1)
          done()
        })
    })

    it('allows injecting a value (using object or map or array)', async () => {
      let d1Execution = 0
      const d1 = new Dependency([], () => {
        d1Execution++
        return 2
      })
      const d2 = new Dependency([d1], () => {
        return 2 + 3
      })
      const d3 = new Dependency([d1, d2, 'mul'], (d1, d2, mul) => d1 * d2 * mul)

      const res = await run(d3, { mul: 10 })
      assert.equal(res, 100)
      assert.equal(d1Execution, 1)

      const res2 = await run(d3, [['mul', 10]])
      assert.equal(res2, 100)

      const res3 = await run(d3, new Map([['mul', 10]]))
      assert.equal(res3, 100)
    })

    it('does not allows injecting a value (use obj)', (done) => {
      const obj = {}
      const d3 = new Dependency([obj], (mul) => 10 * mul)

      run(d3, new Map([[obj, 10]]))
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

      run(d3, new Map([['mul', 10], [d2, 11]]))
        .then((res) => {
          assert.equal(res, 220)
          assert.equal(d1Execution, 1)
          done()
        })
    })
  })
})
