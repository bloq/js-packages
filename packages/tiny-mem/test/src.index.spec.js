'use strict'

const chai = require('chai')
const sinon = require('sinon')

chai.should()

const memoize = require('..')

describe('Tiny Memoize', function () {
  it('should memoize different calls', function () {
    const fn = sinon.stub()
    fn.withArgs(1).returns(true)
    fn.withArgs(2).returns(false)
    const memoized = memoize(fn)
    memoized.should.be.a('function')
    const res1 = memoized(1)
    fn.calledOnce.should.be.true
    fn.calledWith(1).should.be.true
    res1.should.be.true
    const res2 = memoized(2)
    fn.calledTwice.should.be.true
    fn.calledWith(2).should.be.true
    res2.should.be.false
  })

  it('should return a memoized result', function () {
    const fn = sinon.fake.returns(true)
    const memoized = memoize(fn)
    memoized.should.be.a('function')
    const res = [memoized(1), memoized(1)]
    fn.calledOnce.should.be.true
    fn.calledWith(1).should.be.true
    res.should.deep.equal([true, true])
  })

  it('should resolve equal args by default', function () {
    let seq = 0
    const fn = sinon.spy(n => `${n}:${seq++}`)
    const memoized = memoize(fn)
    const results = [memoized(1), memoized(1), memoized(2)]
    fn.callCount.should.equal(2)
    results[0].should.equal(results[1])
    results[0].should.not.equal(results[2])
  })

  it('should resolve equivalent args with a resolver', function () {
    const sum = sinon.spy((a, b) => a + b)
    const memoized = memoize(sum, { resolver: (a, b) => a + b })
    const results = [memoized(1, 2), memoized(2, 1), memoized(2, 2)]
    sum.callCount.should.equal(2)
    results[0].should.equal(results[1])
    results[0].should.not.equal(results[2])
  })
})
