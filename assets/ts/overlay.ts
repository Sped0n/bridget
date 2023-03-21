import {
  delay,
  center,
  createImgElement,
  calcImageIndex,
  FIFO,
  mouseToTransform
} from './utils'
import {
  handleOnMove,
  globalIndex,
  globalIndexDec,
  globalIndexInc,
  topLayerPosSet
} from './desktop'
import { imagesArray, imagesArrayLen } from './dataFetch'
import { imgIndexSpanUpdate } from './indexDisp'
import { overlayCursor, cursorInnerContent, layers } from './elemGen'

// set cursor text
const setCursorText = (text: string): void => {
  cursorInnerContent.innerText = text
}

// overlay cursor event handler
const setTextPos = (e: MouseEvent): void => {
  overlayCursor.style.transform = mouseToTransform(e.clientX, e.clientY, false, true)
}

// disable listeners
const disableListener = (): void => {
  window.removeEventListener('mousemove', handleOverlayMouseMove)
  overlayCursor.removeEventListener('click', handleOverlayClick)
}

// enable overlay
export const overlayEnable = (): void => {
  overlayCursor.style.zIndex = '7'
  setListener()
}

// disable overlay
export const overlayDisable = (): void => {
  overlayCursor.style.zIndex = '-1'
  setCursorText('')
  disableListener()
  // Add back previous self increment of global index (by handleOnMove)
  globalIndexInc()
}

// handle close click
async function handleCloseClick(): Promise<void> {
  overlayDisable()
  topLayerPosSet()
  for (let i: number = 0; i <= 4; i++) {
    layers[i].dataset.status = `r${i}`
  }
  await delay(1700)
  for (let i: number = 0; i <= 4; i++) {
    layers[i].dataset.status = 'null'
  }
  window.addEventListener('mousemove', handleOnMove, { passive: true })
}

const handlePrevClick = (): void => {
  globalIndexDec()
  const imgIndex = calcImageIndex(globalIndex, imagesArrayLen)
  FIFO(createImgElement(imagesArray[imgIndex]), layers, false)
  imgIndexSpanUpdate(imgIndex + 1, imagesArrayLen)
}

const handleNextClick = (): void => {
  globalIndexInc()
  const imgIndex = calcImageIndex(globalIndex, imagesArrayLen)
  FIFO(createImgElement(imagesArray[imgIndex]), layers, false)
  imgIndexSpanUpdate(imgIndex + 1, imagesArrayLen)
}

const handleOverlayMouseMove = (e: MouseEvent): void => {
  setTextPos(e)
  const oneThird: number = Math.round(window.innerWidth / 3)
  if (e.clientX < oneThird) {
    setCursorText('PREV')
    overlayCursor.dataset.status = 'PREV'
  } else if (e.clientX < oneThird * 2) {
    setCursorText('CLOSE')
    overlayCursor.dataset.status = 'CLOSE'
  } else {
    setCursorText('NEXT')
    overlayCursor.dataset.status = 'NEXT'
  }
}
const handleOverlayClick = (): void => {
  switch (overlayCursor.dataset.status) {
    case 'PREV':
      handlePrevClick()
      break
    case 'CLOSE':
      void handleCloseClick()
      break
    case 'NEXT':
      handleNextClick()
      break
  }
}

// set event listener
const setListener = (): void => {
  window.addEventListener('mousemove', handleOverlayMouseMove, { passive: true })
  overlayCursor.addEventListener('click', handleOverlayClick, { passive: true })
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
      // recenter image (only in overlay)
      if (layers[0].dataset.status === 't0') center(layers[0])
    },
    { passive: true }
  )
}
