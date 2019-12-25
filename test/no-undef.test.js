const noUndef = require('../src').noUndef
const assert = require('chai').assert

describe('noUndef', () => {
  it('works', () => {
    const f = noUndef((...args) => args[0] + args[1] + args[2])
    assert.equal(f(1, 2, 3), 6)
  })

  it('throw if undefined', () => {
    const f = noUndef((...args) => args[0] + args[1] + args[2])
    assert.throws(() => f(1, undefined, 3), 'Argument 1 undefined')
  })
})
