/**
 * interfaces
 */

export interface DesktopImage extends HTMLImageElement {
  dataset: {
    hiUrl: string
    hiImgH: string
    hiImgW: string
    loUrl: string
    loImgH: string
    loImgW: string
  }
}

/**
 * utils
 */

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
