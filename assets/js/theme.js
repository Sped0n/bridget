const images = document.getElementsByClassName('image_container')

const imagesArray = JSON.parse(document.getElementById('images_array').textContent)

alert(imagesArray.length)

const thresholdNum = document.getElementsByClassName('thid')

const threshold = [0, 40, 80, 120, 160, 200]

const thresholdSensitivity = [100, 40, 18, 14, 9, 5]

const r = document.querySelector(':root')

const activeImageIndexes = []

let thresholdIndex = 2

let globalIndex = 0

let last = { x: 0, y: 0 }

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
  numSpan(0, images.length)
  thresholdUpdate()
  footerHeightUpdate()
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

// let specified image show
const activate = (image, x, y) => {
  // top reset
  Array.from(document.getElementsByClassName('top')).forEach(e => {
    e.classList.remove('top')
    e.replaceWith(e.cloneNode(true))
  })
  // z index reset
  image.style.left = `${x}px`
  image.style.top = `${y}px`
  // activate image
  image.dataset.status = 'active'

  activeImageIndexes.push(globalIndex % images.length)
  if (activeImageIndexes.length > 5) {
    images[activeImageIndexes.shift()].style.zIndex = '-1'
  }
  activeImageIndexes.forEach((e, i) => {
    images[e].style.zIndex = `${i + 1}`
  })
  // top
  image.addEventListener('click', () => {
    // stop images animation
    window.removeEventListener('mousemove', handleOnMove)
    // set top image
    image.classList.add('top')
    center(image)
    // set tailing images
    activeImageIndexes.forEach((e, i) => {
      const activeImageNum = activeImageIndexes.length
      if (i < 4) {
        images[e].classList.add(`trailingImage${activeImageNum - 1 - i}`)
      }
      images[e].classList.replace('active', 'resume')
    })
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
    const imageIndex = globalIndex % images.length
    const lead = images[imageIndex]
    const tail = images[(globalIndex - 5) % images.length]
    // show top image and change index
    activate(lead, e.clientX, e.clientY)
    numSpan((imageIndex + 1), images.length)
    // hide the image unused
    if (tail) {
      tail.dataset.status = 'inactive'
    }
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

document.getElementsByClassName('close_section').item(0).addEventListener('click', () => {
  document.getElementsByClassName('overlay').item(0).style.zIndex = '-1'
  document.getElementsByClassName('top').item(0).classList.remove('top')
  document.getElementsByClassName('trailingImage4').item(0).classList.remove('trailingImage4')
  document.getElementsByClassName('trailingImage3').item(0).classList.remove('trailingImage3')
  document.getElementsByClassName('trailingImage2').item(0).classList.remove('trailingImage2')
  document.getElementsByClassName('trailingImage1').item(0).classList.remove('trailingImage1')
  window.addEventListener('mousemove', handleOnMove)
})

document.getElementsByClassName('close_section').item(0).addEventListener('mouseover', () => {
  document.getElementsByClassName('overlay_cursor').item(0).innerText = 'CLOSE'
})

document.getElementsByClassName('next_section').item(0).addEventListener('mouseover', () => {
  document.getElementsByClassName('overlay_cursor').item(0).innerText = 'NEXT'
})
