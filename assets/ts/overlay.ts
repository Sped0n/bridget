import { delay, removeAllEventListeners, layersPosSet } from './utils'
import { posArray, layers, handleOnMove } from './trackMouse'

// get components of overlay
const overlay = document.getElementsByClassName('overlay').item(0) as HTMLDivElement
let closeSection = document.getElementsByClassName('close_section').item(0) as Node
let prevSection = document.getElementsByClassName('prev_section').item(0) as Node
let nextSection = document.getElementsByClassName('next_section').item(0) as Node
const cursor = document
  .getElementsByClassName('overlay_cursor')
  .item(0) as HTMLDivElement

// set cursor text
function setCursorText(text: string): void {
  cursor.innerText = text
}

// overlay cursor event handler
const overlayCursor = (e: MouseEvent): void => {
  cursor.style.left = `${e.clientX}px`
  cursor.style.top = `${e.clientY}px`
}

function disableListener(): void {
  window.removeEventListener('mousemove', overlayCursor)
  closeSection = removeAllEventListeners(closeSection)
  prevSection = removeAllEventListeners(prevSection)
  nextSection = removeAllEventListeners(nextSection)
}

export function overlayEnable(): void {
  overlay.style.zIndex = '7'
  setListener()
}

export function overlayDisable(): void {
  overlay.style.zIndex = '-1'
  setCursorText('')
  disableListener()
}

async function handleCloseClick(): Promise<void> {
  overlayDisable()
  layersPosSet(posArray, layers)
  for (let i: number = 4; i >= 0; i--) {
    layers[i].dataset.status = `r${4 - i}`
  }
  await delay(2500)
  for (let i: number = 4; i >= 0; i--) {
    layers[i].dataset.status = 'null'
  }
  window.addEventListener('mousemove', handleOnMove)
}

// set hover event listener
function setListener(): void {
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
  nextSection.addEventListener(
    'mouseover',
    () => {
      setCursorText('NEXT')
    },
    { passive: true }
  )
}
