'use strict'

const { setTimeout } = require('node:timers/promises')
const chai = require('chai')
const sinon = require('sinon')

chai.should()

const pThrottleBucket = require('..')

describe('Promise Throttle Bucket', function () {
  it('should throttle a function', function () {
    const fn = sinon.spy(() => Promise.resolve())
    const wrapped = pThrottleBucket(fn, { interval: 100, max: 5, refill: 2 })

    function callFnTimes(n) {
      return Promise.all(new Array(n).fill(null).map(() => wrapped()))
    }
    function waitAndCheckCalls(delay, n) {
      return setTimeout(delay).then(function () {
        fn.callCount.should.equals(n)
      })
    }

    return Promise.all([
      callFnTimes(9),
      waitAndCheckCalls(50, 5),
      waitAndCheckCalls(150, 7),
      waitAndCheckCalls(250, 9),
      waitAndCheckCalls(350, 9),
      waitAndCheckCalls(450, 9),
      waitAndCheckCalls(550, 9)
    ])
  })
})
