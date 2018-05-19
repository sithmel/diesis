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
diesis can be used to automate the dependency resolution:
```js
const worldWithDeps = diesis([hello], world)
worldWithDeps()
  .then((res) => res)// res is 'hello world'
```
In that way I declared that the first argument of "world" will always be the result of the "hello" function. The resulting function returns always asynchronously.

Passing parameters
------------------

Overriding dependencies
-----------------------

Shortcuts
---------

A more meaningful example
-------------------------
If you are still struggling to understand how this can be useful, here's a more articulated example. For making it simpler I'll omit the implementation of these functions, providing only a description.

Testing
-------
The function returned by diesis contains a "dependency" object under the property "dep". This object contains a method "run" that is equivalent to the original function ( but it always returns asynchronously). This can be used to test the function in isolation:
```js
worldWithDeps.run(greetings) // it returns 'hello world'
```

Compatibility
-------------
ES6
