import { decrement, increment } from '../utils'

import type { DesktopImage } from './layout'
import type { HistoryItem } from './state'

export function getTrailElsIndex(cordHistValue: HistoryItem[]): number[] {
  return cordHistValue.map((el) => el.i)
}

export function getTrailInactiveElsIndex(
  cordHistValue: HistoryItem[],
  trailLength: number
): number[] {
  return getTrailElsIndex(cordHistValue).slice(-trailLength).slice(0, -1)
}

export function getCurrentElIndex(cordHistValue: HistoryItem[]): number {
  return getTrailElsIndex(cordHistValue).slice(-1)[0]
}

export function getPrevElIndex(cordHistValue: HistoryItem[], length: number): number {
  return decrement(cordHistValue.slice(-1)[0].i, length)
}

export function getNextElIndex(cordHistValue: HistoryItem[], length: number): number {
  return increment(cordHistValue.slice(-1)[0].i, length)
}

export function getImagesFromIndexes(
  imgs: DesktopImage[],
  indexes: number[]
): DesktopImage[] {
  return indexes.map((i) => imgs[i])
}

export function hires(imgs: DesktopImage[]): void {
  imgs.forEach((img) => {
    if (img.src === img.dataset.hiUrl) return
    img.src = img.dataset.hiUrl
    img.height = parseInt(img.dataset.hiImgH)
    img.width = parseInt(img.dataset.hiImgW)
  })
}

export function lores(imgs: DesktopImage[]): void {
  imgs.forEach((img) => {
    if (img.src === img.dataset.loUrl) return
    img.src = img.dataset.loUrl
    img.height = parseInt(img.dataset.loImgH)
    img.width = parseInt(img.dataset.loImgW)
  })
}

export function onMutation<T extends HTMLElement>(
  element: T,
  trigger: (arg0: MutationRecord) => boolean,
  observeOptions: MutationObserverInit = { attributes: true }
): void {
  new MutationObserver((mutations, observer) => {
    for (const mutation of mutations) {
      if (trigger(mutation)) {
        observer.disconnect()
        break
      }
    }
  }).observe(element, observeOptions)
}
