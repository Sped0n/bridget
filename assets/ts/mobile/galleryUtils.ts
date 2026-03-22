import { type Swiper } from 'swiper'

import type { Vector } from '../utils'

export async function loadSwiper(): Promise<typeof Swiper> {
  const swiper = await import('swiper')
  return swiper.Swiper
}

export function getActiveImageIndexes(
  currentIndex: number,
  length: number,
  navigateVector: Vector
): number[] {
  const nextIndex = Math.min(currentIndex + 1, length - 1)
  const prevIndex = Math.max(currentIndex - 1, 0)

  switch (navigateVector) {
    case 'next':
      return [nextIndex]
    case 'prev':
      return [prevIndex]
    case 'none':
      return [currentIndex, nextIndex, prevIndex]
  }
}
