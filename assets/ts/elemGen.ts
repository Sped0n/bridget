import { imagesArray, imagesArrayLen } from './dataFetch'
import { createImgElement } from './utils'

// get components of overlay
export let overlayCursor: HTMLDivElement
export let cursorInnerContent: HTMLDivElement
export let imagesDivNodes: NodeListOf<HTMLImageElement>

const mainDiv = document.getElementById('main') as HTMLDivElement

const passDesktopElements = (): void => {
  overlayCursor = document
    .getElementsByClassName('overlay_cursor')
    .item(0) as HTMLDivElement
  cursorInnerContent = document
    .getElementsByClassName('cursor_innerText')
    .item(0) as HTMLDivElement
  imagesDivNodes = document.getElementsByClassName('imagesDesktop')[0]
    .childNodes as NodeListOf<HTMLImageElement>
}

const passMobileElements = (): void => {
  imagesDivNodes = document.getElementsByClassName('imagesMobile')[0]
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
  mainDiv.appendChild(createCursorDiv())
  const imagesDiv: HTMLDivElement = document.createElement('div')
  imagesDiv.className = 'imagesDesktop'
  for (let i = 0; i < imagesArrayLen; i++) {
    imagesDiv.appendChild(createImgElement(imagesArray[i]))
  }
  mainDiv.appendChild(imagesDiv)
  passDesktopElements()
}

export const createMobileElements = (): void => {
  const imagesDiv: HTMLDivElement = document.createElement('div')
  imagesDiv.className = 'imagesMobile'
  for (let i = 0; i < imagesArrayLen; i++) {
    imagesDiv.appendChild(createImgElement(imagesArray[i]))
  }
  mainDiv.appendChild(imagesDiv)
  passMobileElements()
}
