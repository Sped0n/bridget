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
  footerIndex.item(0).innerText = numOneString[0]
  footerIndex.item(1).innerText = numOneString[1]
  footerIndex.item(2).innerText = numOneString[2]
  footerIndex.item(3).innerText = numOneString[3]
  footerIndex.item(4).innerText = numTwoString[0]
  footerIndex.item(5).innerText = numTwoString[1]
  footerIndex.item(6).innerText = numTwoString[2]
  footerIndex.item(7).innerText = numTwoString[3]
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
  image.style.left = `${x}px`
  image.style.top = `${y}px`
  image.style.zIndex = '' + globalIndex

  image.dataset.status = 'active'

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
    if (tail) tail.dataset.status = 'inactive'
    // self increment
    globalIndex++
  }
}

init()

window.onmousemove = e => handleOnMove(e)

window.ontouchmove = e => handleOnMove(e.touches[0])
