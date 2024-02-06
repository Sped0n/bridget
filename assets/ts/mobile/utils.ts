import { type Swiper } from 'swiper'

/**
 * interfaces
 */

export interface MobileImage extends HTMLImageElement {
  dataset: {
    src: string
  }
}

/**
 * utils
 */

export function getRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function onIntersection<T extends HTMLElement>(
  element: T,
  trigger: (arg0: IntersectionObserverEntry) => boolean
): void {
  new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (trigger(entry)) {
        observer.disconnect()
        break
      }
    }
  }).observe(element)
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export async function loadSwiper(): Promise<typeof Swiper> {
  const s = await import('swiper')
  return s.Swiper
}
