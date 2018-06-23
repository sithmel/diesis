import compose  from './compose'

export default function decorate (...args) {
  return compose(args.slice(0, -1))(args[args.length - 1])
}
