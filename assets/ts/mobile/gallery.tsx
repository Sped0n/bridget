import { type JSX } from '@solidjs/web'
import { type gsap } from 'gsap'
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onSettled
} from 'solid-js'

import { useImageState } from '../imageState'
import { invariant } from '../invariant'
import { loadGsap, type Vector } from '../utils'
import GalleryImage from './galleryImage'
import GalleryNav, { capitalizeFirstLetter } from './galleryNav'
import { animateGallery } from './galleryTransitions'
import { getActiveImageIndexes } from './galleryUtils'
import { useMobileState } from './state'

export default function Gallery(props: {
  children?: JSX.Element
  closeText: string
  loadingText: string
}): JSX.Element {
  let curtain: HTMLDivElement | undefined
  let gallery: HTMLDivElement | undefined
  let galleryInner: HTMLDivElement | undefined
  let animationGsap: typeof gsap | undefined
  const slides: HTMLDivElement[] = []

  const { images, length } = useImageState()()
  const [mobile, { select, finishOpening, cancelOpening, finishClosing }] =
    useMobileState()
  const selectedIndex = createMemo(() => {
    const state = mobile()
    return state.phase === 'closed' ? -1 : state.index
  })
  const loadingText = createMemo(() => capitalizeFirstLetter(props.loadingText))
  const imageLoads = Array.from({ length }, () => createSignal(false))

  const positionSlide = (index: number): void => {
    if (galleryInner === undefined || slides[index] === undefined) return
    galleryInner.scrollTo({
      left: slides[index].offsetLeft - slides[0].offsetLeft,
      behavior: 'instant'
    })
  }

  const onScroll = (): void => {
    if (mobile().phase !== 'open' || galleryInner === undefined || slides.length === 0)
      return
    const stride =
      slides.length > 1
        ? slides[1].offsetLeft - slides[0].offsetLeft
        : galleryInner.clientWidth
    if (stride <= 0) return

    const index = Math.max(
      0,
      Math.min(slides.length - 1, Math.round(galleryInner.scrollLeft / stride))
    )
    select(index)
  }

  onSettled(() => {
    invariant(galleryInner, 'galleryInner is not defined')
    const observer = new ResizeObserver(() => {
      const state = mobile()
      if (state.phase === 'opening' || state.phase === 'open')
        positionSlide(state.index)
    })
    observer.observe(galleryInner)
    onCleanup(() => observer.disconnect())
  })

  createEffect(selectedIndex, (index, previous) => {
    if (index < 0) return
    const direction: Vector =
      previous === undefined || previous < 0
        ? 'none'
        : index > previous
          ? 'next'
          : 'prev'
    for (const activeIndex of getActiveImageIndexes(index, length, direction)) {
      imageLoads[activeIndex][1](true)
    }
  })

  createEffect(
    () => mobile().phase,
    (phase) => {
      const state = mobile()
      const panel = gallery
      const backdrop = curtain
      if (phase === 'open' && state.phase === 'open' && state.restoreFocus) {
        panel?.querySelector('button')?.focus({ preventScroll: true })
      }
      if (state.phase !== 'opening' && state.phase !== 'closing') return
      invariant(panel && backdrop, 'gallery elements are not defined')

      const opening = state.phase === 'opening'
      if (opening) positionSlide(state.index)
      let cancelled = false
      let transition: gsap.core.Timeline | undefined
      const animate = (g: typeof gsap): void => {
        if (cancelled) return
        animationGsap = g
        transition = animateGallery(
          g,
          backdrop,
          panel,
          opening,
          opening ? finishOpening : finishClosing
        )
      }
      if (animationGsap) animate(animationGsap)
      else {
        void loadGsap().then(animate, (error) => {
          if (cancelled) return
          cancelOpening()
          console.error(error)
        })
      }
      return () => {
        cancelled = true
        transition?.kill()
      }
    }
  )

  return (
    <>
      <div
        ref={gallery}
        class="gallery"
        inert={mobile().phase === 'closed' || mobile().phase === 'opening'}
      >
        <div ref={galleryInner} class="galleryInner" onScroll={onScroll}>
          <For each={images}>
            {(ij, i) => (
              <div ref={slides[i()]} class="gallerySlide">
                <GalleryImage
                  load={imageLoads[i()][0]()}
                  ij={ij}
                  loadingText={loadingText()}
                />
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
