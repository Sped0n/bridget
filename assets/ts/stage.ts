import { incIndex, getState } from './state'
import { gsap, Power3 } from 'gsap'
import { ImageJSON } from './resources'

export type HistoryItem = { i: number; x: number; y: number }

let imgs: HTMLImageElement[] = []

class CordHist {
  private obj: HistoryItem[] = []

  get(): HistoryItem[] {
    return this.obj
  }

  set(e: HistoryItem[]): void {
    this.obj = e
    setPositions()
  }
}

class IsOpen {
  private obj = false

  get(): boolean {
    return this.obj
  }

  set(e: boolean): void {
    this.obj = e
    activeCallbacks.forEach((callback) => callback(getActive()))
  }
}

let last = { x: 0, y: 0 }
export let cordHist = new CordHist()
export let isOpen = new IsOpen()
let isAnimating = false
let activeCallbacks: ((active: boolean) => void)[] = []

// getter

function getElTrail(): HTMLImageElement[] {
  return cordHist.get().map((item) => imgs[item.i])
}

function getElTrailCurrent(): HTMLImageElement[] {
  return getElTrail().slice(-getState().trailLength)
}

function getElTrailInactive(): HTMLImageElement[] {
  const elTrailCurrent = getElTrailCurrent()
  return elTrailCurrent.slice(0, elTrailCurrent.length - 1)
}

function getElCurrent(): HTMLImageElement {
  const elTrail = getElTrail()
  return elTrail[elTrail.length - 1]
}

export function getIsAnimating(): boolean {
  return isAnimating
}

export function getActive(): boolean {
  return isOpen.get() && !getIsAnimating()
}

// setter

export function addActiveCallback(callback: (active: boolean) => void): void {
  activeCallbacks.push(callback)
}

export function setIsAnimating(e: boolean): void {
  isAnimating = e
  activeCallbacks.forEach((callback) => callback(getActive()))
}

// main functions

// on mouse
function onMouse(e: MouseEvent): void {
  if (isOpen.get() || getIsAnimating()) return
  const cord = { x: e.clientX, y: e.clientY }
  const travelDist = Math.hypot(cord.x - last.x, cord.y - last.y)

  if (travelDist > getState().threshold) {
    last = cord
    incIndex()

    const newHist = { i: getState().index, ...cord }
    cordHist.set([...cordHist.get(), newHist].slice(-getState().length))
  }
}

// set image position with gsap
function setPositions(): void {
  const elTrail = getElTrail()
  if (!elTrail.length) return

  gsap.set(elTrail, {
    x: (i: number) => cordHist.get()[i].x - window.innerWidth / 2,
    y: (i: number) => cordHist.get()[i].y - window.innerHeight / 2,
    opacity: (i: number) =>
      i + 1 + getState().trailLength <= cordHist.get().length ? 0 : 1,
    zIndex: (i: number) => i,
    scale: 0.6
  })

  if (isOpen.get()) {
    gsap.set(imgs, { opacity: 0 })
    gsap.set(getElCurrent(), { opacity: 1, x: 0, y: 0, scale: 1 })
  }
}

// open image into navigation
function expandImage(): void {
  if (getIsAnimating()) return

  isOpen.set(true)
  setIsAnimating(true)

  const tl = gsap.timeline()
  // move down and hide trail inactive
  tl.to(getElTrailInactive(), {
    y: '+=20',
    ease: Power3.easeIn,
    stagger: 0.075,
    duration: 0.3,
    delay: 0.1,
    opacity: 0
  })
  // current move to center
  tl.to(getElCurrent(), {
    x: 0,
    y: 0,
    ease: Power3.easeInOut,
    duration: 0.7,
    delay: 0.3
  })
  // current expand
  tl.to(getElCurrent(), {
    delay: 0.1,
    scale: 1,
    ease: Power3.easeInOut
  })
  // finished
  tl.then(() => {
    setIsAnimating(false)
  })
}

// close navigation and back to stage
export function minimizeImage(): void {
  if (isAnimating) return

  isOpen.set(false)
  setIsAnimating(true)

  const tl = gsap.timeline()
  // shrink current
  tl.to(getElCurrent(), {
    scale: 0.6,
    duration: 0.6,
    ease: Power3.easeInOut
  })
  // move current to original position
  tl.to(getElCurrent(), {
    delay: 0.3,
    duration: 0.7,
    ease: Power3.easeInOut,
    x: cordHist.get()[cordHist.get().length - 1].x - window.innerWidth / 2,
    y: cordHist.get()[cordHist.get().length - 1].y - window.innerHeight / 2
  })
  // show trail inactive
  tl.to(getElTrailInactive(), {
    y: '-=20',
    ease: Power3.easeOut,
    stagger: -0.1,
    duration: 0.3,
    opacity: 1
  })
  // finished
  tl.then(() => {
    setIsAnimating(false)
  })
}

// init

export function initStage(ijs: ImageJSON[]): void {
  createStage(ijs)
  const stage = document.getElementsByClassName('stage').item(0) as HTMLDivElement
  imgs = Array.from(stage.getElementsByTagName('img'))
  stage.addEventListener('click', () => expandImage())
  stage.addEventListener('keydown', () => expandImage())
  window.addEventListener('mousemove', onMouse)
}

// hepler

function createStage(ijs: ImageJSON[]): void {
  // create container for images
  const stage: HTMLDivElement = document.createElement('div')
  stage.className = 'stage'
  // append images to container
  for (let ij of ijs) {
    const e = document.createElement('img')
    e.src = ij.url
    e.height = ij.imgH
    e.width = ij.imgW
    e.alt = 'image'
    stage.append(e)
  }
  document.getElementById('main')!.append(stage)
}
