'use strict'

const debug = require('debug')('promise-stale-if-error')

/**
 * Wraps a promise-returning function so it resolves to the last good value
 * (even if it is old or stale) on error.
 *
 * @param {Function} fn The function to cache.
 * @param {object} options The options.
 * @param {Map} [options.cache] The storage. Must implement the `Map` interface.
 * @param {(err: Error) => any} [options.onError] An error handler.
 * @param {Function} [options.resolver] The key resolver function.
 * @returns {Function} The cached function.
 */
const pStaleIfError = function (fn, options = {}) {
  const {
    cache = new Map(),
    onError,
    resolver = (...args) => args[0]
  } = options

  return function (...args) {
    const key = resolver(...args)

    return Promise.resolve(fn(...args))
      .then(function (res) {
        debug('Caching function result')
        cache.set(key, res)
        return res
      })
      .catch(function (err) {
        if (cache.has(key)) {
          debug('Returning cached result')
          return cache.get(key)
        }
        if (onError) {
          debug('Handling the error externally')
          return onError(err)
        }
        debug('Call failed and no result in cached')
        throw err
      })
  }
}

module.exports = pStaleIfError
