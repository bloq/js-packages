# promise-swr

Caches a promise-returning function with a stale-while-revalidate strategy, popularized by the HTTP Cache-Control Extensions for Stale Content ([RFC 5861](https://datatracker.ietf.org/doc/html/rfc5861)).

It is like the [`SWR React hook`](https://swr.vercel.app/) but for backend development.

## How it works

Every time the wrapper function is called, if there is no data in the cache or if the age of the data is to old, new data will be fetched and returned.
If the age of the data is greater than the revalidation threshold but still valid (stale), it will be returned and new data will be fetched in the background.
If several revalidation actions are triggered in parallel, it is guaranteed that only one single call to the wrapped function (per cache key) will be executed.
If the data is below the revalidation threshold, it is fresh and is returned right away.

## Install

```sh
npm install promise-swr
```

## Usage

```js
const { setTimeout } = require('node:timers/promises')
const pSwr = require 'promise-swr'

const cachedFn = pSwr(asyncCall)

cachedFn()
  .then(function (value) {
    // `asyncCall` was called and it returned `value`.
  })
  .then(() => cachedFn())
  .then(function (value) {
    // The last `value` is returned right away, while `asyncCall` is called in
    // the background so the next call returns fresh data.
  })
  .then(() => setTimeout(SOME_TIME))
  .then(() => cachedFn())
  .then(function (value) {
    // Now `value` is fresh again.
  })
```

## API

### pSwr(fn, options?)

Returns an function.

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

##### options.maxAge?

Type: `number`
Default: `Infinity`

The maximum time in milliseconds to keep a value in the cache.

##### options.resolver?

Type: `Function`
Default: `(...args) => args[0]`

Determines how the caching key will be computed.
By default, it will only consider the first argument and use strict equality to evaluate a match.

##### options.revalidate?

Type: `number`
Default: `0`

The maximum of time in milliseconds to consider a value fresh.
After this time, the value will be returned but a revalidation action will be triggered to freshen the cache.

### cachedFn

The cached version of `fn`.
See [How it works](#how-it-works) above.
