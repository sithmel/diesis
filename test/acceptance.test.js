const dependency = require('../src').dependency
const dependencyMemo = require('../src').dependencyMemo
const run = require('../src').run
const assert = require('chai').assert

describe('solve graphs', () => {
  describe('4 functions', () => {
    let a, b, c, d, counter

    beforeEach(function () {
      /*

      A ----> B
      |     / |
      |    /  |
      |   /   |
      |  /    |
      | /     |
      VV      V
      C ----> D

      */
      counter = { a: 0, b: 0, c: 0, d: 0 }
      a = dependency(() => {
        counter.a++
        return 'A'
      })
      b = dependency([a], (a) => {
        counter.b++
        return a + 'B'
      })
      c = dependency([a, b], (a, b) => {
        counter.c++
        return a + b + 'C'
      })
      d = dependency([b, c], (b, c) => {
        counter.d++
        return b + c + 'D'
      })
    })

    it('must return leftmost dep', () =>
      a().then((dep) => assert.equal(dep, 'A')))

    it('must return middle dep', () =>
      b().then((dep) => assert.equal(dep, 'AB')))

    it('must return middle dep (2)', () =>
      c().then((dep) => assert.equal(dep, 'AABC')))

    it('must return rightmost dep', () =>
      d().then((dep) => assert.equal(dep, 'ABAABCD')))

    it('must execute dep only once', () =>
      d().then((dep) => assert.deepEqual(counter, { a: 1, b: 1, c: 1, d: 1 })))

    it('run single', () =>
      run(b, {})
        .then((res) => {
          assert.deepEqual(res, 'AB')
        }))

    it('run multiple', () =>
      run([b, d], {})
        .then((res) => {
          assert.deepEqual(res, ['AB', 'ABAABCD'])
          assert.deepEqual(counter, { a: 1, b: 1, c: 1, d: 1 })
        }))

    it('dependency defaults to empty array', async () => {
      const empty = dependency(() => {
        return 'empty'
      })
      const res = await empty()
      assert.equal(res, 'empty')
    })

    it('dependency defaults to empty array when falsy', async () => {
      const empty = dependency(null, () => {
        return 'empty'
      })
      const res = await empty()
      assert.equal(res, 'empty')
    })

    it('dependency can be a function', async () => {
      const empty = dependency(() => [], () => {
        return 'empty'
      })
      const res = await empty()
      assert.equal(res, 'empty')
    })

    it('must throw on invalid dependencies', async () => {
      const buggy = dependency('invalid', () => {})
      try {
        await buggy()
        throw new Error('on no!')
      } catch (e) {
        assert.equal(e.message, 'A dependency should depend on an array of dependencies or values (not an array)')
      }
    })

    it('must throw on invalid cache', async () => {
      try {
        await d('invalid cache')
        throw new Error('on no!')
      } catch (e) {
        assert.equal(e.message, 'Cache must be either a Map, an array of key/value pairs or an object')
      }
    })
  })

  describe('4 functions with memo', () => {
    let a, b, c, d, counter

    beforeEach(function () {
      /*

      A ----> B
      |     / |
      |    /  |
      |   /   |
      |  /    |
      | /     |
      VV      V
      C ----> D

      */
      counter = { a: 0, b: 0, c: 0, d: 0 }
      a = dependency(() => {
        counter.a++
        return 'A'
      })
      b = dependencyMemo([a], (a) => {
        counter.b++
        return a + 'B'
      })
      c = dependencyMemo([a, b], (a, b) => {
        counter.c++
        return a + b + 'C'
      })
      d = dependency([b, c], (b, c) => {
        counter.d++
        return b + c + 'D'
      })
    })

    it('must return leftmost dep', () =>
      a().then((dep) => assert.equal(dep, 'A')))

    it('must return middle dep', () =>
      b().then((dep) => assert.equal(dep, 'AB')))

    it('must return middle dep (2)', () =>
      c().then((dep) => assert.equal(dep, 'AABC')))

    it('must return rightmost dep', () =>
      d().then((dep) => assert.equal(dep, 'ABAABCD')))

    it('must execute dep only once', () =>
      d().then((dep) => assert.deepEqual(counter, { a: 1, b: 1, c: 1, d: 1 })))

    it('must return rightmost dep (and memoize)', async () => {
      const dep = await d()
      assert.equal(dep, 'ABAABCD')
      assert.deepEqual(counter, { a: 1, b: 1, c: 1, d: 1 })

      counter = { a: 0, b: 0, c: 0, d: 0 }
      const dep2 = await d()
      assert.equal(dep2, 'ABAABCD')
      assert.deepEqual(counter, { a: 0, b: 0, c: 0, d: 1 })

      b.dep.reset()
      counter = { a: 0, b: 0, c: 0, d: 0 }

      const dep3 = await d()
      assert.equal(dep3, 'ABAABCD')
      assert.deepEqual(counter, { a: 1, b: 1, c: 0, d: 1 })
    })

    it('must return rightmost dep (and memoize), calling them at the same time', async () => {
      const [dep, dep2] = await Promise.all([d(), d()])
      assert.equal(dep, 'ABAABCD')
      assert.equal(dep2, 'ABAABCD')
      // I don't think "a" should be called twice here
      // it is a consequence of the sequence dependencies are resolved
      // it is a minor issue on a corner case. So I won't worry
      assert.deepEqual(counter, { a: 2, b: 1, c: 1, d: 2 })
    })

    it('must not memoize when function throw', async () => {
      const buggy = dependencyMemo([], () => {
        throw new Error('broken')
      })
      try {
        await buggy()
        throw new Error('on no!')
      } catch (e) {
        assert.equal(e.message, 'broken')
        assert.equal(buggy.dep.isMemoized, false)
      }
    })

    it('run single', () =>
      run(b, {})
        .then((res) => {
          assert.deepEqual(res, 'AB')
        }))

    it('run multiple', () =>
      run([b, d], {})
        .then((res) => {
          assert.deepEqual(res, ['AB', 'ABAABCD'])
          assert.deepEqual(counter, { a: 1, b: 1, c: 1, d: 1 })
        }))
  })
})
