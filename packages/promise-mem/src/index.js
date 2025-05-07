'use strict'

/**
 * Memoizes a promise-returning function.
 *
 * This function replaces p-memoize as that library does not properly handle
 * multiple calls in parallel.
 *
 * @template {(...args:Array)=>Promise} T
 * @param {T} fn The function to memoize.
 * @param {object} [options] The options.
 * @param {Map} [options.cache] The storage. Must implement the `Map` interface.
 * @param {boolean} [options.lazy] If timeout counts after fn settles.
 * @param {number} [options.maxAge] The max time to hold a memoized call in ms.
 * @param {Function} [options.resolver] The key resolver function.
 * @returns {T} The memoized function.
 */
function pMemoize(fn, options = {}) {
  const {
    cache = new Map(),
    lazy = true,
    maxAge = Infinity,
    resolver = (...args) => args[0]
  } = options

  return /** @type {T} */ (
    function (...args) {
      const key = resolver(...args)

      if (cache.has(key)) {
        const cached = cache.get(key)

        if (cached.expires > Date.now()) {
          return cached.data
        }

        cache.delete(key)
      }

      const data = Promise.resolve(fn(...args))
      cache.set(key, { data, expires: lazy ? Infinity : Date.now() + maxAge })

      data
        .then(function () {
          if (lazy && cache.has(key)) {
            cache.set(key, { data, expires: Date.now() + maxAge })
          }
        })
        .catch(function () {
          cache.delete(key)
        })

      return data
    }
  )
}

module.exports = pMemoize
