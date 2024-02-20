'use strict'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const createError = require('http-errors')
const nock = require('nock')
const sinon = require('sinon')

chai.use(chaiAsPromised).should()

const fetchPlusPlus = require('../index')

const url = 'https://my-url.com'
const endpoint = '/test'
const fullUrl = `${url}${endpoint}`

describe('fetch-plus-plus', function () {
  afterEach(function () {
    nock.cleanAll()
  })

  it('should retry if specified', async function () {
    // as p-retry has some delay between requests, we need to extend the timeout
    // a little bit
    this.timeout(8000)
    const retries = 3
    const fakeCall = sinon.spy()
    nock(url)
      // first time it fails
      .get(endpoint)
      .reply(500, { ok: false })
      // then there are the retries
      .get(endpoint)
      .times(retries - 1)
      .reply(500, function () {
        fakeCall()
        return { ok: false }
      })
      // then response is returned successfully
      .get(endpoint)
      .reply(200, function () {
        fakeCall()
        return { ok: true }
      })

    const response = await fetchPlusPlus(fullUrl, {
      retries
    })
    response.should.eql({ ok: true })
    fakeCall.callCount.should.be.equal(retries)
  })

  it('should not retry by default', async function () {
    const fakeCall = sinon.spy()
    nock(url)
      .get(endpoint)
      .reply(500, function () {
        fakeCall()
        return { ok: false }
      })

    await fetchPlusPlus(fullUrl).should.be.rejectedWith(
      createError.InternalServerError
    )
    fakeCall.callCount.should.be.equal(1)
  })

  it('should ignore the error if specified', async function () {
    nock(url).get(endpoint).reply(500, { ok: false })

    const response = await fetchPlusPlus(fullUrl, {
      ignoreError: true
    }).should.not.be.rejected
    response.should.eql({ ok: false })
  })

  it('should throw an error if the response is not ok and the error is not ignored', async function () {
    nock(url).get(endpoint).reply(500, { ok: false })
    await fetchPlusPlus(fullUrl).should.be.rejected
  })

  it('should add query string to the url', async function () {
    const queryString = { a: 1, array: ['value1', 'value2'], b: 2 }
    nock(url)
      .get(endpoint)
      .query(queryString)
      .reply(200, () => ({ ok: true }))

    const response = await fetchPlusPlus(fullUrl, {
      queryString
    })

    response.should.eql({ ok: true })
  })

  it('should default to GET if no options are defined', async function () {
    nock(url)
      .get(endpoint)
      .reply(200, () => ({ ok: true }))

    const response = await fetchPlusPlus(fullUrl)

    response.should.eql({ ok: true })
  })
})
