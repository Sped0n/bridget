import { type gsap } from 'gsap'
import { type Swiper } from 'swiper'

import { container, scrollable } from '../container'
import { isAnimating, navigateVector, setIndex, state } from '../globalState'
import { createDivWithClass, expand, loadGsap, removeDuplicates } from '../globalUtils'
import { type ImageJSON } from '../resources'

import { mounted } from './state'
// eslint-disable-next-line sort-imports
import { capitalizeFirstLetter, loadSwiper, type MobileImage } from './utils'

/**
 * variables
 */

let galleryInner: HTMLDivElement
let gallery: HTMLDivElement
let curtain: HTMLDivElement
let indexDiv: HTMLDivElement
let navDiv: HTMLDivElement
let indexDispNums: HTMLSpanElement[] = []
let galleryImages: MobileImage[] = []
let collectionImages: MobileImage[] = []

let _gsap: typeof gsap
let _swiper: Swiper

/**
 * state
 */

let lastIndex = -1
let libLoaded = false

/**
 * main functions
 */

export function slideUp(): void {
  if (isAnimating.get() || !libLoaded) return
  isAnimating.set(true)

  _gsap.to(curtain, {
    opacity: 1,
    duration: 1
  })

  _gsap.to(gallery, {
    y: 0,
    ease: 'power3.inOut',
    duration: 1,
    delay: 0.4
  })

  setTimeout(() => {
    // cleanup
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
    ease: 'power3.inOut',
    duration: 1
  })

  _gsap.to(curtain, {
    opacity: 0,
    duration: 1.2,
    delay: 0.4
  })

  setTimeout(() => {
    // cleanup
    scrollable.set(true)
    isAnimating.set(false)
    lastIndex = -1
  }, 1600)
}

/**
 * init
 */

export function initGallery(ijs: ImageJSON[]): void {
  // create gallery
  constructGallery(ijs)
  // get elements
  indexDispNums = Array.from(
    indexDiv.getElementsByClassName('num') ?? []
  ) as HTMLSpanElement[]
  galleryImages = Array.from(gallery.getElementsByTagName('img')) as MobileImage[]
  collectionImages = Array.from(
    document
      .getElementsByClassName('collection')
      .item(0)
      ?.getElementsByTagName('img') ?? []
  ) as MobileImage[]
  // state watcher
  state.addWatcher((o) => {
    if (o.index === lastIndex)
      return // change slide only when index is changed
    else if (lastIndex === -1)
      navigateVector.set('none') // lastIndex before set
    else if (o.index < lastIndex)
      navigateVector.set('prev') // set navigate vector for galleryLoadImages
    else if (o.index > lastIndex)
      navigateVector.set('next') // set navigate vector for galleryLoadImages
    else navigateVector.set('none') // default
    changeSlide(o.index) // change slide to new index
    updateIndexText() // update index text
    lastIndex = o.index // update last index
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
          _gsap = g
        })
        .catch((e) => {
          console.log(e)
        })
      loadSwiper()
        .then((S) => {
          _swiper = new S(galleryInner, { spaceBetween: 20 })
          _swiper.on('slideChange', ({ realIndex }) => {
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
  _swiper.slideTo(slide, 0)
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

function constructGalleryNav(): void {
  // index
  indexDiv = document.createElement('div')
  indexDiv.insertAdjacentHTML(
    'afterbegin',
    `<span class="num"></span><span class="num"></span><span class="num"></span><span class="num"></span>
    <span>/</span>
    <span class="num"></span><span class="num"></span><span class="num"></span><span class="num"></span>`
  )
  // close
  const closeDiv = document.createElement('div')
  closeDiv.innerText = capitalizeFirstLetter(container.dataset.close)
  closeDiv.addEventListener(
    'click',
    () => {
      slideDown()
    },
    { passive: true }
  )
  closeDiv.addEventListener(
    'keydown',
    () => {
      slideDown()
    },
    { passive: true }
  )
  // nav
  navDiv = createDivWithClass('nav')
  navDiv.append(indexDiv, closeDiv)
}

function constructGalleryInner(ijs: ImageJSON[]): void {
  // swiper wrapper
  const swiperWrapper = createDivWithClass('swiper-wrapper')
  // loading text
  const loadingText = container.dataset.loading + '...'
  for (const ij of ijs) {
    // swiper slide
    const swiperSlide = createDivWithClass('swiper-slide')
    // loading indicator
    const l = createDivWithClass('loadingText')
    l.innerText = loadingText
    // img
    const e = document.createElement('img') as MobileImage
    e.dataset.src = ij.hiUrl
    e.height = ij.hiImgH
    e.width = ij.hiImgW
    e.alt = ij.alt
    e.style.opacity = '0'
    // load event
    e.addEventListener(
      'load',
      () => {
        if (state.get().index !== ij.index) {
          _gsap.set(e, { opacity: 1 })
          _gsap.set(l, { opacity: 0 })
        } else {
          _gsap.to(e, { opacity: 1, delay: 0.5, duration: 0.5, ease: 'power3.out' })
          _gsap.to(l, { opacity: 0, duration: 0.5, ease: 'power3.in' })
        }
      },
      { once: true, passive: true }
    )
    // parent container
    const p = createDivWithClass('slideContainer')
    // append
    p.append(e, l)
    swiperSlide.append(p)
    swiperWrapper.append(swiperSlide)
  }
  // swiper node
  galleryInner = createDivWithClass('galleryInner')
  galleryInner.append(swiperWrapper)
}

function constructGallery(ijs: ImageJSON[]): void {
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
  // gallery
  gallery = createDivWithClass('gallery')
  constructGalleryInner(ijs)
  constructGalleryNav()
  gallery.append(galleryInner, navDiv)

  /**
   * curtain
   */
  curtain = createDivWithClass('curtain')

  /**
   * container
   * |- gallery
   * |- curtain
   */
  container.append(gallery, curtain)
}
