import { overlayEnable } from './overlay'
import { posCache, FIFO, layersPosSet, center } from './utils'
import { thresholdSensitivityArray, thresholdIndex } from './thresholdCtl'
import { imgIndexSpanUpdate } from './indexDisp'
import { imagesArrayLen, imagesArray } from './dataFetch'

export interface position {
  x: number
  y: number
}

// get layer divs
const layer5 = document.getElementById('layer5') as HTMLDivElement
const layer4 = document.getElementById('layer4') as HTMLDivElement
const layer3 = document.getElementById('layer3') as HTMLDivElement
const layer2 = document.getElementById('layer2') as HTMLDivElement
const layer1 = document.getElementById('layer1') as HTMLDivElement
export const layers: HTMLDivElement[] = [layer1, layer2, layer3, layer4, layer5]

// layers position caching
export const posArray: string[][] = [
  ['0px', '0px', '0px', '0px', '0px'],
  ['0px', '0px', '0px', '0px', '0px']
]

// global index for "activated"
let globalIndex: number = 0

// last position set as "activated"
let last: position = { x: 0, y: 0 }

const activate = (index: number, x: number, y: number): void => {
  const img = document.createElement('img')
  img.setAttribute('src', imagesArray[index].url)
  img.setAttribute('alt', imagesArray[index].index)
  img.setAttribute('height', imagesArray[index].imgH)
  img.setAttribute('width', imagesArray[index].imgW)
  posCache(x, y, posArray)
  layersPosSet(posArray, layers)
  FIFO(img, layers)
  // top
  layer5.addEventListener(
    'click',
    () => {
      // stop images animation
      window.removeEventListener('mousemove', handleOnMove)
      // set top image
      center(layer5)
      layer5.dataset.status = 't0'
      layer4.dataset.status = 't1'
      layer3.dataset.status = 't2'
      layer2.dataset.status = 't3'
      layer1.dataset.status = 't4'
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

const distanceFromLast = (x: number, y: number): number => {
  return Math.hypot(x - last.x, y - last.y)
}

export const handleOnMove = (e: MouseEvent): void => {
  // meet threshold
  if (
    distanceFromLast(e.clientX, e.clientY) >
    window.innerWidth / thresholdSensitivityArray[thresholdIndex]
  ) {
    // images showing array
    const imageIndex = globalIndex % imagesArrayLen
    // show top image and change index
    activate(imageIndex, e.clientX, e.clientY)
    imgIndexSpanUpdate(imageIndex + 1, imagesArrayLen)
    // self increment
    globalIndex++
  }
}

export function trackMouseInit(): void {
  window.addEventListener('mousemove', handleOnMove)
}
