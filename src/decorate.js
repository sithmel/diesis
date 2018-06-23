const compose = require('./compose')

function decorate (...args) {
  return compose(args.slice(0, -1))(args[args.length - 1])
}

module.exports = decorate
