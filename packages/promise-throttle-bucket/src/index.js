'use strict'

const debug = require('debug')('promise-throttle-bucket')

const { setTimeout: pSetTimeout } = require('timers/promises')

/**
 * Throttles a promise-returning function using the token bucket algorithm.
 *
 * See: https://en.wikipedia.org/wiki/Token_bucket
 *
 * @param {function} fn The function to throttle.
 * @param {object} options Throttling options.
 * @param {number} options.max Max tokens in bucket.
 * @param {number} options.refill Refill tokens per interval.
 * @param {number} [options.interval] Refill interval defaults to 1 second.
 * @returns
 */
function pThrottleBucket(fn, options) {
  const { max, refill, interval = 1000 } = options

  let bucket = max
  let refillPending = false

  function tryRefill() {
    if (refillPending) {
      return
    }
    refillPending = true
    setTimeout(function () {
      refillPending = false
      if (bucket + refill < max) {
        bucket += refill
        tryRefill()
      } else if (bucket < max) {
        bucket = max
      }
      debug('Refilled to %s', bucket)
    }, interval)
  }

  function throttled(...args) {
    if (bucket > 0) {
      bucket -= 1
      tryRefill()
      debug('Calling fn')
      return Promise.resolve(fn(...args))
    }
    debug('Throttling down...')
    return pSetTimeout(interval).then(() => throttled(...args))
  }

  return throttled
}

module.exports = pThrottleBucket
