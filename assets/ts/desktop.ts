import { overlayEnable } from './overlay'
import {
  calcImageIndex,
  center,
  delay,
  mouseToTransform,
  pushIndex,
  type position
} from './utils'
import { thresholdIndex, thresholdSensitivityArray } from './thresholdCtl'
import { imgIndexSpanUpdate } from './indexDisp'
import { imagesArrayLen } from './dataFetch'
import { imagesDivNodes as images } from './elemGen'

// global index for "activated"
export let globalIndex: number = 0

// last position set as "activated"
let last: position = { x: 0, y: 0 }

export let trailingImageIndexes: number[] = []

export let transformCache: string[] = []

let EnterOverlayClickAbCtl = new AbortController()

export const stackDepth: number = 5

// activate top image
const activate = (index: number, mouseX: number, mouseY: number): void => {
  EnterOverlayClickAbCtl.abort()
  EnterOverlayClickAbCtl = new AbortController()
  const indexesNum: number = pushIndex(
    index,
    trailingImageIndexes,
    stackDepth,
    images,
    imagesArrayLen
  )
  // set img position
  images[index].style.transform = mouseToTransform(mouseX, mouseY, true, true)
  images[index].dataset.status = 'null'
  // reset z index
  for (let i = 0; i < indexesNum; i++) {
    images[trailingImageIndexes[i]].style.zIndex = `${i}`
  }
  images[index].style.display = 'block'
  images[index].addEventListener(
    'click',
    () => {
      void enterOverlay()
    },
    {
      passive: true,
      once: true,
      signal: EnterOverlayClickAbCtl.signal
    }
  )
  last = { x: mouseX, y: mouseY }
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
  const indexesNum: number = trailingImageIndexes.length
  for (let i = 0; i < indexesNum; i++) {
    const e: HTMLImageElement = images[trailingImageIndexes[i]]
    transformCache.push(e.style.transform)
    if (i === indexesNum - 1) {
      e.style.transitionDelay = `${0.1 * i + 0.2}s, ${0.1 * i + 0.2 + 0.5}s`
      e.dataset.status = 'top'
      center(e)
    } else {
      e.dataset.status = 'trail'
      e.style.transitionDelay = `${0.1 * i}s`
    }
  }
  await delay(stackDepth * 100 + 100 + 1000)
  // Offset previous self increment of global index (by handleOnMove)
  globalIndexDec()
  // overlay init
  overlayEnable()
}

// initialization
export const trackMouseInit = (): void => {
  window.addEventListener('mousemove', handleOnMove)
}

export const globalIndexDec = (): void => {
  globalIndex--
}

export const globalIndexInc = (): void => {
  globalIndex++
}

export const emptyTransformCache = (): void => {
  transformCache = []
}

export const emptyTrailingImageIndexes = (): void => {
  trailingImageIndexes = []
}
