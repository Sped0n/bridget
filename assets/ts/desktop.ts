import { overlayEnable } from './overlay'
import {
  calcImageIndex,
  center,
  delay,
  mouseToTransform,
  pushIndex,
  type position,
  hideImage
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
// only used in overlay disable, for storing positions temporarily
export let transformCache: string[] = []
// abort controller for enter overlay event listener
let EnterOverlayClickAbCtl = new AbortController()
// stack depth of images array
export let stackDepth: number = 5
export let lastStackDepth: number = 5

export const addEnterOverlayEL = (e: HTMLImageElement): void => {
  EnterOverlayClickAbCtl.abort()
  EnterOverlayClickAbCtl = new AbortController()
  e.addEventListener(
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
}

// activate top image
const activate = (index: number, mouseX: number, mouseY: number): void => {
  addEnterOverlayEL(images[index])
  if (stackDepth !== lastStackDepth) {
    trailingImageIndexes.push(index)
    refreshStack()
    lastStackDepth = stackDepth
  }
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
  for (let i = indexesNum; i > 0; i--) {
    images[trailingImageIndexes[i - 1]].style.zIndex = `${i}`
  }
  images[index].style.visibility = 'visible'
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
  // get index array length
  const indexesNum: number = trailingImageIndexes.length
  for (let i = 0; i < indexesNum; i++) {
    // create image element
    const e: HTMLImageElement = images[trailingImageIndexes[i]]
    // cache images' position
    transformCache.push(e.style.transform)
    // set style for the images
    if (i === indexesNum - 1) {
      e.style.transitionDelay = `${0.1 * i + 0.2}s, ${0.1 * i + 0.2 + 0.5}s`
      e.dataset.status = 'top'
      center(e)
    } else {
      e.style.transitionDelay = `${0.1 * i}s`
      e.dataset.status = 'trail'
    }
  }
  // sleep
  await delay(stackDepth * 100 + 100 + 1000)
  // post process
  for (let i = 0; i < indexesNum; i++) {
    images[trailingImageIndexes[i]].style.transitionDelay = ''
    if (i === indexesNum - 1) {
      images[trailingImageIndexes[i]].dataset.status = 'overlay'
    } else {
      images[trailingImageIndexes[i]].style.visibility = 'hidden'
    }
  }
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

export const setStackDepth = (newStackDepth: number): void => {
  if (stackDepth !== newStackDepth) {
    lastStackDepth = stackDepth
    stackDepth = newStackDepth
  }
}

export const refreshStack = (): void => {
  const l: number = trailingImageIndexes.length
  if (stackDepth < lastStackDepth && l > stackDepth) {
    const times: number = l - stackDepth
    for (let i = 0; i < times; i++)
      hideImage(images[trailingImageIndexes.shift() as number])
  }
}
