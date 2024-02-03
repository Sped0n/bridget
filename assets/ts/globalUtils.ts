import { type Power3, type gsap } from 'gsap'
import { type Swiper } from 'swiper'

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

export async function loadGsap(): Promise<[typeof gsap, typeof Power3]> {
  const g = await import('gsap')
  return [g.gsap, g.Power3]
}

export async function loadSwiper(): Promise<typeof Swiper> {
  const s = await import('swiper')
  return s.Swiper
}

export function getThresholdSessionIndex(): number {
  const s = sessionStorage.getItem('thresholdsIndex')
  if (s === null) return 2
  return parseInt(s)
}

export function removeDuplicates<T>(arr: T[]): T[] {
  console.log('before', arr)
  console.log('after', [...new Set(arr)])
  return [...new Set(arr)]
}

/**
 * custom "reactive" object
 */

export class Watchable<T> {
  constructor(private obj: T) {}
  private readonly watchers: Array<(arg0: T) => void> = []

  get(): T {
    return this.obj
  }

  set(e: T): void {
    this.obj = e
    this.watchers.forEach((watcher) => {
      watcher(this.obj)
    })
  }

  addWatcher(watcher: (arg0: T) => void): void {
    this.watchers.push(watcher)
  }
}
