import { type gsap } from 'gsap'

import { container } from '../container'
import { incIndex, isAnimating, navigateVector, state } from '../globalState'
import { decrement, increment, loadGsap } from '../globalUtils'
import { type ImageJSON } from '../resources'

import { active, cordHist, isLoading, isOpen } from './state'
// eslint-disable-next-line sort-imports
import { onMutation, type DesktopImage } from './utils'

/**
 * variables
 */

let imgs: DesktopImage[] = []
let last = { x: 0, y: 0 }

let _gsap: typeof gsap

/**
 * state
 */

let gsapLoaded = false

/**
 * getter
 */

function getTrailElsIndex(): number[] {
  return cordHist.get().map((item) => item.i)
}

function getTrailCurrentElsIndex(): number[] {
  return getTrailElsIndex().slice(-state.get().trailLength)
}

function getTrailInactiveElsIndex(): number[] {
  const trailCurrentElsIndex = getTrailCurrentElsIndex()
  return trailCurrentElsIndex.slice(0, trailCurrentElsIndex.length - 1)
}

function getCurrentElIndex(): number {
  const trailElsIndex = getTrailElsIndex()
  return trailElsIndex[trailElsIndex.length - 1]
}

function getPrevElIndex(): number {
  const c = cordHist.get()
  const s = state.get()
  return decrement(c[c.length - 1].i, s.length)
}

function getNextElIndex(): number {
  const c = cordHist.get()
  const s = state.get()
  return increment(c[c.length - 1].i, s.length)
}

/**
 * main functions
 */

// on mouse
function onMouse(e: MouseEvent): void {
  if (isOpen.get() || isAnimating.get()) return
  if (!gsapLoaded) {
    loadLib()
    return
  }
  const cord = { x: e.clientX, y: e.clientY }
  const travelDist = Math.hypot(cord.x - last.x, cord.y - last.y)

  if (travelDist > state.get().threshold) {
    last = cord
    incIndex()

    const newHist = { i: state.get().index, ...cord }
    cordHist.set([...cordHist.get(), newHist].slice(-state.get().length))
  }
}

// set image position with gsap (in both stage and navigation)
function setPositions(): void {
  const trailElsIndex = getTrailElsIndex()
  if (trailElsIndex.length === 0 || !gsapLoaded) return

  const elsTrail = getImagesWithIndexArray(trailElsIndex)

  // cached state
  const _isOpen = isOpen.get()
  const _cordHist = cordHist.get()
  const _state = state.get()

  _gsap.set(elsTrail, {
    x: (i: number) => _cordHist[i].x - window.innerWidth / 2,
    y: (i: number) => _cordHist[i].y - window.innerHeight / 2,
    opacity: (i: number) =>
      Math.max(
        (i + 1 + _state.trailLength <= _cordHist.length ? 0 : 1) - (_isOpen ? 1 : 0),
        0
      ),
    zIndex: (i: number) => i,
    scale: 0.6
  })

  if (_isOpen) {
    const elc = getImagesWithIndexArray([getCurrentElIndex()])[0]
    const indexArrayToHires: number[] = []
    const indexArrayToCleanup: number[] = []
    switch (navigateVector.get()) {
      case 'prev':
        indexArrayToHires.push(getPrevElIndex())
        indexArrayToCleanup.push(getNextElIndex())
        break
      case 'next':
        indexArrayToHires.push(getNextElIndex())
        indexArrayToCleanup.push(getPrevElIndex())
        break
      default:
        break
    }
    hires(getImagesWithIndexArray(indexArrayToHires)) // preload
    _gsap.set(getImagesWithIndexArray(indexArrayToCleanup), { opacity: 0 })
    _gsap.set(elc, { x: 0, y: 0, scale: 1 }) // set current to center
    setLoaderForHiresImage(elc) // set loader, if loaded set current opacity to 1
  } else {
    lores(elsTrail)
  }
}

// open image into navigation
function expandImage(): void {
  if (isAnimating.get()) return

  isOpen.set(true)
  isAnimating.set(true)

  const elcIndex = getCurrentElIndex()
  const elc = getImagesWithIndexArray([elcIndex])[0]
  // don't hide here because we want a better transition
  // elc.classList.add('hide')

  hires(getImagesWithIndexArray([elcIndex, getPrevElIndex(), getNextElIndex()]))
  setLoaderForHiresImage(elc)

  const tl = _gsap.timeline()
  const trailInactiveEls = getImagesWithIndexArray(getTrailInactiveElsIndex())
  // move down and hide trail inactive
  tl.to(trailInactiveEls, {
    y: '+=20',
    ease: 'power3.in',
    stagger: 0.075,
    duration: 0.3,
    delay: 0.1,
    opacity: 0
  })
  // current move to center
  tl.to(elc, {
    x: 0,
    y: 0,
    ease: 'power3.inOut',
    duration: 0.7,
    delay: 0.3
  })
  // current expand
  tl.to(elc, {
    delay: 0.1,
    scale: 1,
    ease: 'power3.inOut'
  })
  // finished
  tl.then(() => {
    isAnimating.set(false)
  }).catch((e) => {
    console.log(e)
  })
}

