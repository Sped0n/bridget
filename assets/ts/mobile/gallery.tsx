import { type JSX } from '@solidjs/web'
import { type gsap } from 'gsap'
import {
  createEffect,
  createMemo,
  createSignal,
  createStore,
  For,
  onSettled
} from 'solid-js'
import { type Swiper } from 'swiper'
import invariant from 'tiny-invariant'

import { useImageState } from '../imageState'
import { loadGsap, removeDuplicates, type Vector } from '../utils'

import GalleryImage from './galleryImage'
import GalleryNav, { capitalizeFirstLetter } from './galleryNav'
import { closeGallery, openGallery } from './galleryTransitions'
import { getActiveImageIndexes, loadSwiper } from './galleryUtils'
import { useMobileState } from './state'

export default function Gallery(props: {
  children?: JSX.Element
  closeText: string
  loadingText: string
}): JSX.Element {
  let _gsap: typeof gsap
  let _swiper: Swiper | undefined
  let initPromise: Promise<void> | undefined

  let curtain: HTMLDivElement | undefined
  let gallery: HTMLDivElement | undefined
  let galleryInner: HTMLDivElement | undefined

  const imageState = useImageState()
  const [mobile, { setIndex, setIsAnimating, setIsScrollLocked }] = useMobileState()

  const loadingText = createMemo(() => capitalizeFirstLetter(props.loadingText))

  let lastIndex = -1
  let mounted = false
  let navigateVector: Vector = 'none'

  const [libLoaded, setLibLoaded] = createSignal(false)
  const [swiperReady, setSwiperReady] = createSignal(false)
  const [loads, setLoads] = createStore(Array<boolean>(imageState().length).fill(false))

  const slideUp: () => void = () => {
    if (!libLoaded() || !mounted) return

    invariant(curtain, 'curtain is not defined')
    invariant(gallery, 'gallery is not defined')

    openGallery({
      gsap: _gsap,
      curtain,
      gallery,
      setIsAnimating,
      setIsScrollLocked
    })
  }

  const slideDown: () => void = () => {
    invariant(gallery, 'curtain is not defined')
    invariant(curtain, 'gallery is not defined')

    closeGallery({
      gsap: _gsap,
      curtain,
      gallery,
      setIsAnimating,
      setIsScrollLocked,
      onClosed: () => {
        lastIndex = -1
      }
    })
  }

  const galleryLoadImages: () => void = () => {
    const currentIndex = mobile.index()

    const indexes = removeDuplicates(
      getActiveImageIndexes(currentIndex, imageState().length, navigateVector)
    )
    setLoads((draft) => {
      for (const index of indexes) draft[index] = true
    })
  }

  const changeSlide: (slide: number) => void = (slide) => {
    if (!swiperReady() || _swiper === undefined) return
    galleryLoadImages()
    _swiper.slideTo(slide, 0)
  }

  const ensureGalleryReady: () => Promise<void> = async () => {
    if (initPromise !== undefined) return await initPromise

    initPromise = (async () => {
      try {
        const [g, S] = await Promise.all([loadGsap(), loadSwiper()])

        _gsap = g

        invariant(galleryInner, 'galleryInner is not defined')
        _swiper = new S(galleryInner, { spaceBetween: 20 })
        _swiper.on('slideChange', ({ realIndex }) => {
          setIndex(realIndex)
        })

        setLibLoaded(true)
        setSwiperReady(true)
      } catch (e) {
        initPromise = undefined
        setSwiperReady(false)
        console.log(e)
      }
    })()

    await initPromise
  }

  onSettled(() => {
    window.addEventListener('touchstart', () => void ensureGalleryReady(), {
      once: true,
      passive: true
    })
    mounted = true
  })

  // Position the selected slide only after Solid's staged readiness write commits.
  createEffect(
    () => [swiperReady(), mobile.index()] as const,
    ([ready, index]) => {
      if (!ready || index < 0) return
      if (index === lastIndex) return
      if (lastIndex === -1) navigateVector = 'none'
      else if (index < lastIndex) navigateVector = 'prev'
      else if (index > lastIndex) navigateVector = 'next'
      else navigateVector = 'none'
      changeSlide(index)
      lastIndex = index
    }
  )

  createEffect(
    () => [mobile.isOpen(), swiperReady()] as const,
    ([isOpen, ready], previous) => {
      if (isOpen && !ready) {
        void ensureGalleryReady()
        return
      }

      if (!ready || mobile.isAnimating()) return
      if (isOpen) slideUp()
      else if (previous?.[0]) slideDown()
    },
    { defer: true }
  )

  return (
    <>
      <div ref={gallery} class="gallery">
        <div ref={galleryInner} class="galleryInner">
          <div class="swiper-wrapper">
            <For each={imageState().images}>
              {(ij, i) => (
                <div class="swiper-slide">
                  <GalleryImage load={loads[i()]} ij={ij} loadingText={loadingText()} />
                </div>
              )}
            </For>
          </div>
        </div>
        <GalleryNav closeText={props.closeText} />
      </div>
      <div ref={curtain} class="curtain" />
    </>
  )
}
