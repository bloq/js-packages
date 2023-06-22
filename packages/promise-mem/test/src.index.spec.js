'use strict'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const sinon = require('sinon')

chai.use(chaiAsPromised).should()

const pMem = require('..')

describe('Promise Memoize', function () {
  it('should call the fn if not previously cached', function () {
    const fn = sinon.fake.resolves(true)
    const memoized = pMem(fn)
    memoized.should.be.a('function')
    return memoized(1).then(function (res) {
      fn.calledOnce.should.be.true
      fn.calledWith(1).should.be.true
      res.should.be.true
    })
  })

  it('should memoize different calls', function () {
    const fn = sinon.stub()
    fn.withArgs(1).resolves(true)
    fn.withArgs(2).resolves(false)
    const memoized = pMem(fn)
    memoized.should.be.a('function')
    return memoized(1)
      .then(function (res) {
        fn.calledOnce.should.be.true
        fn.calledWith(1).should.be.true
        res.should.be.true
        return memoized(2)
      })
      .then(function (res) {
        fn.calledTwice.should.be.true
        fn.calledWith(2).should.be.true
        res.should.be.false
      })
  })

  it('should return a memoized result', function () {
    const fn = sinon.fake.resolves(true)
    const memoized = pMem(fn)
    memoized.should.be.a('function')
    return Promise.all([memoized(1), memoized(1)]).then(function (res) {
      fn.calledOnce.should.be.true
      fn.calledWith(1).should.be.true
      res.should.deep.equal([true, true])
    })
  })

  it('should not cache a rejection', function () {
    const fn = sinon.fake.rejects('test')
    const memoized = pMem(fn)
    memoized.should.be.a('function')
    return memoized()
      .should.be.rejectedWith('test')
      .then(function () {
        fn.calledOnce.should.be.true
        return memoized()
      })
      .should.be.rejectedWith('test')
      .then(function () {
        fn.calledTwice.should.be.true
      })
  })

  it('should call the fn again after expiration', function () {
    const clock = sinon.useFakeTimers(new Date())
    const fn = sinon.fake.resolves(null)
    const memoized = pMem(fn, { maxAge: 100 })
    return memoized()
      .then(function () {
        fn.callCount.should.equal(1)
        clock.tick(50)
        return memoized()
      })
      .then(function () {
        fn.callCount.should.equal(1)
        clock.tick(60)
        return memoized()
      })
      .then(function () {
        fn.callCount.should.equal(2)
      })
      .finally(function () {
        clock.restore()
      })
  })

  it('should start the expiration after the fn resolves', function () {
    this.slow(500)
    const fn = sinon.spy(
      () =>
        new Promise(function (resolve) {
          setTimeout(resolve, 100)
        })
    )
    const memoized = pMem(fn, { lazy: false, maxAge: 50 })
    return memoized()
      .then(function () {
        fn.callCount.should.equal(1)
        return memoized()
      })
      .then(function () {
        fn.callCount.should.equal(2)
      })
  })

  it('should resolve equal args by default', function () {
    let seq = 0
    const fn = sinon.spy(n => Promise.resolve(`${n}:${seq++}`))
    const memoized = pMem(fn)

    return Promise.all([memoized(1), memoized(1), memoized(2)]).then(function (
      results
    ) {
      fn.callCount.should.equal(2)
      results[0].should.equal(results[1])
      results[0].should.not.equal(results[2])
    })
  })

  it('should resolve equivalent args with a resolver', function () {
    const sumAsync = sinon.spy((a, b) => Promise.resolve(a + b))
    const memoized = pMem(sumAsync, { resolver: (a, b) => a + b })

    return Promise.all([memoized(1, 2), memoized(2, 1), memoized(2, 2)]).then(
      function (results) {
        sumAsync.callCount.should.equal(2)
        results[0].should.equal(results[1])
        results[0].should.not.equal(results[2])
      }
    )
  })
})
