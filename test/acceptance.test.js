/* eslint-env node, mocha */
const dependency = require('../es2015').dependency
const runMulti = require('../es2015').runMulti
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

    it('run multiple', () =>
      runMulti([b, d], {})
        .then((res) => {
          assert.deepEqual(res, [ 'AB', 'ABAABCD' ])
          assert.deepEqual(counter, { a: 1, b: 1, c: 1, d: 1 })
        }))
  })
})
