'use strict'

const chai = require('chai')
const sinon = require('sinon')

chai.should()

const pStaleIfError = require('../src')

describe('Stale If Error', function () {
  it('should resolve if the fn call resolves', function () {
    const fn = () => Promise.resolve(true)
    const wrapped = pStaleIfError(fn)

    return wrapped().then(function (res) {
      res.should.equal(true)
    })
  })

  it('should reject if the fn call rejects', function () {
    const fn = () => Promise.reject(new Error('Fake error'))
    const wrapped = pStaleIfError(fn)

    return wrapped()
      .then(function () {
        throw new Error('Promise nexpectedly resolved')
      })
      .catch(function (err) {
        err.should.have.property('message', 'Fake error')
      })
  })

  it('should cache results based on the fn call arguments', function () {
    const fn = n => Promise.resolve(n)
    const wrapped = pStaleIfError(fn)

    return wrapped(1)
      .then(function (res) {
        res.should.equal(1)
        return wrapped(2)
      })
      .then(function (res) {
        res.should.equal(2)
        return wrapped(1)
      })
      .then(function (res) {
        res.should.equal(1)
      })
  })

  it('should resolve with the last result if the call rejects', function () {
    const fn = sinon.spy(function () {
      if (fn.callCount === 2) {
        return Promise.reject(new Error('Fake error'))
      }
      return fn.callCount
    })
    const wrapped = pStaleIfError(fn)

    return wrapped()
      .then(function (res) {
        res.should.equal(1)
        return wrapped()
      })
      .then(function (res) {
        res.should.equal(1)
        return wrapped()
      })
      .then(function (res) {
        res.should.equal(3)
      })
  })

  it('should call the error handler if defined', function () {
    const fn = () => Promise.reject(new Error('Crash'))
    const onError = sinon.spy(err => err.message)
    const wrapped = pStaleIfError(fn, { onError })

    return wrapped().then(function (message) {
      onError.calledOnce.should.be.true
      message.should.equal('Crash')
    })
  })
})
