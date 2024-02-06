import { type Power3, type gsap } from 'gsap'

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
let _Power3: typeof Power3

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

  _gsap.set(elsTrail, {
    x: (i: number) => cordHist.get()[i].x - window.innerWidth / 2,
    y: (i: number) => cordHist.get()[i].y - window.innerHeight / 2,
    opacity: (i: number) =>
      i + 1 + state.get().trailLength <= cordHist.get().length ? 0 : 1,
    zIndex: (i: number) => i,
    scale: 0.6
  })

  if (isOpen.get()) {
    const elc = getImagesWithIndexArray([getCurrentElIndex()])[0]
    elc.classList.add('hide') // hide image to prevent flash
    const indexArrayToHires: number[] = []
    switch (navigateVector.get()) {
      case 'prev':
        indexArrayToHires.push(getPrevElIndex())
        break
      case 'next':
        indexArrayToHires.push(getNextElIndex())
        break
      default:
        break
    }
    hires(getImagesWithIndexArray(indexArrayToHires)) // preload
    _gsap.set(getImagesWithIndexArray(indexArrayToCleanup), { opacity: 0 })
    _gsap.set(imgs, { opacity: 0 })
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
    ease: _Power3.easeIn,
    stagger: 0.075,
    duration: 0.3,
    delay: 0.1,
    opacity: 0
  })
  // current move to center
  tl.to(elc, {
    x: 0,
    y: 0,
    ease: _Power3.easeInOut,
    duration: 0.7,
    delay: 0.3
  })
  // current expand
  tl.to(elc, {
    delay: 0.1,
    scale: 1,
    ease: _Power3.easeInOut
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
    ease: _Power3.easeInOut
  })
  // move current to original position
  tl.to(elc, {
    delay: 0.3,
    duration: 0.7,
    ease: _Power3.easeInOut,
    x: cordHist.get()[cordHist.get().length - 1].x - window.innerWidth / 2,
    y: cordHist.get()[cordHist.get().length - 1].y - window.innerHeight / 2
  })
  // show trail inactive
  tl.to(elsTrailInactive, {
    y: '-=20',
    ease: _Power3.easeOut,
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
    onMutation(img, (mutations, observer) => {
      mutations.every((mutation) => {
        // if open or animating, skip
        if (isOpen.get() || isAnimating.get()) return true
        // if mutation is not about style attribute, skip
        if (mutation.attributeName !== 'style') return true
        const opacity = parseFloat(img.style.opacity)
        // if opacity is not 1, skip
        if (opacity !== 1) return true
        // preload the i + 5th image
        if (i + 5 < imgs.length) {
          imgs[i + 5].src = imgs[i + 5].dataset.loUrl
        }
        // disconnect observer and return false to break the loop
        observer.disconnect()
        return false
      })
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
    e.addEventListener(
      'load',
      () => {
        isLoading.set(false)
        e.classList.remove('hide')
      },
      { once: true, passive: true }
    )
    e.addEventListener(
      'error',
      () => {
        isLoading.set(false)
      },
      { once: true, passive: true }
    )
  } else {
    e.classList.remove('hide')
    isLoading.set(false)
  }
}

function loadLib(): void {
  loadGsap()
    .then((g) => {
      _gsap = g[0]
      _Power3 = g[1]
      gsapLoaded = true
    })
    .catch((e) => {
      console.log(e)
    })
}
