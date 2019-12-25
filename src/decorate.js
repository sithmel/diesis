const compose = require('./compose')

module.exports = function decorate (...args) {
  return compose(args.slice(0, -1))(args[args.length - 1])
}
