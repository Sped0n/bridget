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
  callback: (arg0: IntersectionObserverEntry[], arg1: IntersectionObserver) => void
): void {
  new IntersectionObserver((entries, observer) => {
    callback(entries, observer)
  }).observe(element)
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
