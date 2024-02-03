import { type Power3, type gsap } from 'gsap'
import { type Swiper } from 'swiper'

import { container, scrollable } from '../container'
import { isAnimating, navigateVector, setIndex, state } from '../globalState'
import { expand, loadGsap, removeDuplicates } from '../globalUtils'
import { type ImageJSON } from '../resources'

import { mounted } from './state'
// eslint-disable-next-line sort-imports
import { capitalizeFirstLetter, loadSwiper, type MobileImage } from './utils'

/**
 * variables
 */

let swiperNode: HTMLDivElement
let gallery: HTMLDivElement
let curtain: HTMLDivElement
let swiper: Swiper
let lastIndex = -1
let indexDispNums: HTMLSpanElement[] = []
let galleryImages: MobileImage[] = []
let collectionImages: MobileImage[] = []

let _Swiper: typeof Swiper
let _gsap: typeof gsap
let _Power3: typeof Power3

let libLoaded = false

/**
 * main functions
 */

export function slideUp(): void {
  if (isAnimating.get() || !libLoaded) return
  isAnimating.set(true)

  // load active image
  galleryLoadImages()

  _gsap.to(curtain, {
    opacity: 1,
    duration: 1
  })

  _gsap.to(gallery, {
    y: 0,
    ease: _Power3.easeInOut,
    duration: 1,
    delay: 0.4
  })

  setTimeout(() => {
    scrollable.set(false)
    isAnimating.set(false)
  }, 1400)
}

function slideDown(): void {
  if (isAnimating.get()) return
  isAnimating.set(true)
  scrollToActive()

  _gsap.to(gallery, {
    y: '100%',
    ease: _Power3.easeInOut,
    duration: 1
  })

  _gsap.to(curtain, {
    opacity: 0,
    duration: 1.2,
    delay: 0.4
  })

  setTimeout(() => {
    scrollable.set(true)
    isAnimating.set(false)
  }, 1600)
}

/**
 * init
 */

export function initGallery(ijs: ImageJSON[]): void {
  // create gallery
  createGallery(ijs)
  // get elements
  indexDispNums = Array.from(
    document.getElementsByClassName('nav').item(0)?.getElementsByClassName('num') ?? []
  ) as HTMLSpanElement[]
  swiperNode = document.getElementsByClassName('galleryInner').item(0) as HTMLDivElement
  gallery = document.getElementsByClassName('gallery').item(0) as HTMLDivElement
  curtain = document.getElementsByClassName('curtain').item(0) as HTMLDivElement
  galleryImages = Array.from(gallery.getElementsByTagName('img')) as MobileImage[]
  collectionImages = Array.from(
    document
      .getElementsByClassName('collection')
      .item(0)
      ?.getElementsByTagName('img') ?? []
  ) as MobileImage[]
  // state watcher
  state.addWatcher(() => {
    const s = state.get()
    // change slide only when index is changed
    if (s.index === lastIndex) return
    else if (lastIndex === -1)
      navigateVector.set('none') // lastIndex before first set
    else if (s.index < lastIndex) navigateVector.set('prev')
    else navigateVector.set('next')
    changeSlide(s.index)
    updateIndexText()
    lastIndex = s.index
  })
  // mounted watcher
  mounted.addWatcher((o) => {
    if (!o) return
    scrollable.set(true)
  })
  // dynamic import
  window.addEventListener(
    'touchstart',
    () => {
      loadGsap()
        .then((g) => {
          _gsap = g[0]
          _Power3 = g[1]
        })
        .catch((e) => {
          console.log(e)
        })
      loadSwiper()
        .then((s) => {
          _Swiper = s
          swiper = new _Swiper(swiperNode, { spaceBetween: 20 })
          swiper.on('slideChange', ({ realIndex }) => {
            setIndex(realIndex)
          })
        })
        .catch((e) => {
          console.log(e)
        })
      libLoaded = true
    },
    { once: true, passive: true }
  )
  // mounted
  mounted.set(true)
}

/**
 * helper
 */

function changeSlide(slide: number): void {
  galleryLoadImages()
  swiper.slideTo(slide, 0)
}

