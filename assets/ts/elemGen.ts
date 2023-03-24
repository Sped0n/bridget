import { imagesArray, imagesArrayLen } from './dataFetch'
import { createImgElement } from './utils'

// get components of overlay
export let overlayCursor: HTMLDivElement
export let cursorInnerContent: HTMLDivElement
export let imagesDivNodes: NodeListOf<HTMLImageElement>

const passDesktopElements = (): void => {
  overlayCursor = document
    .getElementsByClassName('overlay_cursor')
    .item(0) as HTMLDivElement
  cursorInnerContent = document
    .getElementsByClassName('cursor_innerText')
    .item(0) as HTMLDivElement
  imagesDivNodes = document.getElementsByClassName('images')[0]
    .childNodes as NodeListOf<HTMLImageElement>
}

const createCursorDiv = (): HTMLDivElement => {
  const cursorDiv: HTMLDivElement = document.createElement('div')
  cursorDiv.className = 'overlay_cursor'
  const innerTextDiv: HTMLDivElement = document.createElement('div')
  innerTextDiv.className = 'cursor_innerText'
  cursorDiv.appendChild(innerTextDiv)
  return cursorDiv
}

export const createDesktopElements = (): void => {
  const mainDiv = document.getElementById('main') as HTMLDivElement
  mainDiv.appendChild(createCursorDiv())
  const imagesDiv: HTMLDivElement = document.createElement('div')
  imagesDiv.className = 'images'
  for (let i = 0; i < imagesArrayLen; i++) {
    imagesDiv.appendChild(createImgElement(imagesArray[i]))
  }
  mainDiv.appendChild(imagesDiv)
  passDesktopElements()
}
