Diesis
======
[![Build Status](https://travis-ci.org/sithmel/diesis.svg?branch=master)](https://travis-ci.org/sithmel/diesis)
[![dependency Status](https://david-dm.org/sithmel/diesis.svg)](https://david-dm.org/sithmel/diesis.svg)

Diesis allows to define a group of functions in a graph of dependencies. This is useful as it removes the manual wiring necessary to connect one function to another. You can think of it as an declarative dependency injection library. It works with functions returning synchronously or asynchronously (returning a promise).

Importing diesis
----------------
You can import diesis using commonjs:
```js
const diesis = require('diesis')
```

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
const hello = diesis(
  () => 'hello')
const world = diesis([hello],
  (s) => `${s} world`)

world()
  .then((res) => res) // res is 'hello world'
```
In that way I declared that the first argument of "world" will always be the result of the "hello" function. The resulting function returns always asynchronously.

Overriding dependencies
-----------------------
You can override some dependency (for testing for example). In that case you need to call the function with a map:
```js
const deps = new Map()
deps.set(hello, () => 'bye')

world(deps)
  .then((res) => res) // res is 'bye world'
```

Passing parameters
------------------
You can use the same feature to inject a different set of dependencies. If these dependencies are defined with a string, you can pass an object instead of a map:
```js
const hello = diesis(
  () => 'hello')
const world = diesis([hello, 'emphasis'],
  (s, emphasis) => `${s} world${emphasis && '!'}`)

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
const hello = diesis([], () => 'hello')
// is equivalent to
const hello = diesis(() => 'hello')
// is equivalent to
const hello = diesis('hello')
```

A more meaningful example
-------------------------
If you are still struggling to understand how this can be useful, here's a more articulated example. For making it simpler I'll omit the implementation of these functions, providing only a description.

Testing
-------
The function returned by diesis contains a "dependency" object under the property "dep". This object contains a method "run" that is equivalent to the original function ( but it always returns asynchronously). This can be used to test the function in isolation:
```js
const hello = diesis(
  () => 'hello')
const world = diesis([hello],
  (s) => `${s} world`)

world.dep
  .run('test')
  .then((res) => res) // res 'test world'
```

Compatibility
-------------
ES6
