# js-packages

This is a collection of small and useful packages we use across many of our solutions. Have fun!

## Packages

### Promises

- [`promise-mem`](./packages/promise-mem): Memoizes a promise-returning function.
- [`promise-stale-if-error`](./packages/promise-stale-if-error): Wraps a promise-returning function so it resolves to the last good value on error.
- [`promise-swr`](./packages/promise-swr): Caches a promise-returning function with a stale-while-revalidate strategy.
- [`promise-throttle-bucket`](./packages/promise-throttle-bucket): Throttles a promise-returning function using the token-bucket algorithm.

### Timy ones

- [`tiny-mem`](./packages/tiny-mem): Minimal, no-dependencies memoization helper.

## Publishing

To publish the latest changes to the packages, execute this command:

```sh
npx lerna publish --concurrency 1 --otp <OTP>
```
