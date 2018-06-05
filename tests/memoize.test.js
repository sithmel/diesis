/* eslint-env node, mocha */
const memoize = require('../src/memoize')
const assert = require('chai').assert

describe('memoize', () => {
  it('caches once', async () => {
    let executions = 0
    const cachedFunc = memoize((a, b) => {
      executions++
      return Promise.resolve(a + b)
    })
    const res1 = await cachedFunc(1, 2)
    const res2 = await cachedFunc(1, 2)
    const res3 = await cachedFunc(2, 2)

    assert.equal(res1, 3)
    assert.equal(res2, 3)
    assert.equal(res3, 3)
    assert.equal(executions, 1)
  })

  it('does not cache rejections', async () => {
    let executions = 0
    const cachedFunc = memoize((a, b) => {
      executions++
      return Promise.reject(new Error('nope'))
    })
    let res1, res2, res3
    try {
      res1 = await cachedFunc(1, 2)
    } catch (e) {}
    try {
      res2 = await cachedFunc(1, 2)
    } catch (e) {}
    try {
      res3 = await cachedFunc(2, 2)
    } catch (e) {}

    assert.isUndefined(res1)
    assert.isUndefined(res2)
    assert.isUndefined(res3)
    assert.equal(executions, 3)
  })

  it('caches sync functions', async () => {
    let executions = 0
    const cachedFunc = memoize((a, b) => {
      executions++
      return a + b
    })
    const res1 = cachedFunc(1, 2)
    const res2 = cachedFunc(1, 2)
    const res3 = cachedFunc(2, 2)

    assert.equal(res1, 3)
    assert.equal(res2, 3)
    assert.equal(res3, 3)
    assert.equal(executions, 1)
  })

  it('does not cache when throwing exceptions', async () => {
    let executions = 0
    const cachedFunc = memoize((a, b) => {
      executions++
      throw new Error('error')
    })
    let res1, res2, res3
    try {
      res1 = cachedFunc(1, 2)
    } catch (e) {}
    try {
      res2 = cachedFunc(1, 2)
    } catch (e) {}
    try {
      res3 = cachedFunc(1, 2)
    } catch (e) {}

    assert.isUndefined(res1)
    assert.isUndefined(res2)
    assert.isUndefined(res3)
    assert.equal(executions, 3)
  })
})
