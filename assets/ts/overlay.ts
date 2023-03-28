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
  overlayCursor.style.zIndex = '21'
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
  // get length of indexes and empty indexes array
  const indexesNum = trailingImageIndexes.length
  emptyTrailingImageIndexes()
  // prepare animation
  for (let i: number = 0; i < indexesNum; i++) {
    // get element from index and store the index
    const index: number = calcImageIndex(globalIndex - i, imagesArrayLen)
    const e: HTMLImageElement = images[index]
    trailingImageIndexes.unshift(index)
    // set z index for the image element
    e.style.zIndex = `${indexesNum - i - 1}`
    // set different style for trailing and top image
    if (i === 0) {
      // set position
      e.style.transform = transformCache[indexesNum - i - 1]
      // set transition delay
      e.style.transitionDelay = '0s, 0.7s'
      // set status for css
      e.dataset.status = 'resumeTop'
    } else {
      // set position
      e.style.transform = transformCache[indexesNum - i - 1]
      // set transition delay
      e.style.transitionDelay = `${1.2 + 0.1 * i - 0.1}s`
      // set status for css
      e.dataset.status = 'resume'
    }
    // style process complete, show the image
    e.style.visibility = 'visible'
  }
  // halt the function while animation is running
  await delay(1200 + stackDepth * 100 + 100)
  // add back enter overlay event listener to top image
  addEnterOverlayEL(images[calcImageIndex(globalIndex, imagesArrayLen)])
  // clear unused status and transition delay
  for (let i: number = 0; i < indexesNum; i++) {
    const index: number = calcImageIndex(globalIndex - i, imagesArrayLen)
    images[index].dataset.status = 'null'
    images[index].style.transitionDelay = ''
  }
  // Add back previous self increment of global index (by handleOnMove)
  globalIndexInc()
  // add back mousemove event listener
  window.addEventListener('mousemove', handleOnMove, { passive: true })
  // empty the position array cache
  emptyTransformCache()
}

const handleSideClick = (CLD: boolean): void => {
  // get last displayed image's index
  const imgIndex: number = calcImageIndex(globalIndex, imagesArrayLen)
  // change global index and get current displayed image's index
  CLD ? globalIndexInc() : globalIndexDec()
  const currImgIndex: number = calcImageIndex(globalIndex, imagesArrayLen)
  // store current displayed image's index
  CLD
    ? pushIndex(
        currImgIndex,
        trailingImageIndexes,
        stackDepth,
        images,
        imagesArrayLen,
        false,
        false
      )
    : pushIndex(
        currImgIndex,
        trailingImageIndexes,
        stackDepth,
        images,
        imagesArrayLen,
        true,
        false
      )
  // hide last displayed image
  images[imgIndex].style.visibility = 'hidden'
  images[imgIndex].dataset.status = 'trail'
  // process the image going to display
  center(images[currImgIndex])
  images[currImgIndex].dataset.status = 'overlay'
  // process complete, show the image
  images[currImgIndex].style.visibility = 'visible'
  // change index display
  imgIndexSpanUpdate(currImgIndex + 1, imagesArrayLen)
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
      handleSideClick(false)
      break
    case 'CLOSE':
      void handleCloseClick()
      break
    case 'NEXT':
      handleSideClick(true)
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
      if (
        images[calcImageIndex(globalIndex, imagesArrayLen)].dataset.status === 'overlay'
      )
        center(images[calcImageIndex(globalIndex, imagesArrayLen)])
    },
    { passive: true }
  )
}
