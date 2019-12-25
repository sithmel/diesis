const decorate = require('../src').decorate
const assert = require('chai').assert

const square = (f) => (...args) => {
  const n = f(...args)
  return n * n
}

const add3 = (f) => (...args) => {
  const n = f(...args)
  return n + 3
}

describe('decorate', () => {
  it('works', () => {
    const f = decorate(square, add3, (n) => 5 + n)
    assert.equal(f(2), 100)
  })
})
