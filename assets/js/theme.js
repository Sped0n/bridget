const images = document.getElementsByClassName('image')

const featuredPicNum = document.body.getAttribute('featuredPicNum')

let globalIndex = 0
let last = { x: 0, y: 0 }

function duper (num) {
  return ('0000' + num).slice(-4)
}

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

numSpan(0, featuredPicNum)

const activate = (image, x, y) => {
  image.style.left = `${x}px`
  image.style.top = `${y}px`
  image.style.zIndex = '' + globalIndex

  image.dataset.status = 'active'

  last = { x, y }
}

const distanceFromLast = (x, y) => {
  return Math.hypot(x - last.x, y - last.y)
}

const handleOnMove = e => {
  if (distanceFromLast(e.clientX, e.clientY) > (window.innerWidth / 20)) {
    const imageIndex = globalIndex % images.length

    const lead = images[imageIndex]
    const tail = images[(globalIndex - 5) % images.length]

    activate(lead, e.clientX, e.clientY)

    numSpan((imageIndex + 1), featuredPicNum)

    console.log(imageIndex + ' /' + featuredPicNum)

    if (tail) tail.dataset.status = 'inactive'

    globalIndex++
  }
}

window.onmousemove = e => handleOnMove(e)

window.ontouchmove = e => handleOnMove(e.touches[0])
