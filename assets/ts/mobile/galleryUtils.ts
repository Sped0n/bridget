import type { Vector } from '../utils'

export function getActiveImageIndexes(
  currentIndex: number,
  length: number,
  navigateVector: Vector
): number[] {
  const nextIndex = Math.min(currentIndex + 1, length - 1)
  const prevIndex = Math.max(currentIndex - 1, 0)

  switch (navigateVector) {
    case 'next':
      return [currentIndex, nextIndex]
    case 'prev':
      return [currentIndex, prevIndex]
    case 'none':
      return [currentIndex, nextIndex, prevIndex]
  }
}
