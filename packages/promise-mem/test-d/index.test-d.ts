import { expectType } from 'tsd'
import promiseMem from '../src'

type Result = { a: number; b: string }

const result: Result = { a: 1, b: 'b' }

const asyncFn = (a: number, b: string) => Promise.resolve({ a, b })

expectType<() => Promise<Result>>(promiseMem(() => Promise.resolve(result)))
expectType<Result>(await promiseMem(() => Promise.resolve(result))())
expectType<(a: number, b: string) => Promise<Result>>(promiseMem(asyncFn))
