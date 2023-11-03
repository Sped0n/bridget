import { type Power3, type gsap } from 'gsap'
import { type Swiper } from 'swiper'

/**
 * custom helpers
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

export function isMobile(): boolean {
  return window.matchMedia('(hover: none)').matches
}

export function getRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function onVisible<T extends Element>(
  element: T,
  callback: (arg0: T) => void
): void {
  new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0) {
        callback(element)
        observer.disconnect()
      }
    })
  }).observe(element)
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export async function loadGsap(): Promise<[typeof gsap, typeof Power3]> {
  const g = await import('gsap')
  return [g.gsap, g.Power3]
}

export async function loadSwiper(): Promise<typeof Swiper> {
  const s = await import('swiper')
  return s.Swiper
}

/**
 * custom types
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
