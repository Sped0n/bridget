import { type gsap } from 'gsap'

/**
 * types
 */

export type Vector = 'prev' | 'next' | 'none'

/**
 * utils
 */

export function increment(num: number, length: number): number {
  return (num + 1) % length
}

export function decrement(num: number, length: number): number {
  return (num + length - 1) % length
}

export function expand(num: number): string {
  return ('0000' + num.toString()).slice(-4)
}

export async function loadGsap(): Promise<typeof gsap> {
  const g = await import('gsap')
  return g.gsap
}
