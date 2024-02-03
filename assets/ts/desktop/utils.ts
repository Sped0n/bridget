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
  callback: (arg0: MutationRecord[], arg1: MutationObserver) => void,
  observeOptions: MutationObserverInit = { attributes: true }
): void {
  new MutationObserver((mutations, observer) => {
    callback(mutations, observer)
  }).observe(element, observeOptions)
}
