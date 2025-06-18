type Options<TArgs extends any[]> = {
  cache?: Map<any, any>
  lazy?: boolean
  maxAge?: number
  resolver?: (...args: TArgs) => any
}

type Fn<TReturnValue extends unknown, TArgs extends any[]> = (
  ...args: TArgs
) => Promise<TReturnValue>

declare function pMemoize<TReturnValue extends unknown, TArgs extends any[]>(
  fn: Fn<TReturnValue, TArgs>,
  options?: Options<TArgs>
): Fn<TReturnValue, TArgs>
export = pMemoize
