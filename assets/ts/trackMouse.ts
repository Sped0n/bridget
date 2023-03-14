import { overlayEnable } from './overlay'
import {
  posCache,
  FIFO,
  layersPosSet,
  center,
  type position,
  createImgElement,
  calcImageIndex
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
export const posArray: string[][] = [
  ['0px', '0px', '0px', '0px', '0px'],
  ['0px', '0px', '0px', '0px', '0px']
]

// global index for "activated"
export let globalIndex: number = 0

// last position set as "activated"
let last: position = { x: 0, y: 0 }

// activate top image
const activate = (index: number, x: number, y: number): void => {
  posCache(x, y, posArray)
  layersPosSet(posArray, layers)
  FIFO(createImgElement(imagesArray[index]), layers)
  // top
  layers[4].addEventListener(
    'click',
    () => {
      // stop images animation
      window.removeEventListener('mousemove', handleOnMove)
      // set top image
      center(layers[4])
      for (let i = 4; i >= 0; i--) {
        layers[i].dataset.status = `t${4 - i}`
      }
      // overlay init
      overlayEnable()
    },
    {
      passive: true,
      once: true
    }
  )

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
    globalIndex++
  }
}

// initialization
export function trackMouseInit(): void {
  window.addEventListener('mousemove', handleOnMove)
}
