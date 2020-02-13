# Diesis

[![Build Status](https://travis-ci.org/sithmel/diesis.svg?branch=master)](https://travis-ci.org/sithmel/diesis)
[![dependency Status](https://david-dm.org/sithmel/diesis.svg)](https://david-dm.org/sithmel/diesis.svg)
[![Coverage Status](https://coveralls.io/repos/github/sithmel/diesis/badge.svg?branch=master)](https://coveralls.io/github/sithmel/diesis?branch=master)

Diesis is a declarative dependency injection library.
It allows to define a group of functions in a graph of dependencies, removing the manual wiring necessary to connect the functions one another. It also ensures every dependency is executed at most once.
It works with functions returning synchronously or asynchronously (returning a promise). It also makes testing way easier.

[A presentation about diesis](https://slides.com/sithmel/diesis)

## Compatibility
Diesis is written in ES2015 and uses [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) and [Maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map). It uses commonjs to ensure the broadest compatibility. It runs on all supported node versions and modern browsers without transpilation or polyfilling. It has no dependencies and has a minimal footprint.

## Importing diesis
You can import diesis as ES module or using commonjs:
```js
import { dependency, run } from 'diesis'

// or

const { dependency, run } = require('diesis')
```

## Using diesis
Let's start with 2 simple functions, one depending on another:
```js
const hello = () => 'hello'
const world = (s) => `${s} world`
```
Assuming that you want to call "world" with the result of the function "hello". You need to write:
```js
const greeting = hello()
world(greeting) // it returns 'hello world'
```
diesis can be used to automate the dependency resolution. Let's write the functions like this instead:
```js
const { dependency } = require('diesis')

const hello = dependency(() => 'hello')
const world = dependency([hello], (s) => `${s} world`)

world()
  .then((res) => res) // res is 'hello world'
```
In that way I declared that the first argument of "world" will always be the result of the "hello" function. The resulting function returns always asynchronously.

## Overriding dependencies
You can override some dependency (for testing for example). In that case you need to call the function with a ES2015 Map:
```js
const deps = new Map()
deps.set(hello, () => 'bye')

world(deps)
  .then((res) => res) // res is 'bye world'
```
To make thing easier you can also pass an array or key/value pairs. This will be converted to a Map:
```js
world([[hello, () => 'bye']])
  .then((res) => res) // res is 'bye world'
```

## Passing parameters
You can use the same feature to inject a different sets of dependencies. If these dependencies are defined with a string, you can pass an object instead of a map:
```js
const hello = dependency(() => 'hello')
const world = dependency([hello, 'emphasis'], (s, emphasis) => `${s} world${emphasis && '!'}`)

world({ emphasis: true })
  .then((res) => res) // res is 'hello world!'

world({ emphasis: false })
  .then((res) => res) // res is 'hello world'
```

## Shortcuts
If there are no dependencies you can omit the first argument. Or just use a function.
You can pass any value instead of a function, this will be converted to a function returning that value. For example:
```js
const hello = dependency([], () => 'hello')
// is equivalent to
const hello = dependency(() => 'hello')
// is equivalent to
const hello = () => 'hello')
// is also equivalent to
const hello = dependency('hello')
```

## run multiple dependencies
If you want to run multiple dependencies you might be tempted to use Promise.all:
```js
Promise.all([dependency1(), dependency2(), dependency3()])
  .then((res) => res) // res is an array containing the 3 resolved dependencies
```
This might return the correct result (if the dependencies are pure functions).
But common dependencies can be executed multiple times. To avoid this, you can use run:
```js
const run = require('diesis').run
run([dependency1, dependency2, dependency3]) // this can take an additional argument to override dependencies
  .then((res) => res) // res is an array containing the 3 resolved dependencies
```
You can use `run` to run a single dependency as well:
```js
run(dependency1)
  .then((res) => res)
// is equivalent to
dependency1()
  .then((res) => res)
```

## dependencyMemo
Often times you want to execute a dependency once and store the result. For example, creating a connection to a database.
This is the behaviour of `dependencyMemo`:
```js
const dbConnection = dependencyMemo([config], (config) => {
  // this function is executed only once. The result is memoized.
})
```
A dependency is only executed when necessary, so `config` is not executed when the result of dbConnection is memoized.
You can clear the previously saved result using the `reset` method (on the dependency object).
```js
dbConnection.dep.reset()
```
A piece of advice: there is a caveat, exporting a memoized dependency with a side effect (for example, opening a network connection). Because of the way node resolve dependencies, different dependencies might be used. Let's say that your application "A" dependes on packages "B" and "C". "B" and "C" depends on "D" which exports a memoized dependency. But "B" and "C" requires a different incompatible version of "D".
In this case node will resolve 2 distinct version of "D" and they will be memoized independently. You can verify this with ```npm list```.

## A more meaningful example
If you are still struggling to understand how this can be useful, here's a more articulated example. For making it simpler I'll omit the implementation of these functions, providing only a description.
```js
const dependency = require('diesis').dependency

const dbConnection = dependencyMemo([],() => {
  // this function returns the connection to a db
  // this function is memoized to avoid creating multiple connections
})

const userData = dependency(['userId'], (userId) => {
  // this function returns user informations, from an external service
})

const resourceData = dependency([dbConnection, 'resourceId'], (dbConnection, resourceId) => {
  // this function returns resource informations, from the db
})

const template = dependency([], () => {
  // return the compiled template
})

const renderTemplate = dependency([template, userData, resourceData], (template, userData, resourceData) => {
  // render the template with the given informations
})

renderTemplate({ userId: 12345, resourceId: 23456 })
  .then(markup => {
    //
  })
```

![Graph example](docs/example.svg)

## Testing
the "dependency" object contains the original function in the "func" attribute. This can be used to test the function in isolation:
```js
const hello = dependency(() => 'hello')
const world = dependency([hello], (s) => `${s} world`)

world.dep.func('test') // returns 'test world'
```

