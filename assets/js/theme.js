const imagesArray = JSON.parse(document.getElementById('images_array').textContent).sort((a, b) => {
  if (a.index < b.index) {
    return -1
  }
  return 1
})

const imagesArrayLen = imagesArray.length

const thresholdNum = document.getElementsByClassName('thid')

const threshold = [0, 40, 80, 120, 160, 200]

const thresholdSensitivity = [100, 40, 18, 14, 9, 5]

const r = document.querySelector(':root')

const posXArray = ['0px', '0px', '0px', '0px', '0px']

const posYArray = ['0px', '0px', '0px', '0px', '0px']

const layer5 = document.getElementById('layer5')
const layer4 = document.getElementById('layer4')
const layer3 = document.getElementById('layer3')
const layer2 = document.getElementById('layer2')
const layer1 = document.getElementById('layer1')

let thresholdIndex = 2

let globalIndex = 0

let last = { x: 0, y: 0 }

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// fulfill space with zero
function duper (num) {
  return ('0000' + num).slice(-4)
}

// threshold display update
function thresholdUpdate () {
  thresholdNum.item(0).innerText = duper(threshold[thresholdIndex])
}

function footerHeightUpdate () {
  if (window.innerWidth > 768) {
    r.style.setProperty('--footer-height', '38px')
  } else {
    r.style.setProperty('--footer-height', '31px')
  }
}

function overlayInit () {
  // largest z index
  document.getElementsByClassName('overlay').item(0).style.zIndex = '7'
}

const numSpan = (numOne, numTwo) => {
  // footer index number display module
  const footerIndex = document.getElementsByClassName('ftid')
  const numOneString = duper(numOne)
  const numTwoString = duper(numTwo)
  for (let i = 0; i <= 7; i++) {
    if (i > 3) {
      footerIndex.item(i).innerText = numTwoString[i - 4]
    } else {
      footerIndex.item(i).innerText = numOneString[i]
    }
  }
}

// initialization
function init () {
  numSpan(0, imagesArrayLen)
  thresholdUpdate()
  footerHeightUpdate()
  // threshold buttons initialization
  document.getElementById('thresholdDec').addEventListener('click', function () {
    if (thresholdIndex > 0) {
      thresholdIndex--
      thresholdUpdate()
    }
  }, { passive: true })

  document.getElementById('thresholdInc').addEventListener('click', function () {
    if (thresholdIndex < 5) {
      thresholdIndex++
      thresholdUpdate()
    }
  }, { passive: true })
}

const center = e => {
  e.style.left = '50%'
  if (window.innerWidth > 768) {
    e.style.top = 'calc((100% - 38px) / 2)'
  } else {
    e.style.top = 'calc((100% - 31px) / 2 + 31px)'
  }
}

const overlayCursor = e => {
  const overlayCursor = document.getElementsByClassName('overlay_cursor').item(0)
  overlayCursor.style.left = `${e.clientX}px`
  overlayCursor.style.top = `${e.clientY}px`
}

const FIFO = element => {
  function layerProcess (layerL, layerH) {
    if (layerL.childElementCount) layerL.removeChild(layerL.lastElementChild)
    if (layerH.childElementCount) layerL.appendChild(layerH.lastElementChild.cloneNode(true))
  }
  layerProcess(layer1, layer2)
  layerProcess(layer2, layer3)
  layerProcess(layer3, layer4)
  layerProcess(layer4, layer5)
  if (layer5.childElementCount) layer5.removeChild(layer5.lastElementChild)
  layer5.appendChild(element)
}

const posCache = (x, y) => {
  // pop element if length surpass limitation
  posXArray.shift()
  posYArray.shift()
  // push new element
  posXArray.push(`${x}px`)
  posYArray.push(`${y}px`)
}

function layersPosSet () {
  function posSet (layer, index) {
    layer.style.left = posXArray[index]
    layer.style.top = posYArray[index]
  }
  posSet(layer5, 4)
  posSet(layer4, 3)
  posSet(layer3, 2)
  posSet(layer2, 1)
  posSet(layer1, 0)
}

// let specified image show
const activate = (index, x, y) => {
  const img = document.createElement('img')
  img.setAttribute('src', imagesArray[index].url)
  img.setAttribute('alt', imagesArray[index].index)
  img.setAttribute('height', imagesArray[index].height)
  img.setAttribute('width', imagesArray[index].width)
  posCache(x, y)
  layersPosSet()
  FIFO(img)
  // top
  layer5.addEventListener('click', () => {
    // stop images animation
    window.removeEventListener('mousemove', handleOnMove)
    // set top image
    center(layer5)
    layer5.dataset.status = 't0'
    layer4.dataset.status = 't1'
    layer3.dataset.status = 't2'
    layer2.dataset.status = 't3'
    layer1.dataset.status = 't4'
    // overlay init
    overlayInit()
    window.addEventListener('mousemove', overlayCursor)
  }, {
    passive: true,
    once: true
  })

  last = { x, y }
}

// absolute distance calculation
const distanceFromLast = (x, y) => {
  return Math.hypot(x - last.x, y - last.y)
}

// move handler
const handleOnMove = e => {
  if (distanceFromLast(e.clientX, e.clientY) > (window.innerWidth / thresholdSensitivity[thresholdIndex])) {
    // images showing array
    const imageIndex = globalIndex % imagesArrayLen
    // show top image and change index
    activate(imageIndex, e.clientX, e.clientY)
    numSpan((imageIndex + 1), imagesArrayLen)
    // self increment
    globalIndex++
  }
}

init()

window.addEventListener('mousemove', handleOnMove)
window.addEventListener('resize', () => {
  const isTop = document.getElementsByClassName('top')
  if (isTop.length) {
    center(isTop.item(0))
  }
  footerHeightUpdate()
})

document.getElementsByClassName('prev_section').item(0).addEventListener('mouseover', () => {
  document.getElementsByClassName('overlay_cursor').item(0).innerText = 'PREV'
})

document.getElementsByClassName('close_section').item(0).addEventListener('click', async function f () {
  document.getElementsByClassName('overlay').item(0).style.zIndex = '-1'
  layersPosSet()
  layer5.dataset.status = 'r0'
  layer4.dataset.status = 'r1'
  layer3.dataset.status = 'r2'
  layer2.dataset.status = 'r3'
  layer1.dataset.status = 'r4'
  await sleep(2500)
  layer5.dataset.status = 'null'
  layer4.dataset.status = 'null'
  layer3.dataset.status = 'null'
  layer2.dataset.status = 'null'
  layer1.dataset.status = 'null'
  window.addEventListener('mousemove', handleOnMove)
})

document.getElementsByClassName('close_section').item(0).addEventListener('mouseover', () => {
  document.getElementsByClassName('overlay_cursor').item(0).innerText = 'CLOSE'
})

document.getElementsByClassName('next_section').item(0).addEventListener('mouseover', () => {
  document.getElementsByClassName('overlay_cursor').item(0).innerText = 'NEXT'
})
