import { Watchable } from './globalUtils'

export const scrollable = new Watchable<boolean>(true)

export let container: Container

/**
 * interfaces
 */

export interface Container extends HTMLDivElement {
  dataset: {
    next: string
    close: string
    prev: string
    loading: string
  }
}

export function initContainer(): void {
  container = document.getElementsByClassName('container').item(0) as Container
  scrollable.addWatcher((o) => {
    if (o) {
      container.classList.remove('disableScroll')
    } else {
      container.classList.add('disableScroll')
    }
  })
}