function scrollToActive(): void {
  collectionImages[state.get().index].scrollIntoView({
    block: 'center',
    behavior: 'auto'
  })
}

function updateIndexText(): void {
  const indexValue: string = expand(state.get().index + 1)
  const indexLength: string = expand(state.get().length)
  indexDispNums.forEach((e: HTMLSpanElement, i: number) => {
    if (i < 4) {
      e.innerText = indexValue[i]
    } else {
      e.innerText = indexLength[i - 4]
    }
  })
}

function galleryLoadImages(): void {
  let activeImagesIndex: number[] = []
  const currentIndex = state.get().index
  const nextIndex = Math.min(currentIndex + 1, state.get().length - 1)
  const prevIndex = Math.max(currentIndex - 1, 0)
  switch (navigateVector.get()) {
    case 'next':
      activeImagesIndex = [nextIndex]
      break
    case 'prev':
      activeImagesIndex = [prevIndex]
      break
    case 'none':
      activeImagesIndex = [currentIndex, nextIndex, prevIndex]
      break
  }
  removeDuplicates(activeImagesIndex).forEach((i) => {
    const e = galleryImages[i]
    if (e.src === e.dataset.src) return // already loaded
    e.src = e.dataset.src
  })
}

function createGallery(ijs: ImageJSON[]): void {
  /**
   * gallery
   * |- galleryInner
   *    |- swiper-wrapper
   *       |- swiper-slide
   *          |- img
   *       |- swiper-slide
   *          |- img
   *       |- ...
   * |- nav
   *    |- index
   *    |- close
   */
  // swiper wrapper
  const _swiperWrapper = document.createElement('div')
  _swiperWrapper.className = 'swiper-wrapper'
  // loading text
  const loadingText = container.dataset.loading
  for (const ij of ijs) {
    // swiper slide
    const _swiperSlide = document.createElement('div')
    _swiperSlide.className = 'swiper-slide'
    // loading indicator
    const l = document.createElement('div')
    l.className = 'loadingText'
    l.innerText = loadingText
    // img
    const e = document.createElement('img') as MobileImage
    e.dataset.src = ij.hiUrl
    e.height = ij.hiImgH
    e.width = ij.hiImgW
    e.alt = ij.alt
    e.classList.add('hide')
    // load event
    e.addEventListener(
      'load',
      () => {
        e.classList.remove('hide')
        l.classList.add('hide')
      },
      { once: true, passive: true }
    )
    // parent container
    const p = document.createElement('div')
    p.className = 'slideContainer'
    // append
    p.append(e)
    p.append(l)
    _swiperSlide.append(p)
    _swiperWrapper.append(_swiperSlide)
  }
  // swiper node
  const _swiperNode = document.createElement('div')
  _swiperNode.className = 'galleryInner'
  _swiperNode.append(_swiperWrapper)
  // index
  const _index = document.createElement('div')
  _index.insertAdjacentHTML(
    'afterbegin',
    `<span class="num"></span><span class="num"></span><span class="num"></span><span class="num"></span>
    <span>/</span>
    <span class="num"></span><span class="num"></span><span class="num"></span><span class="num"></span>`
  )
  // close
  const _close = document.createElement('div')
  const str: string = document
    .getElementById('main')
    ?.getAttribute('closeText') as string
  _close.innerText = capitalizeFirstLetter(str)
  _close.addEventListener(
    'click',
    () => {
      slideDown()
    },
    { passive: true }
  )
  _close.addEventListener(
    'keydown',
    () => {
      slideDown()
    },
    { passive: true }
  )
  // nav
  const _navDiv = document.createElement('div')
  _navDiv.className = 'nav'
  _navDiv.append(_index, _close)
  // gallery
  const _gallery = document.createElement('div')
  _gallery.className = 'gallery'
  _gallery.append(_swiperNode)
  _gallery.append(_navDiv)

  /**
   * curtain
   */
  const _curtain = document.createElement('div')
  _curtain.className = 'curtain'

  /**
   * container
   * |- gallery
   * |- curtain
   */
  container.append(_gallery, _curtain)
}
