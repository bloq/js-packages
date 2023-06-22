'use strict'

const debug = require('debug')('promise-swr')

/**
 * Caches a promise-returning function with a stale-while-revalidate strategy.
 *
 * Every time the wrapper function is called, if there is no data in the cache
 * or if the age of the data is to old, new data will be fetched and returned.
 * If the age of the data is greater than the revalidation threshold but still
 * valid, it will be returned and new data will be fetched in the background. If
 * the data is below the revalidation threshold, it is fresh and is returned
 * right away.
 *
 * @param {Function} fn The function to cache.
 * @param {object} [options] The options.
 * @param {Map} [options.cache] The storage. Must implement the `Map` interface.
 * @param {number} [options.maxAge] The max time to cache any result in ms.
 * @param {Function} [options.resolver] The key resolver function.
 * @param {number} [options.revalidate] The max time to wait until revalidating.
 * @returns {Function} The cached function.
 */
function pSwr(fn, options = {}) {
  const {
    cache = new Map(),
    maxAge = Infinity,
    resolver = (...args) => args[0],
    revalidate = 0
  } = options

  return function (...args) {
    debug('Function called')

    const key = resolver(...args)

    const cached = cache.get(key)

    const keyAge = cached
      ? cached.revalidating
        ? 0
        : Date.now() - cached.timestamp
      : 0

    if (!cached || keyAge > maxAge) {
      debug(cached ? 'Cache expired' : 'Cache is empty')

      const _cached = {
        data: Promise.resolve(fn(...args)),
        revalidating: true,
        timestamp: Infinity
      }
      cache.set(key, _cached)

      _cached.data
        .then(function () {
          _cached.timestamp = Date.now()
          _cached.revalidating = false

          debug('Cache set')
        })
        .catch(function (err) {
          debug('Cache set failed: %s', err.message)

          cache.delete(key)
        })
    } else if (keyAge > revalidate) {
      debug('Cache is stale, revalidating')

      cached.revalidating = true
      Promise.resolve(fn(...args))
        .then(function (result) {
          cached.data = Promise.resolve(result)
          cached.timestamp = Date.now()
          cached.revalidating = false

          debug('Cache revalidated')
        })
        .catch(function (err) {
          debug('Cache revalidation failed: %s', err.message)

          cached.revalidating = false
        })
    }

    debug('Returning cached data')
    return cache.get(key).data
  }
}

module.exports = pSwr
