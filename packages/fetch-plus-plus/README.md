# fetch-plus-plus

![NPM Version](https://img.shields.io/npm/v/fetch-plus-plus)

A simple isomorphic wrapper around fetch with retries and error handling

## Motivation

This package is a simple wrapper around [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch) that adds some utilities, such as retries, error handling, as well as doing some automatic conversions of data (like building the query string from an object).

## Install

```sh
npm install fetch-plus-plus
```

## Usage

```js
const fetch = require('fetch-plus-plus').default
fetch('https://some-json-api.com', {
  headers: {
    'Authorization': 'Bearer <some-bearer>',
    'Content-Type': 'application/json'
  },
  insecure: true,
  method: 'POST',
  queryString: { api: 'some-private-api' },
  retries: 3
}).then(function (jsonResponse) {
  // jsonResponse is a JSON object
})
```

## API

### fetch(url, options?)

Returns a Promise which will be resolved to the response of the request.

#### url

Type: `string`

The URL to request.

#### options?

Type: `object`
It uses [fetch default options](https://www.npmjs.com/package/node-fetch#options), extending it with the following options:

##### options.ignoreError?

Type: `boolean`
Default: `false`

Returns the body instead of throwing if the request failed

##### options.insecure?

Type: `boolean`
Default: `false`

Allows insecure requests (such as self-signed certificates) instead of rejecting them

##### options.queryString?

Type: `object`
Default: `{}`

The object that will be converted to a query string and append to the URL

##### options.retries?

Type: `number`
Default: `0`

The max number of retries to attempt if the request fails.
