export interface ImageData {
  index: string
  url: string
  imgH: string
  imgW: string
}

export interface position {
  x: number
  y: number
}

// cache a xy position to array
export const posCache = (x: number, y: number, xyArray: string[][]): void => {
  // pop element if length surpass limitation
  xyArray[0].shift()
  xyArray[1].shift()
  // push new element
  xyArray[0].push(`${x}px`)
  xyArray[1].push(`${y}px`)
}

// 0 to 0001, 25 to 0025
export function duper(num: number): string {
  return ('0000' + num.toString()).slice(-4)
}

// FIFO data array for image display
export const FIFO = (
  element: HTMLImageElement,
  layersArray: HTMLDivElement[]
): void => {
  function layerProcess(layerL: HTMLDivElement, layerH: HTMLDivElement): void {
    if (layerL.childElementCount !== 0)
      layerL.removeChild(layerL.lastElementChild as HTMLImageElement)
    if (layerH.childElementCount !== 0) {
      const layerHNode = layerH.lastElementChild as HTMLImageElement
      layerL.appendChild(layerHNode.cloneNode(true))
    }
  }
  for (let i: number = 0; i <= 3; i++) {
    layerProcess(layersArray[i], layersArray[i + 1])
  }
  if (layersArray[4].childElementCount !== 0)
    layersArray[4].removeChild(layersArray[4].lastElementChild as HTMLImageElement)
  layersArray[4].appendChild(element)
}

// set position for 5 image display layers
export const layersPosSet = (
  xyArray: string[][],
  layersArray: HTMLDivElement[]
): void => {
  function posSet(layer: HTMLDivElement, index: number): void {
    layer.style.left = xyArray[0][index]
    layer.style.top = xyArray[1][index]
  }
  for (let i = 4; i >= 0; i--) {
    posSet(layersArray[i], i)
  }
}

// eslint-disable-next-line @typescript-eslint/promise-function-async
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// remove all event listeners from a node
export function removeAllEventListeners(e: Node): Node {
  return e.cloneNode(true)
}

// center top div
export const center = (e: HTMLDivElement): void => {
  e.style.left = '50%'
  if (window.innerWidth > 768) {
    e.style.top = 'calc((100% - 38px) / 2)'
  } else {
    e.style.top = 'calc((100% - 31px) / 2 + 31px)'
  }
}

export function createImgElement(input: ImageData): HTMLImageElement {
  const img = document.createElement('img')
  img.setAttribute('src', input.url)
  img.setAttribute('alt', input.index)
  img.setAttribute('height', input.imgH)
  img.setAttribute('width', input.imgW)
  return img
}
