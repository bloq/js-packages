'use strict'

const { setTimeout } = require('node:timers/promises')
const chai = require('chai')
const sinon = require('sinon')

chai.should()

const pSwr = require('../src')

const ticks = n => n * 50

describe('Stale While Revalidating', function () {
  it('should return new data in the first call', function () {
    this.slow(ticks(10))

    const fn = sinon.spy(function () {
      return setTimeout(ticks(1)).then(() => fn.callCount)
    })
    const wrapped = pSwr(fn)

    return wrapped().then(function (res) {
      res.should.equal(1)
      fn.callCount.should.equal(1)
    })
  })

  it('should return fresh data in the second call', function () {
    this.slow(ticks(10))

    const fn = sinon.spy(function () {
      return setTimeout(ticks(1)).then(() => fn.callCount)
    })
    const wrapped = pSwr(fn, { revalidate: ticks(4) })

    return wrapped()
      .then(function (res) {
        res.should.equal(1)
        fn.callCount.should.equal(1)
        return setTimeout(ticks(2))
      })
      .then(wrapped)
      .then(function (res) {
        res.should.equal(1)
        fn.callCount.should.equal(1)
      })
  })

  it('should return stale data in the second call and revalidate', function () {
    this.slow(ticks(10))

    const fn = sinon.spy(function () {
      return setTimeout(ticks(1)).then(() => fn.callCount)
    })
    const wrapped = pSwr(fn)

    return wrapped()
      .then(function (res) {
        res.should.equal(1)
        fn.callCount.should.equal(1)
        return setTimeout(ticks(1))
      })
      .then(wrapped)
      .then(function (res) {
        res.should.equal(1)
        fn.callCount.should.equal(2)
      })
  })

  it('should not revalidate while revalidating', function () {
    this.slow(ticks(10))

    const fn = sinon.spy(function () {
      return setTimeout(ticks(1)).then(() => fn.callCount)
    })
    const wrapped = pSwr(fn)

    return wrapped()
      .then(function (res) {
        res.should.equal(1)
        fn.callCount.should.equal(1)
        return setTimeout(ticks(1))
      })
      .then(wrapped)
      .then(function (res) {
        res.should.equal(1)
        fn.callCount.should.equal(2)
      })
      .then(wrapped)
      .then(function (res) {
        res.should.equal(1)
        fn.callCount.should.equal(2)
      })
  })

  it('should return stale data and not cache a failure', function () {
    this.slow(ticks(20))

    const fn = sinon.spy(function () {
      return setTimeout(ticks(1)).then(() =>
        fn.callCount === 2
          ? Promise.reject(new Error('Reject revalidation'))
          : fn.callCount
      )
    })
    const wrapped = pSwr(fn, { revalidate: ticks(4) })

    return wrapped()
      .then(function (res) {
        res.should.equal(1)
        fn.callCount.should.equal(1)
        return setTimeout(ticks(4))
      })
      .then(wrapped)
      .then(function (res) {
        res.should.equal(1)
        fn.callCount.should.equal(2)
        return setTimeout(ticks(1))
      })
      .then(wrapped)
      .then(function (res) {
        res.should.equal(1)
        fn.callCount.should.equal(3)
      })
  })

  it('should reject if first call rejects', function () {
    this.slow(ticks(10))

    const fn = sinon.spy(function () {
      return setTimeout(ticks(1)).then(function () {
        throw new Error('Reject revalidation')
      })
    })
    const wrapped = pSwr(fn)

    return wrapped().catch(function (err) {
      if (err.message !== 'Reject revalidation') {
        throw err
      }
    })
  })

  it('should revalidate after a first-call rejection', function () {
    this.slow(ticks(10))

    const fn = sinon.spy(function () {
      return setTimeout(ticks(1)).then(() =>
        fn.callCount === 1
          ? Promise.reject(new Error('Reject revalidation'))
          : fn.callCount
      )
    })
    const wrapped = pSwr(fn)

    return wrapped()
      .catch(function () {
        fn.callCount.should.equal(1)
      })
      .then(wrapped)
      .then(function (res) {
        res.should.equal(2)
        fn.callCount.should.equal(2)
      })
  })

  it('should return refreshed data after revalidation', function () {
    this.slow(ticks(20))

    const fn = sinon.spy(function () {
      return setTimeout(ticks(1)).then(() => fn.callCount)
    })
    const wrapped = pSwr(fn, { revalidate: ticks(3) })

    return wrapped()
      .then(function (res) {
        res.should.equal(1)
        fn.callCount.should.equal(1)
        return setTimeout(ticks(4))
      })
      .then(wrapped)
      .then(function (res) {
        res.should.equal(1)
        fn.callCount.should.equal(2)
        return setTimeout(ticks(2))
      })
      .then(wrapped)
      .then(function (res) {
        res.should.equal(2)
        fn.callCount.should.equal(2)
      })
  })

  it('should revalidate old data', function () {
    this.slow(ticks(20))

    const fn = sinon.spy(function () {
      return setTimeout(ticks(1)).then(() => fn.callCount)
    })
    const wrapped = pSwr(fn, { maxAge: ticks(3) })

    return wrapped()
      .then(function (res) {
        res.should.equal(1)
        fn.callCount.should.equal(1)
        return setTimeout(ticks(4))
      })
      .then(wrapped)
      .then(function (res) {
        res.should.equal(2)
        fn.callCount.should.equal(2)
      })
  })
})
