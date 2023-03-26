import { delay, center, calcImageIndex, mouseToTransform, pushIndex } from './utils'
import {
  handleOnMove,
  globalIndex,
  globalIndexDec,
  globalIndexInc,
  trailingImageIndexes,
  transformCache,
  emptyTransformCache,
  emptyTrailingImageIndexes,
  stackDepth,
  addEnterOverlayEL
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
  // show the overlay components
  overlayCursor.style.zIndex = '100'
  // set overlay event listeners
  setListener()
}

// disable overlay
export const overlayDisable = (): void => {
  // hide the overlay components
  overlayCursor.style.zIndex = '-1'
  // set overlay cursor text content to none
  setCursorText('')
  // disable overlay event listeners
  disableListener()
}

// handle close click
async function handleCloseClick(): Promise<void> {
  // disable overlay
  overlayDisable()
  const indexesNum = trailingImageIndexes.length
  // empty trail images indexes
  emptyTrailingImageIndexes()
  for (let i: number = 0; i < indexesNum; i++) {
    // get element from index and store the index
    const index: number = calcImageIndex(globalIndex - i, imagesArrayLen)
    const e: HTMLImageElement = images[index]
    trailingImageIndexes.unshift(index)
    e.style.display = 'block'
    e.style.zIndex = `${indexesNum - i - 1}`
    // set different style for trailing and top image
    if (i === 0) {
      e.style.transitionDelay = '0s, 0.7s'
      e.dataset.status = 'resumeTop'
      e.style.transform = transformCache[indexesNum - i - 1]
    } else {
      e.style.transform = transformCache[indexesNum - i - 1]
      // e.style.transitionDelay = `${1.2 + 0.1 * i - 0.1}s`
      e.style.transitionDelay = '1.5s'
      e.dataset.status = 'resume'
    }
  }
  // halt the function while animation is running
  await delay(1200 + stackDepth * 100 + 100)
  // add back enter overlay event listener to top image
  addEnterOverlayEL(images[calcImageIndex(globalIndex, imagesArrayLen)])
  for (let i: number = 0; i < indexesNum; i++) {
    images[calcImageIndex(globalIndex - i, imagesArrayLen)].dataset.status = 'null'
  }
  // Add back previous self increment of global index (by handleOnMove)
  globalIndexInc()
  window.addEventListener('mousemove', handleOnMove, { passive: true })
  emptyTransformCache()
}

const handlePrevClick = (): void => {
  // get last displayed image's index
  const imgIndex: number = calcImageIndex(globalIndex, imagesArrayLen)
  // change global index and get current displayed image's index
  globalIndexDec()
  const prevImgIndex: number = calcImageIndex(globalIndex, imagesArrayLen)
  // store current displayed image's index
  pushIndex(
    prevImgIndex,
    trailingImageIndexes,
    stackDepth,
    images,
    imagesArrayLen,
    true,
    false
  )
  // hide last displayed image
  images[imgIndex].style.display = 'none'
  images[imgIndex].dataset.status = 'trail'
  center(images[prevImgIndex])
  images[prevImgIndex].dataset.status = 'top'
  // process complete, show the image
  images[prevImgIndex].style.display = 'block'
  // change index display
  imgIndexSpanUpdate(prevImgIndex + 1, imagesArrayLen)
}

const handleNextClick = (): void => {
  // get last displayed image's index
  const imgIndex: number = calcImageIndex(globalIndex, imagesArrayLen)
  // change global index and get current displayed image's index
  globalIndexInc()
  const nextImgIndex: number = calcImageIndex(globalIndex, imagesArrayLen)
  // store current displayed image's index
  pushIndex(
    nextImgIndex,
    trailingImageIndexes,
    stackDepth,
    images,
    imagesArrayLen,
    false,
    false
  )
  // hide last displayed image
  images[imgIndex].style.display = 'none'
  images[imgIndex].dataset.status = 'trail'
  // process the image going to display
  center(images[nextImgIndex])
  images[nextImgIndex].dataset.status = 'top'
  // process complete, show the image
  images[nextImgIndex].style.display = 'block'
  // change index display
  imgIndexSpanUpdate(nextImgIndex + 1, imagesArrayLen)
}

// change text and position of overlay cursor
const handleOverlayMouseMove = (e: MouseEvent): void => {
  // set text position
  setTextPos(e)
  // set text content
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
  // add mouse move event listener (for overlay text cursor)
  window.addEventListener('mousemove', handleOverlayMouseMove, { passive: true })
  // add close/prev/next click event listener
  overlayCursor.addEventListener('click', handleOverlayClick, { passive: true })
}

export const vwRefreshInit = (): void => {
  window.addEventListener(
    'resize',
    () => {
      // refresh value of one third
      oneThird = Math.round(window.innerWidth / 3)
      // reset footer height
      const r = document.querySelector(':root') as HTMLStyleElement
      if (window.innerWidth > 768) {
        r.style.setProperty('--footer-height', '38px')
      } else {
        r.style.setProperty('--footer-height', '31px')
      }
      // recenter image (only in overlay)
      if (images[calcImageIndex(globalIndex, imagesArrayLen)].dataset.status === 'top')
        center(images[calcImageIndex(globalIndex, imagesArrayLen)])
    },
    { passive: true }
  )
}
