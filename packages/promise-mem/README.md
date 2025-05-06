# promise-mem

![NPM Version](https://img.shields.io/npm/v/promise-mem)![npm bundle size](https://img.shields.io/bundlephobia/minzip/promise-mem)

[Memoizes](https://en.wikipedia.org/wiki/Memoization) a promise-returning function.

## Motivation

After using [Sindre Sorhus' `p-memoize`](https://github.com/sindresorhus/p-memoize) for a long time, it was time to build an API that was going to handle a ton of load and had to perform many asynchronous calls to fulfill every request.
And `p-memoize` was the choice #1 to manage the load and improve the performance.

But soon after a problem was observed: the initial set of calls that hit the (cold) cache would trigger multiple parallel asynchronous calls until the cache was loaded with data.
From that point forward, it handled the calls as expected.
As this was not acceptable and debugging `p-throttle` did not result in any finding, a custom implementation that properly managed that scenario was the next choice: `promise-mem`.

## Install

```sh
npm install promise-mem
```

## Usage

```js
const pMemoize = require('promise-mem')

const memoized = pMemoize(asyncCall)

memoized()
  .then(function (value) {
    // `asyncCall` was called and it returned `value`.
  })
  .then(() => memoized())
  .then(function (value) {
    // `asyncCall` was NOT called and `value` was read from the cache.
  })
```

## API

### pMemoize(fn, options?)

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

##### options.lazy?

Type: `boolean`
Default: `true`

This flag will force the expiration of the cached value to be computed from the time that value was obtained.
If unset, the expiration will be set starting from the request time, without considering the time it takes to get the value into the cache.

##### options.maxAge?

Type: `number`
Default: `Infinity`

The maximum amount of time in milliseconds to keep a value in the cache.
Expired keys will be deleted from the cache only after the expiration time passes and the key is requested again, forcing a new call to `fn`.
Therefore, expiration is not managed by internally setting a timeout per key as done in other similar libraries.

##### options.resolver?

Type: `Function`
Default: `(...args) => args[0]`

Determines how the caching key will be computed.
By default, it will only consider the first argument and use strict equality to evaluate a match.

### memoizedFn

The memoized version of `fn`.
It resolves to the result of calling `fn()`, which is called only once per key and during the time the value has to be cached.
Rejections are not cached.
