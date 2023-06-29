'use strict'

/**
 * Memoizes function results.
 *
 * @template {(...args:any[])=>any} T
 * @param {T} fn The function to memoize.
 * @param {object} [options] The options.
 * @param {Map} [options.cache] The storage. Must implement the `Map` interface.
 * @param {Function} [options.resolver] The key resolver function.
 * @returns {T} The memoized function.
 */
function memoize(fn, options = {}) {
  const { cache = new Map(), resolver = (...args) => args[0] } = options

  return /** @type {T} */ (
    function (...args) {
      const key = resolver(...args)

      if (!cache.has(key)) {
        cache.set(key, { value: fn(...args) })
      }

      return cache.get(key).value
    }
  )
}

module.exports = memoize
