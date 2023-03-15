export interface ImageData {
  index: string
  url: string
  imgH: string
  imgW: string
  pColor: string
  sColor: string
}

export interface position {
  x: number
  y: number
}

export interface imgElement {
  image: HTMLImageElement
  bgStyle: string
}

export interface deviceType {
  mobile: boolean
  tablet: boolean
  desktop: boolean
}

// cache a xy position to array
export const styleCache = (
  x: number,
  y: number,
  bg: string,
  styleArray: string[][]
): void => {
  // pop element if length surpass limitation
  styleArray[0].shift()
  styleArray[1].shift()
  styleArray[2].shift()
  // push new element
  styleArray[0].push(`${x}px`)
  styleArray[1].push(`${y}px`)
  styleArray[2].push(bg)
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
export const layersStyleSet = (
  styleArray: string[][],
  layersArray: HTMLDivElement[],
  posOut: boolean = true,
  styleOut: boolean = true
): void => {
  function posSet(layer: HTMLDivElement, index: number): void {
    if (posOut) {
      layer.style.left = styleArray[0][index]
      layer.style.top = styleArray[1][index]
    }
    if (styleOut) layer.style.backgroundImage = styleArray[2][index]
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

export function createImgElement(input: ImageData, returnBgStyle: boolean): imgElement {
  const img = document.createElement('img')
  img.setAttribute('src', input.url)
  img.setAttribute('alt', '')
  img.setAttribute('height', input.imgH)
  img.setAttribute('width', input.imgW)
  img.setAttribute('loading', 'eager')
  img.style.opacity = '0'
  img.onload = async () => {
    img.style.opacity = '1'
    img.style.transition = 'opacity 0.5s ease-in'
    await delay(500)
    img.style.transition = ''
  }
  const style: string = `linear-gradient(15deg, ${input.pColor}, ${input.sColor})`
  return returnBgStyle ? { image: img, bgStyle: style } : { image: img, bgStyle: '' }
}

export function calcImageIndex(index: number, imgCounts: number): number {
  if (index >= 0) {
    return index % imgCounts
  } else {
    return (imgCounts + (index % imgCounts)) % imgCounts
  }
}

export function preloadImage(src: string): void {
  const cache = new Image()
  cache.src = src
}

export const getDeviceType = (): deviceType => {
  const ua: string = navigator.userAgent
  const result: deviceType = { mobile: false, tablet: false, desktop: false }
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    result.mobile = true
    result.tablet = true
  } else if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    result.mobile = true
  } else result.desktop = true
  return result
}
