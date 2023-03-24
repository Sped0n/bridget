import { delay, center, calcImageIndex, mouseToTransform } from './utils'
import {
  handleOnMove,
  globalIndex,
  globalIndexDec,
  globalIndexInc,
  trailingImageIndexes,
  transformCache,
  pushIndex,
  emptyTransformCache,
  emptyTrailingImageIndexes
} from './desktop'
import { imagesArrayLen } from './dataFetch'
import { imgIndexSpanUpdate } from './indexDisp'
import { overlayCursor, cursorInnerContent, imagesDivNodes as images } from './elemGen'

let oneThird: number = Math.round(window.innerWidth / 3)

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
  overlayCursor.style.zIndex = '100'
  setListener()
}

// disable overlay
export const overlayDisable = (): void => {
  overlayCursor.style.zIndex = '-1'
  setCursorText('')
  disableListener()
}

// handle close click
async function handleCloseClick(): Promise<void> {
  overlayDisable()
  const indexesNum = trailingImageIndexes.length
  emptyTrailingImageIndexes()
  for (let i: number = 0; i < indexesNum; i++) {
    const e: HTMLImageElement = images[calcImageIndex(globalIndex - i, imagesArrayLen)]
    trailingImageIndexes.unshift(calcImageIndex(globalIndex - i, imagesArrayLen))
    if (i === 0) {
      e.style.transitionDelay = '0s, 0.7s'
    } else {
      e.style.transitionDelay = `${1.2 + 0.1 * i - 0.1}s`
      e.style.display = 'block'
    }
    e.style.transform = transformCache[indexesNum - i - 1]
    e.style.zIndex = `${indexesNum - i - 1}`
    e.dataset.status = i === 0 ? 'resumeTop' : 'resume'
  }
  await delay(1700)
  for (let i: number = 0; i < indexesNum; i++) {
    images[calcImageIndex(globalIndex - i, imagesArrayLen)].dataset.status = 'null'
  }
  // Add back previous self increment of global index (by handleOnMove)
  globalIndexInc()
  window.addEventListener('mousemove', handleOnMove, { passive: true })
  emptyTransformCache()
}

const handlePrevClick = (): void => {
  const imgIndex: number = calcImageIndex(globalIndex, imagesArrayLen)
  globalIndexDec()
  const prevImgIndex = calcImageIndex(globalIndex, imagesArrayLen)
  pushIndex(prevImgIndex, true, false)
  images[imgIndex].style.display = 'none'
  center(images[prevImgIndex])
  images[prevImgIndex].dataset.status = 'top'
  images[prevImgIndex].style.display = 'block'
  imgIndexSpanUpdate(prevImgIndex + 1, imagesArrayLen)
}

const handleNextClick = (): void => {
  const imgIndex: number = calcImageIndex(globalIndex, imagesArrayLen)
  globalIndexInc()
  const nextImgIndex = calcImageIndex(globalIndex, imagesArrayLen)
  pushIndex(nextImgIndex, false, false)
  images[imgIndex].style.display = 'none'
  center(images[nextImgIndex])
  images[nextImgIndex].dataset.status = 'top'
  images[nextImgIndex].style.display = 'block'
  imgIndexSpanUpdate(nextImgIndex + 1, imagesArrayLen)
}

const handleOverlayMouseMove = (e: MouseEvent): void => {
  setTextPos(e)
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
      oneThird = Math.round(window.innerWidth / 3)
      // reset footer height
      const r = document.querySelector(':root') as HTMLStyleElement
      if (window.innerWidth > 768) {
        r.style.setProperty('--footer-height', '38px')
      } else {
        r.style.setProperty('--footer-height', '31px')
      }
      // recenter image (only in overlay)
      const i: HTMLImageElement = images[calcImageIndex(globalIndex, imagesArrayLen)]
      if (i.dataset.status === 'top') center(i)
    },
    { passive: true }
  )
}
