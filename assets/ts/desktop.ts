import { overlayEnable } from './overlay'
import {
  type position,
  createImgElement,
  calcImageIndex,
  delay,
  mouseToTransform
} from './utils'
import { thresholdSensitivityArray, thresholdIndex } from './thresholdCtl'
import { imgIndexSpanUpdate } from './indexDisp'
import { imagesArrayLen, imagesArray } from './dataFetch'
import { preloader } from './imageCache'

const imagesDiv = document.getElementsByClassName('images').item(0) as HTMLDivElement

let imagesDivNodes: NodeListOf<HTMLImageElement>

export const desktopImagesInit = (): void => {
  for (let i = 0; i < imagesArrayLen; i++) {
    imagesDiv.appendChild(createImgElement(imagesArray[i]))
  }
  imagesDivNodes = imagesDiv.childNodes as NodeListOf<HTMLImageElement>
}

export const trailingImageIndexes: number[] = []

// layers position caching
export const layersStyleArray: number[][] = [[], []]

// global index for "activated"
export let globalIndex: number = 0

// last position set as "activated"
let last: position = { x: 0, y: 0 }

let EnterOverlayController = new AbortController()

// activate top image
const activate = (index: number, mouseX: number, mouseY: number): void => {
  EnterOverlayController.abort()
  EnterOverlayController = new AbortController()
  trailingImageIndexes.push(index)
  let indexesNum: number = trailingImageIndexes.length
  // push the tail index out and hide the image
  if (indexesNum > 10) {
    imagesDivNodes[trailingImageIndexes.shift() as number].style.display = 'none'
    indexesNum = 10
  }
  // set img position
  imagesDivNodes[index].style.transform = mouseToTransform(mouseX, mouseY, true, true)
  // reset z index
  for (let i = 0; i < indexesNum; i++) {
    imagesDivNodes[trailingImageIndexes[i]].style.zIndex = `${i}`
  }
  imagesDivNodes[index].style.display = 'block'
  imagesDivNodes[index].addEventListener(
    'click',
    () => {
      void enterOverlay()
    },
    {
      passive: true,
      signal: EnterOverlayController.signal
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
  // set top image
  alert('center')
  await delay(2500)
  // Offset previous self increment of global index (by handleOnMove)
  globalIndexDec()
  // overlay init
  overlayEnable()
}

// initialization
export const trackMouseInit = (): void => {
  desktopImagesInit()
  window.addEventListener('mousemove', handleOnMove, { passive: true })
}

export const globalIndexDec = (): void => {
  globalIndex--
  preloader(globalIndex)
}

export const globalIndexInc = (): void => {
  globalIndex++
  preloader(globalIndex)
}
