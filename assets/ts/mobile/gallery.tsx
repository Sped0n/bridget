import { type JSX } from '@solidjs/web'
import { type gsap } from 'gsap'
import {
  createEffect,
  createMemo,
  createSignal,
  createStore,
  For,
  onCleanup,
  onSettled
} from 'solid-js'
import invariant from 'tiny-invariant'

import { useImageState } from '../imageState'
import { loadGsap, removeDuplicates, type Vector } from '../utils'

import GalleryImage from './galleryImage'
import GalleryNav, { capitalizeFirstLetter } from './galleryNav'
import { closeGallery, openGallery } from './galleryTransitions'
import { getActiveImageIndexes } from './galleryUtils'
import { useMobileState } from './state'

export default function Gallery(props: {
  children?: JSX.Element
  closeText: string
  loadingText: string
}): JSX.Element {
  let initPromise: Promise<void> | undefined
  let curtain: HTMLDivElement | undefined
  let gallery: HTMLDivElement | undefined
  let galleryInner: HTMLDivElement | undefined
  const slides: HTMLDivElement[] = []

  const imageState = useImageState()
  const [mobile, { setIndex, setIsAnimating, setIsScrollLocked }] = useMobileState()
  const loadingText = createMemo(() => capitalizeFirstLetter(props.loadingText))
  const [animationGsap, setAnimationGsap] = createSignal<typeof gsap>()
  const [loads, setLoads] = createStore(Array<boolean>(imageState().length).fill(false))

  let lastIndex = -1
  let scrollIndex = -1

  const positionSlide = (index: number): void => {
    if (galleryInner === undefined || slides[index] === undefined) return
    scrollIndex = index
    galleryInner.scrollTo({
      left: slides[index].offsetLeft - slides[0].offsetLeft,
      behavior: 'instant'
    })
  }

  const onScroll = (): void => {
    if (!mobile.isOpen() || galleryInner === undefined || slides.length === 0) return
    const stride =
      slides.length > 1
        ? slides[1].offsetLeft - slides[0].offsetLeft
        : galleryInner.clientWidth
    if (stride <= 0) return

    const index = Math.max(
      0,
      Math.min(slides.length - 1, Math.round(galleryInner.scrollLeft / stride))
    )
    if (index === scrollIndex) return
    // Track native scrolling before publishing the index so effects never cancel momentum.
    scrollIndex = index
    setIndex(index)
  }

  const ensureAnimationReady = async (): Promise<void> => {
    initPromise ??= loadGsap()
      .then((g) => {
        setAnimationGsap(g)
      })
      .catch((e) => {
        initPromise = undefined
        console.log(e)
      })
    await initPromise
  }

  onSettled(() => {
    const controller = new AbortController()
    window.addEventListener('touchstart', () => void ensureAnimationReady(), {
      once: true,
      passive: true,
      signal: controller.signal
    })

    invariant(galleryInner, 'galleryInner is not defined')
    const observer = new ResizeObserver(() => {
      if (mobile.isOpen()) positionSlide(mobile.index())
    })
    observer.observe(galleryInner)
    onCleanup(() => {
      controller.abort()
      observer.disconnect()
    })
  })

  createEffect(mobile.index, (index) => {
    if (index < 0) return
    const direction: Vector =
      lastIndex < 0 || index === lastIndex
        ? 'none'
        : index > lastIndex
          ? 'next'
          : 'prev'
    const indexes = removeDuplicates(
      getActiveImageIndexes(index, imageState().length, direction)
    )
    setLoads((draft) => {
      for (const activeIndex of indexes) draft[activeIndex] = true
    })
    lastIndex = index
    if (mobile.isOpen() && index !== scrollIndex) positionSlide(index)
  })

  createEffect(
    () => [mobile.isOpen(), animationGsap()] as const,
    ([isOpen, g], previous) => {
      if (isOpen && g === undefined) {
        void ensureAnimationReady()
        return
      }
      if (g === undefined || mobile.isAnimating()) return

      invariant(curtain, 'curtain is not defined')
      invariant(gallery, 'gallery is not defined')
      if (isOpen) {
        positionSlide(mobile.index())
        openGallery({ gsap: g, curtain, gallery, setIsAnimating, setIsScrollLocked })
      } else if (previous?.[0]) {
        closeGallery({
          gsap: g,
          curtain,
          gallery,
          setIsAnimating,
          setIsScrollLocked,
          onClosed: () => {
            lastIndex = -1
          }
        })
      }
    },
    { defer: true }
  )

  return (
    <>
      <div ref={gallery} class="gallery">
        <div ref={galleryInner} class="galleryInner" onScroll={onScroll}>
          <For each={imageState().images}>
            {(ij, i) => (
              <div ref={slides[i()]} class="gallerySlide">
                <GalleryImage load={loads[i()]} ij={ij} loadingText={loadingText()} />
              </div>
            )}
          </For>
        </div>
        <GalleryNav closeText={props.closeText} />
      </div>
      <div ref={curtain} class="curtain" />
    </>
  )
}
