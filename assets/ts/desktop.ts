import { overlayEnable } from './overlay'
import {
  calcImageIndex,
  center,
  createImgElement,
  delay,
  FIFO,
  layerPosSet,
  type position
} from './utils'
import { thresholdIndex, thresholdSensitivityArray } from './thresholdCtl'
import { imgIndexSpanUpdate } from './indexDisp'
import { imagesArray, imagesArrayLen } from './dataFetch'
import { layers } from './elemGen'

// top layer position caching
let topLayerPos: number[] = [0, 0]

// set top layer position
export const topLayerPosSet = (): void => {
  layerPosSet(topLayerPos[0], topLayerPos[1], layers[4])
}

// global index for "activated"
export let globalIndex: number = 0

// last position set as "activated"
let last: position = { x: 0, y: 0 }

// activate top image
const activate = (index: number, x: number, y: number): void => {
  const imgElem: HTMLImageElement = createImgElement(imagesArray[index])
  topLayerPos = [x, y]
  FIFO(imgElem, layers, true)
  topLayerPosSet()
  last = { x, y }
}

// Compare the current mouse position with the last activated position
const distanceFromLast = (x: number, y: number): number => {
  return Math.hypot(x - last.x, y - last.y)
}

// handle mouse move
export const handleOnMove = (e: MouseEvent): void => {
  // meet threshold
  if (
    distanceFromLast(e.clientX, e.clientY) >
    window.innerWidth / thresholdSensitivityArray[thresholdIndex]
  ) {
    // calculate the actual index
    const imageIndex = calcImageIndex(globalIndex, imagesArrayLen)
    // show top image and change index
    activate(imageIndex, e.clientX, e.clientY)
    imgIndexSpanUpdate(imageIndex + 1, imagesArrayLen)
    // self increment
    globalIndexInc()
  }
}

async function enterOverlay(): Promise<void> {
  // stop images animation
  window.removeEventListener('mousemove', handleOnMove)
  // set top image
  center(layers[4])
  for (let i = 4; i >= 0; i--) {
    layers[i].dataset.status = `t${4 - i}`
  }
  await delay(1600)
  // Offset previous self increment of global index (by handleOnMove)
  globalIndexDec()
  // overlay init
  overlayEnable()
}

// initialization
export const trackMouseInit = (): void => {
  window.addEventListener('mousemove', handleOnMove)
  layers[4].addEventListener(
    'click',
    () => {
      void enterOverlay()
    },
    {
      passive: true
    }
  )
}

export const globalIndexDec = (): void => {
  globalIndex--
}

export const globalIndexInc = (): void => {
  globalIndex++
}
