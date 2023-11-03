import { type Power3, type gsap } from 'gsap'
import { type Swiper } from 'swiper'

import { container } from '../container'
import { type ImageJSON } from '../resources'
import { setIndex, state } from '../state'
import {
  Watchable,
  capitalizeFirstLetter,
  expand,
  loadGsap,
  loadSwiper
} from '../utils'

import { mounted } from './mounted'
import { scrollable } from './scroll'

/**
 * variables
 */

let swiperNode: HTMLDivElement
let gallery: HTMLDivElement
let curtain: HTMLDivElement
let swiper: Swiper
const isAnimating = new Watchable<boolean>(false)
let lastIndex = -1
let indexDispNums: HTMLSpanElement[] = []
let galleryImages: HTMLImageElement[] = []
let collectionImages: HTMLImageElement[] = []

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
  loadImages()

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
  }, 1200)
}

function slideDown(): void {
  scrollable.set(true)
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
  galleryImages = Array.from(gallery.getElementsByTagName('img'))
  collectionImages = Array.from(
    document
      .getElementsByClassName('collection')
      .item(0)
      ?.getElementsByTagName('img') ?? []
  )
  // state watcher
  state.addWatcher(() => {
    const s = state.get()
    // change slide only when index is changed
    if (s.index === lastIndex) return
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
  loadImages()
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
  // swiper slide
  for (const ij of ijs) {
    const _swiperSlide = document.createElement('div')
    _swiperSlide.className = 'swiper-slide'
    // img
    const e = document.createElement('img')
    e.dataset.src = ij.hiUrl
    e.height = ij.hiImgH
    e.width = ij.hiImgW
    e.alt = ij.alt
    // append
    _swiperSlide.append(e)
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

function loadImages(): void {
  const activeImages: HTMLImageElement[] = []
  // load current, next, prev image
  activeImages.push(galleryImages[swiper.activeIndex])
  activeImages.push(
    galleryImages[Math.min(swiper.activeIndex + 1, swiper.slides.length)]
  )
  activeImages.push(galleryImages[Math.max(swiper.activeIndex - 1, 0)])
  for (const e of activeImages) {
    e.src = e.dataset.src as string
  }
}