// close navigation and back to stage
export function minimizeImage(): void {
  if (isAnimating.get()) return

  isOpen.set(false)
  isAnimating.set(true)
  navigateVector.set('none') // cleanup

  lores(
    getImagesWithIndexArray([...getTrailInactiveElsIndex(), ...[getCurrentElIndex()]])
  )

  const tl = _gsap.timeline()
  const elc = getImagesWithIndexArray([getCurrentElIndex()])[0]
  const elsTrailInactive = getImagesWithIndexArray(getTrailInactiveElsIndex())
  // shrink current
  tl.to(elc, {
    scale: 0.6,
    duration: 0.6,
    ease: 'power3.inOut'
  })
  // move current to original position
  tl.to(elc, {
    delay: 0.3,
    duration: 0.7,
    ease: 'power3.inOut',
    x: cordHist.get()[cordHist.get().length - 1].x - window.innerWidth / 2,
    y: cordHist.get()[cordHist.get().length - 1].y - window.innerHeight / 2
  })
  // show trail inactive
  tl.to(elsTrailInactive, {
    y: '-=20',
    ease: 'power3.out',
    stagger: -0.1,
    duration: 0.3,
    opacity: 1
  })
  // finished
  tl.then(() => {
    isAnimating.set(false)
  }).catch((e) => {
    console.log(e)
  })
}

/**
 * init
 */

export function initStage(ijs: ImageJSON[]): void {
  // create stage element
  createStage(ijs)
  // get stage
  const stage = document.getElementsByClassName('stage').item(0) as HTMLDivElement
  // get image elements
  imgs = Array.from(stage.getElementsByTagName('img')) as DesktopImage[]
  imgs.forEach((img, i) => {
    // preload first 5 images on page load
    if (i < 5) {
      img.src = img.dataset.loUrl
    }
    // lores preloader for rest of the images
    onMutation(img, (mutation) => {
      // if open or animating, hold
      if (isOpen.get() || isAnimating.get()) return false
      // if mutation is not about style attribute, hold
      if (mutation.attributeName !== 'style') return false
      const opacity = parseFloat(img.style.opacity)
      // if opacity is not 1, hold
      if (opacity !== 1) return false
      // preload the i + 5th image, if it exists
      if (i + 5 < imgs.length) {
        imgs[i + 5].src = imgs[i + 5].dataset.loUrl
      }
      // triggered
      return true
    })
  })
  // event listeners
  stage.addEventListener(
    'click',
    () => {
      expandImage()
    },
    { passive: true }
  )
  stage.addEventListener(
    'keydown',
    () => {
      expandImage()
    },
    { passive: true }
  )
  window.addEventListener('mousemove', onMouse, { passive: true })
  // watchers
  isOpen.addWatcher((o) => {
    active.set(o && !isAnimating.get())
  })
  isAnimating.addWatcher((o) => {
    active.set(isOpen.get() && !o)
  })
  cordHist.addWatcher((_) => {
    setPositions()
  })
  // dynamic import
  window.addEventListener(
    'mousemove',
    () => {
      loadLib()
    },
    { once: true, passive: true }
  )
}

/**
 * hepler
 */

function createStage(ijs: ImageJSON[]): void {
  // create container for images
  const stage: HTMLDivElement = document.createElement('div')
  stage.className = 'stage'
  // append images to container
  for (const ij of ijs) {
    const e = document.createElement('img') as DesktopImage
    e.height = ij.loImgH
    e.width = ij.loImgW
    // set data attributes
    e.dataset.hiUrl = ij.hiUrl
    e.dataset.hiImgH = ij.hiImgH.toString()
    e.dataset.hiImgW = ij.hiImgW.toString()
    e.dataset.loUrl = ij.loUrl
    e.dataset.loImgH = ij.loImgH.toString()
    e.dataset.loImgW = ij.loImgW.toString()
    e.alt = ij.alt
    // append
    stage.append(e)
  }
  container.append(stage)
}

function getImagesWithIndexArray(indexArray: number[]): DesktopImage[] {
  return indexArray.map((i) => imgs[i])
}

function hires(imgs: DesktopImage[]): void {
  imgs.forEach((img) => {
    if (img.src === img.dataset.hiUrl) return
    img.src = img.dataset.hiUrl
    img.height = parseInt(img.dataset.hiImgH)
    img.width = parseInt(img.dataset.hiImgW)
  })
}

function lores(imgs: DesktopImage[]): void {
  imgs.forEach((img) => {
    if (img.src === img.dataset.loUrl) return
    img.src = img.dataset.loUrl
    img.height = parseInt(img.dataset.loImgH)
    img.width = parseInt(img.dataset.loImgW)
  })
}

function setLoaderForHiresImage(e: HTMLImageElement): void {
  if (!e.complete) {
    isLoading.set(true)
    // abort controller for cleanup
    const controller = new AbortController()
    const abortSignal = controller.signal
    // event listeners
    e.addEventListener(
      'load',
      () => {
        _gsap
          .to(e, { opacity: 1, ease: 'power3.out', duration: 0.5 })
          .then(() => {
            isLoading.set(false)
          })
          .catch((e) => {
            console.log(e)
          })
          .finally(() => {
            controller.abort()
          })
      },
      { once: true, passive: true, signal: abortSignal }
    )
    e.addEventListener(
      'error',
      () => {
        _gsap
          .set(e, { opacity: 1 })
          .then(() => {
            isLoading.set(false)
          })
          .catch((e) => {
            console.log(e)
          })
          .finally(() => {
            controller.abort()
          })
      },
      { once: true, passive: true, signal: abortSignal }
    )
  } else {
    _gsap
      .set(e, { opacity: 1 })
      .then(() => {
        isLoading.set(false)
      })
      .catch((e) => {
        console.log(e)
      })
  }
}

function loadLib(): void {
  loadGsap()
    .then((g) => {
      _gsap = g
      gsapLoaded = true
    })
    .catch((e) => {
      console.log(e)
    })
}
