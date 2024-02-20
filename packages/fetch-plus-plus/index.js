'use strict'

require('isomorphic-fetch')
const http = require('http')

const createError = require('http-errors')
const https = require('https')
const pRetry = require('p-retry')

function tryToParseJson(str) {
  try {
    return JSON.parse(str)
  } catch (err) {
    return str
  }
}

function parseBody(res) {
  if (res.status === 204) {
    return Promise.resolve()
  }
  if (res.headers.get('content-type')?.includes('application/json')) {
    return res.json()
  }
  return res.text().then(tryToParseJson)
}

function fetchPlusPlus(url, options) {
  const {
    queryString = {},
    retries = 0,
    ...fetchOptions
  } = options ?? { method: 'GET' }
  let finalUrl = url
  if (Object.keys(queryString).length > 0) {
    // arrays output in query string is different
    // depending on if it is passed in the constructor or using .append() method
    // AWS works better with the output from .append()
    const searchParams = new URLSearchParams()
    Object.entries(queryString).forEach(([key, value]) =>
      Array.isArray(value)
        ? value.forEach(v => searchParams.append(key, v))
        : searchParams.append(key, value)
    )
    finalUrl = `${url}?${searchParams}`
  }

  if (finalUrl.startsWith('http://')) {
    fetchOptions.agent = new http.Agent()
  } else if (fetchOptions.insecure) {
    fetchOptions.agent = new https.Agent({
      rejectUnauthorized: false
    })
  }

  return pRetry(
    () =>
      fetch(finalUrl, fetchOptions)
        .then(res => Promise.all([res, parseBody(res)]))
        .then(function ([res, body]) {
          if (!res.ok && !fetchOptions.ignoreError) {
            throw createError(res.status, body)
          }
          return body
        }),
    {
      retries,
      ...(fetchOptions.signal ? { signal: fetchOptions.signal } : {})
    }
  )
}

module.exports = fetchPlusPlus
