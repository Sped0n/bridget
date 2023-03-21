// get components of overlay
export let overlayCursor: HTMLDivElement
export let cursorInnerContent: HTMLDivElement
export let layers: HTMLDivElement[]

const passDesktopElements = (): void => {
  overlayCursor = document
    .getElementsByClassName('overlay_cursor')
    .item(0) as HTMLDivElement
  cursorInnerContent = document
    .getElementsByClassName('cursor_innerText')
    .item(0) as HTMLDivElement
  layers = [
    document.getElementById('layer1') as HTMLDivElement,
    document.getElementById('layer2') as HTMLDivElement,
    document.getElementById('layer3') as HTMLDivElement,
    document.getElementById('layer4') as HTMLDivElement,
    document.getElementById('layer5') as HTMLDivElement
  ]
}

const createLayerDiv = (layerID: number): HTMLDivElement => {
  const layerDiv: HTMLDivElement = document.createElement('div')
  layerDiv.className = 'image_container'
  layerDiv.id = `layer${layerID}`
  layerDiv.dataset.status = 'null'
  return layerDiv
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
  const desktopWrapper: HTMLDivElement = document.createElement('div')
  desktopWrapper.className = 'desktopWrapper'
  for (let i = 0; i < 15; i++) {
    desktopWrapper.appendChild(createLayerDiv(i))
  }
  mainDiv.appendChild(desktopWrapper)
  passDesktopElements()
}
