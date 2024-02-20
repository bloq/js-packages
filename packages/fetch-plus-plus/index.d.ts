type ExtendedOptions = {
  ignoreError?: boolean
  insecure?: boolean
  queryString?: Record<string, any>
  retries?: number
}
/**
 * Extends `fetch` with common patterns used to make requests and handle
 * responses.
 *
 * The `options` are extended with:
 *
 * - `ignoreError` to prevent it to throw when res.ok is false.
 * - `insecure` to allow HTTPS calls using self-signed certificates.
 * - `queryString` to add query string parameters to the URL.
 * - `retries` number of times to retry the request when it fails.
 */
declare function fetchPlusPlus(
  url: Request['url'],
  options?: RequestInit & ExtendedOptions
): Promise<any>
export default fetchPlusPlus
