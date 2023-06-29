# tiny-mem

Minimal, no-dependencies [memoization](https://en.wikipedia.org/wiki/Memoization) helper.

## Motivation

[`Lodash`](https://lodash.com/) has a handy [`memoize`](https://lodash.com/docs/4.17.15#memoize) function but it also has a ton of other functions.
[Sindre Sorhus' `mem`](https://github.com/sindresorhus/mem) is great but is also full of features you may not need.

This package is a simple, memoizing function implementation that does just that.
No fancy options, just like an [MVP](https://en.wikipedia.org/wiki/Minimum_viable_product).

## Install

```sh
npm install tiny-mem
```

## Usage

```js
const memoize = require('tiny-mem')

let index = 0
const seq = () => ++index
const memoized = memoize(seq)

memoized('one') // Returns 1

memoized('two') // Returns 2
memoized('two') // Returns 2 again

memoized('one') // Returns 1 again

memoized('two', 'one') // Still returns 2
```

## API

### memoize(fn, options?)

Returns a memoized function.

#### fn

Type: `Function`

A function.

#### options?

Type: `object`

##### options.cache?

Type: `object`
Default: `new Map()`

The cache storage.
Must implement these methods: `has(key)`, `set(key, value)`, `get(key)` and `delete(key)`

##### options.resolver?

Type: `Function`
Default: `(...args) => args[0]`

Determines how the caching key will be computed.
By default, it will only consider the first argument and use strict equality to evaluate a match.

### memoizedFn

The memoized version of `fn`.
It resolves to the result of calling `fn()`, which is called only once per key.
