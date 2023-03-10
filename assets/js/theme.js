const images = document.getElementsByClassName('image')

const featuredPicNum = document.body.getAttribute('featuredPicNum')

const thresholdNum = document.getElementsByClassName('thid')

const threshold = [0, 40, 80, 120, 160, 200]

const thresholdSensitivity = [100, 40, 18, 14, 9, 5]

let thresholdIndex = 2

let globalIndex = 0

let last = { x: 0, y: 0 }

// fulfill space with zero
function duper (num) {
  return ('0000' + num).slice(-4)
}

function thresholdUpdate () {
  thresholdNum.item(0).innerText = duper(threshold[thresholdIndex])
}

// footer index number display module
const footerIndex = document.getElementsByClassName('ftid')
const numSpan = (numOne, numTwo) => {
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
  numSpan(0, featuredPicNum)
  thresholdUpdate()
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

// let specified image show
const activate = (image, x, y) => {
  for (const node of document.getElementsByClassName('top')) {
    if (node.classList.contains('top')) {
      node.classList.remove('top')
      node.replaceWith(node.cloneNode(true))
    }
  }
  image.style.left = `${x}px`
  image.style.top = `${y}px`
  image.style.zIndex = '' + globalIndex

  // activate image
  image.classList.remove('inactive')
  image.classList.add('active')
  // set top image
  image.classList.add('top')
  image.addEventListener('click', () => {
    image.style.left = '50%'
    image.style.top = '50%'
    const activeImages = document.getElementsByClassName('active')
    for (let i = 0; i <= 3; i++) {
      activeImages.item(i).classList.add(`trailingImage${4 - i}`)
    }
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
    const imageIndex = globalIndex % images.length
    const lead = images[imageIndex]
    const tail = images[(globalIndex - 5) % images.length]
    // show top image and change index
    activate(lead, e.clientX, e.clientY)
    numSpan((imageIndex + 1), featuredPicNum)
    // hide the image unused
    if (tail) {
      tail.classList.remove('active')
      tail.classList.add('inactive')
    }
    // self increment
    globalIndex++
  }
}

init()

window.onmousemove = e => handleOnMove(e)

window.ontouchmove = e => handleOnMove(e.touches[0])
