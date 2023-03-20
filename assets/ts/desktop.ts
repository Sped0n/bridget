import { overlayEnable } from './overlay'
import {
  FIFO,
  layerPosSet,
  center,
  type position,
  createImgElement,
  calcImageIndex,
  delay
} from './utils'
import { thresholdSensitivityArray, thresholdIndex } from './thresholdCtl'
import { imgIndexSpanUpdate } from './indexDisp'
import { imagesArrayLen, imagesArray } from './dataFetch'

// get layer divs
export const layers: HTMLDivElement[] = [
  document.getElementById('layer1') as HTMLDivElement,
  document.getElementById('layer2') as HTMLDivElement,
  document.getElementById('layer3') as HTMLDivElement,
  document.getElementById('layer4') as HTMLDivElement,
  document.getElementById('layer5') as HTMLDivElement
]

// layers position caching
let topLayerPos: number[] = [0, 0]

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
