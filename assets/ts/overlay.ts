import {
  delay,
  removeAllEventListeners,
  layersStyleSet,
  center,
  createImgElement,
  calcImageIndex,
  FIFO
} from './utils'
import {
  layersStyleArray,
  layers,
  handleOnMove,
  globalIndex,
  globalIndexDec,
  globalIndexInc
} from './desktop'
import { imagesArray, imagesArrayLen } from './dataFetch'
import { imgIndexSpanUpdate } from './indexDisp'

// get components of overlay
const overlay = document.getElementsByClassName('overlay').item(0) as HTMLDivElement
let closeSection = document.getElementsByClassName('close_section').item(0) as Node
let prevSection = document.getElementsByClassName('prev_section').item(0) as Node
let nextSection = document.getElementsByClassName('next_section').item(0) as Node
const cursor = document
  .getElementsByClassName('overlay_cursor')
  .item(0) as HTMLDivElement

// set cursor text
const setCursorText = (text: string): void => {
  cursor.innerText = text
}

// overlay cursor event handler
const overlayCursor = (e: MouseEvent): void => {
  cursor.style.left = `${e.clientX}px`
  cursor.style.top = `${e.clientY}px`
}

// disable listeners
const disableListener = (): void => {
  window.removeEventListener('mousemove', overlayCursor)
  closeSection = removeAllEventListeners(closeSection)
  prevSection = removeAllEventListeners(prevSection)
  nextSection = removeAllEventListeners(nextSection)
}

// enable overlay
export const overlayEnable = (): void => {
  overlay.style.zIndex = '7'
  setListener()
}

// disable overlay
export const overlayDisable = (): void => {
  overlay.style.zIndex = '-1'
  setCursorText('')
  disableListener()
  // Add back previous self increment of global index (by handleOnMove)
  globalIndexInc()
}

// handle close click
async function handleCloseClick(): Promise<void> {
  overlayDisable()
  layersStyleSet(layersStyleArray, layers, true, false)
  for (let i: number = 4; i >= 0; i--) {
    layers[i].dataset.status = `r${4 - i}`
  }
  await delay(2500)
  for (let i: number = 4; i >= 0; i--) {
    layers[i].dataset.status = 'null'
  }
  layersStyleSet(layersStyleArray, layers, false, true)
  window.addEventListener('mousemove', handleOnMove)
}

const handlePrevClick = (): void => {
  globalIndexDec()
  const imgIndex = calcImageIndex(globalIndex, imagesArrayLen)
  FIFO(createImgElement(imagesArray[imgIndex], false).image, layers)
  imgIndexSpanUpdate(imgIndex + 1, imagesArrayLen)
}

const handleNextClick = (): void => {
  globalIndexInc()
  const imgIndex = calcImageIndex(globalIndex, imagesArrayLen)
  FIFO(createImgElement(imagesArray[imgIndex], false).image, layers)
  imgIndexSpanUpdate(imgIndex + 1, imagesArrayLen)
}

// set event listener
const setListener = (): void => {
  window.addEventListener('mousemove', overlayCursor, { passive: true })
  closeSection.addEventListener(
    'mouseover',
    () => {
      setCursorText('CLOSE')
    },
    { passive: true }
  )
  closeSection.addEventListener(
    'click',
    () => {
      void handleCloseClick()
    },
    { passive: true }
  )
  prevSection.addEventListener(
    'mouseover',
    () => {
      setCursorText('PREV')
    },
    { passive: true }
  )
  prevSection.addEventListener(
    'click',
    () => {
      handlePrevClick()
    },
    { passive: true }
  )
  nextSection.addEventListener(
    'mouseover',
    () => {
      setCursorText('NEXT')
    },
    { passive: true }
  )
  nextSection.addEventListener(
    'click',
    () => {
      handleNextClick()
    },
    { passive: true }
  )
}

export const vwRefreshInit = (): void => {
  window.addEventListener(
    'resize',
    () => {
      // reset footer height
      const r = document.querySelector(':root') as HTMLStyleElement
      if (window.innerWidth > 768) {
        r.style.setProperty('--footer-height', '38px')
      } else {
        r.style.setProperty('--footer-height', '31px')
      }
      // recenter image
      center(layers[4])
    },
    { passive: true }
  )
}
