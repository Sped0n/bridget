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

export interface deviceType {
  mobile: boolean
  tablet: boolean
  desktop: boolean
}

// 0 to 0001, 25 to 0025
export const duper = (num: number): string => {
  return ('0000' + num.toString()).slice(-4)
}

export const mouseToTransform = (
  x: number,
  y: number,
  centerCorrection: boolean = true,
  accelerate: boolean = false
): string => {
  return `translate${accelerate ? '3d' : ''}(${
    centerCorrection ? `calc(${x}px - 50%)` : `${x}px`
  }, ${centerCorrection ? `calc(${y}px - 50%)` : `${y}px`}${accelerate ? ', 0' : ''})`
}

// eslint-disable-next-line @typescript-eslint/promise-function-async
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// remove all event listeners from a node
export const removeAllEventListeners = (e: Node): Node => {
  return e.cloneNode(true)
}

// center top div
export const center = (e: HTMLDivElement): void => {
  const x: number = window.innerWidth / 2
  let y: number
  if (window.innerWidth > 768) {
    y = (window.innerHeight - 38) / 2
  } else {
    y = (window.innerHeight - 31) / 2 + 31
  }
  e.style.transform = mouseToTransform(x, y)
}

export const createImgElement = (input: ImageData): HTMLImageElement => {
  const img = document.createElement('img')
  img.setAttribute('src', input.url)
  img.setAttribute('alt', '')
  img.setAttribute('height', input.imgH)
  img.setAttribute('width', input.imgW)
  img.style.display = 'none'
  return img
}

export const calcImageIndex = (index: number, imgCounts: number): number => {
  if (index >= 0) {
    return index % imgCounts
  } else {
    return (imgCounts + (index % imgCounts)) % imgCounts
  }
}

export const preloadImage = (src: string): void => {
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
