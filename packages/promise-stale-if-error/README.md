# promise-stale-if-error

![NPM Version](https://img.shields.io/npm/v/promise-stale-if-error)

Wraps a promise-returning function so it resolves to the last good value on error.

## Motivation

Sometimes, when dealing with unreliable 3rd-party APIs, it is not that important to get the latest up-to-date value but to get some, even when that value is old or stale.
This wrapper ensures that once the function was able to retrieve any value, that one will be used in case the same call returns an error in the future.
Every time the call succeeds, the stored value is updated.

## Install

```sh
npm install promise-mem
```

## Usage

```js
const pStaleIfError = require('promise-stale-if-error')

const wrappedFn = pStaleIfError(notSoReliableAsyncCall)

wrappedFn()
  .then(function (value) {
    // `notSoReliableAsyncCall` was called and it returned `value`.
  })
  .then(() => wrappedFn())
  .then(function (value) {
    // If for some reason `notSoReliableAsyncCall` fails, the last `value` will
    // be returned instead of a rejection.
  })
```

## API

### pStaleIfError(fn, options?)

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

##### options.onError?

Type: `(err: Error) => any`

If calling `fn` fails and there is no good value retrieved yet, this function will be called instead.
The returning value will be passed over the caller of the wrapped function.

##### options.resolver?

Type: `Function`
Default: `(...args) => args[0]`

Determines how the caching key will be computed.
By default, it will only consider the first argument and use strict equality to evaluate a match.

### wrappedFn

The wrapped version of `fn`.
It resolves to the result of calling `fn()`.
On failure, it will resolve to the last successful result.
If there is none and `onError` was defined, it will resolve to the result of calling it.
