# promise-throttle-bucket

![NPM Version](https://img.shields.io/npm/v/promise-throttle-bucket)

[Throttles](https://css-tricks.com/debouncing-throttling-explained-examples/) a promise-returning function using the [token-bucket algorithm](https://en.wikipedia.org/wiki/Token_bucket).

## Motivation

Many AWS APIs are throttled using the token-bucket algorithm.
For instance, to prevent hitting the [EC2 rate limits](https://docs.aws.amazon.com/AWSEC2/latest/APIReference/throttling.html#throttling-limits), the functions that call the AWS API can be wrapped and throttled.

## Install

```sh
npm install promise-throttle-bucket
```

## Usage

```js
const pThrottleBucket = require('promise-throttle-bucket')

const throttledFn = pThrottleBucket(describeEc2Instance, {
  max: 100,
  refill: 20
})

Promise.all(
  [
    /* array of 150 instances */
  ].map(throttledFn)
)
  // After 0s, described instances 0-99
  // After 1s, described instances 100-119
  // After 2s, described instances 120-139
  // After 3s, described instances 140-150
  .then(function (instances) {
    // Resolves after all the instances were described.
  })
```

## API

### pThrottleBucket(fn, options)

Returns a throttled function.

#### fn

Type: `Function`

A function.

#### options

Type: `object`

##### options.max

Type: `number`

The maximum number of tokens in the bucket.

##### options.refill

Type: `number`

The number of refill tokens per interval in milliseconds.

##### options.interval?

Type: `number`
Default: `1000`

The refill interval in milliseconds.

### throttledFn

Type: `function`

The throttled version of `fn`.
It resolves when `fn()` resolves and rejects if it rejects.
The time it takes to settle depends on how many calls are in the queue and the throttling parameters.
