import { type gsap } from 'gsap'
import { createEffect, on, onMount, type JSX } from 'solid-js'
import invariant from 'tiny-invariant'

import type { ImageJSON } from '../resources'
import { loadGsap } from '../utils'

import { useMobileState } from './state'

export default function GalleryImage(props: {
  children?: JSX.Element
  load: boolean
  ij: ImageJSON
  loadingText: string
}): JSX.Element {
  let img: HTMLImageElement | undefined
  let loadingDiv: HTMLDivElement | undefined

  let _gsap: typeof gsap | undefined
  let gsapPromise: Promise<typeof gsap> | undefined
  let revealed = false

  const [mobile] = useMobileState()

  const revealImage = async (): Promise<void> => {
    if (revealed) return
    revealed = true

    invariant(img, 'ref must be defined')
    invariant(loadingDiv, 'loadingDiv must be defined')

    gsapPromise ??= loadGsap()

    try {
      _gsap ??= await gsapPromise
    } catch (e) {
      console.log(e)
    }

    if (_gsap === undefined) {
      img.style.opacity = '1'
      loadingDiv.style.opacity = '0'
      return
    }

    if (mobile.index() !== props.ij.index) {
      _gsap.set(img, { opacity: 1 })
      _gsap.set(loadingDiv, { opacity: 0 })
      return
    }

    _gsap.to(img, {
      opacity: 1,
      delay: 0.5,
      duration: 0.5,
      ease: 'power3.out'
    })
    _gsap.to(loadingDiv, { opacity: 0, duration: 0.5, ease: 'power3.in' })
  }

  onMount(() => {
    gsapPromise = loadGsap()
      .then((g) => {
        _gsap = g
        return g
      })
      .catch((e) => {
        console.log(e)
        throw e
      })

    img?.addEventListener(
      'load',
      () => {
        void revealImage()
      },
      { once: true, passive: true }
    )

    if (props.load && img?.complete && img.currentSrc !== '') {
      void revealImage()
    }
  })

  createEffect(
    on(
      () => props.load,
      (load) => {
        if (!load || img === undefined || !img.complete || img.currentSrc === '') return
        void revealImage()
      },
      { defer: true }
    )
  )

  return (
    <>
      <div class="slideContainer">
        <img
          ref={img}
          {...(props.load && { src: props.ij.hiUrl })}
          height={props.ij.hiImgH}
          width={props.ij.hiImgW}
          data-src={props.ij.hiUrl}
          alt={props.ij.alt}
          style={{ opacity: 0 }}
        />
        <div ref={loadingDiv} class="loadingText">
          {props.loadingText}
        </div>
      </div>
    </>
  )
}
