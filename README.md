Diesis
======
[![Build Status](https://travis-ci.org/sithmel/diesis.svg?branch=master)](https://travis-ci.org/sithmel/diesis)
[![dependency Status](https://david-dm.org/sithmel/diesis.svg)](https://david-dm.org/sithmel/diesis.svg)

Diesis is a declarative dependency injection library.
It allows to define a group of functions in a graph of dependencies, removing the manual wiring necessary to connect the functions one another. It also ensures every dependency is executed at most once.
It works with functions returning synchronously or asynchronously (returning a promise).

Using diesis
------------
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
const dependency = require('diesis').dependency

const hello = dependency(() => 'hello')
const world = dependency([hello], (s) => `${s} world`)

world()
  .then((res) => res) // res is 'hello world'
```
In that way I declared that the first argument of "world" will always be the result of the "hello" function. The resulting function returns always asynchronously.

Overriding dependencies
-----------------------
You can override some dependency (for testing for example). In that case you need to call the function with a ES2015 Map:
```js
const deps = new Map()
deps.set(hello, () => 'bye')

world(deps)
  .then((res) => res) // res is 'bye world'
```

Passing parameters
------------------
You can use the same feature to inject a different sets of dependencies. If these dependencies are defined with a string, you can pass an object instead of a map:
```js
const hello = dependency(() => 'hello')
const world = dependency([hello, 'emphasis'], (s, emphasis) => `${s} world${emphasis && '!'}`)

world({ emphasis: true })
  .then((res) => res) // res is 'hello world!'

world({ emphasis: false })
  .then((res) => res) // res is 'hello world'
```

Shortcuts
---------
If there are no dependencies you can omit the first argument.
You can pass any value instead of a function, this will be converted to a function returning that value. For example:
```js
const hello = dependency([], () => 'hello')
// is equivalent to
const hello = dependency(() => 'hello')
// is equivalent to
const hello = dependency('hello')
```

runMulti
--------
If you want to run multiple dependencies you might be tempted to use Promise.all:
```js
Promise.all([dependency1(), dependency2(), dependency3()])
  .then((res) => res) // res is an array containing the 3 resolved dependencies
```
This might return the correct result (if the dependencies are pure functions).
But common dependencies can be executed multiple times. To avoid this, you can use runMulti:
```js
const runMulti = require('diesis').runMulti
runMulti([dependency1, dependency2, dependency3]) // this can take an additional argument to override dependencies
  .then((res) => res) // res is an array containing the 3 resolved dependencies
```

dependsOn
---------
dependsOn is a curried version of "dependency". It can be useful when using decorators.
```js
const dependsOn = require('diesis').dependsOn

const dependsOnNothing = dependsOn()
const hello = dependsOnNothing(() => 'hello'))

const dependsOnHello = dependsOn([hello])
const world = dependsOnHello((s) => `${s} world`)

world()
  .then((res) => res) // res is 'hello world'
```

A more meaningful example
-------------------------
If you are still struggling to understand how this can be useful, here's a more articulated example. For making it simpler I'll omit the implementation of these functions, providing only a description.
```js
const dependency = require('diesis').dependency
const memoize = require('diesis').memoize

const dbConnection = dependency([], memoize(() => {
  // this function returns the connection to a db
  // this function is memoized to avoid creating multiple connections
}))

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

Testing
-------
The function returned by "dependency" contains a "Dependency" instance under the property "dep". This object contains the original function as "func". This can be used to test the function in isolation:
```js
const hello = dependency(() => 'hello')
const world = dependency([hello], (s) => `${s} world`)

world.dep.func('test') // returns 'test world'
```

Using decorators
----------------
Using [decorators](https://en.wikipedia.org/wiki/Decorator_pattern) fits particularly well in dealing with this pattern.
For example you can use the promisify decorator to convert a callback based function:
```js
const promisify = require('util').promisify // available from node 8

const readFile = dependency(['filename'], promisify((filename, callback) => {
  // ...
}))
```

Included decorators
-------------------
You frequently need to cache the output of a dependency, for example when creating a connection to external resources. This package includes a decorators to do so.
The memoize decorator caches the dependency forever, if the function didn't throw an exception.
```js
const memoize = require('diesis').memoize

const memoizedDep = dependency([a, b], memoize((a, b) => {
  // ...
}))
```

cacheDependency decorator
-------------------------
the cacheDependency decorator allows you to fine tune the dependency caching.
The result is cached against the arguments. They are checked by reference (strict equality).
If the decorated function throws an exception or returns a rejected promise, this is not cached.

The decorator uses a LRU cache algorithm to decide whether to get rid of a cached value.
It also supports a time-to-live for cached values. But you have to consider stale cache entries are not removed until the size of the cache exceeds the length. This allows to keep the running time of the algorithm constant (O(1)) for any operation.
```js
const cacheDependency = require('diesis').cacheDependency
const cacheTTL = cacheDependency({ len: 1, ttl: 1 })

const cachedDep = dependency([a, b], cacheTTL((a, b) => {
  // ...
}))
```
* len: is the number of items in the cache
* ttl: is the time to live of cached items (in ms)

**You can find many useful decorators in [async-deco](https://github.com/sithmel/async-deco) library (use the promise based ones).**

Compatibility
-------------
ES2015
