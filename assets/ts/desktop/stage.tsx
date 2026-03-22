import { type gsap } from 'gsap'
import { For, createEffect, on, onMount, type JSX } from 'solid-js'

import { useConfigState } from '../configState'
import { useImageState } from '../imageState'
import { increment, loadGsap } from '../utils'

import type { DesktopImage } from './layout'
import { expandStage, minimizeStage, syncStagePosition } from './stageAnimations'
import { onMutation } from './stageUtils'
import { useDesktopState } from './state'

export default function Stage(): JSX.Element {
  let _gsap: typeof gsap
  let gsapPromise: Promise<void> | undefined

  const imageState = useImageState()
  const [config] = useConfigState()
  const [
    desktop,
    { setIndex, setCordHist, setIsOpen, setIsAnimating, setIsLoading, setNavVector }
  ] = useDesktopState()

  const imgs: DesktopImage[] = Array<DesktopImage>(imageState().length)
  let last = { x: 0, y: 0 }
  let abortController: AbortController | undefined
  let gsapLoaded = false
  let mounted = false

  const ensureGsapReady: () => Promise<void> = async () => {
    if (gsapPromise !== undefined) return await gsapPromise

    gsapPromise = loadGsap()
      .then((g) => {
        _gsap = g
        gsapLoaded = true
      })
      .catch((e) => {
        gsapPromise = undefined
        console.log(e)
      })

    await gsapPromise
  }

  const onMouse: (e: MouseEvent) => void = (e) => {
    if (desktop.isOpen() || desktop.isAnimating() || !gsapLoaded || !mounted) return

    const length = imageState().length
    if (length <= 0) return

    const cord = { x: e.clientX, y: e.clientY }
    const travelDist = Math.hypot(cord.x - last.x, cord.y - last.y)

    if (travelDist > config().threshold) {
      const nextIndex = increment(desktop.index(), length)

      last = cord
      setIndex(nextIndex)
      setCordHist((prev) => [...prev, { i: nextIndex, ...cord }].slice(-length))
    }
  }

  const onClick: () => Promise<void> = async () => {
    if (!gsapLoaded) {
      await ensureGsapReady()
    }

    if (desktop.isAnimating() || !gsapLoaded) return
    if (desktop.index() < 0 || desktop.cordHist().length === 0) return
    setIsOpen(true)
  }

  const setPosition: () => void = () => {
    syncStagePosition({
      gsap: _gsap,
      imgs,
      cordHist: desktop.cordHist(),
      trailLength: config().trailLength,
      length: imageState().length,
      isOpen: desktop.isOpen(),
      navVector: desktop.navVector(),
      mounted,
      setIsLoading
    })
  }

  const expandImage: () => Promise<void> = async () => {
    if (!mounted || !gsapLoaded) throw new Error('not mounted or gsap not loaded')

    await expandStage({
      gsap: _gsap,
      imgs,
      cordHist: desktop.cordHist(),
      trailLength: config().trailLength,
      length: imageState().length,
      mounted,
      setIsLoading,
      setIsAnimating
    })
  }

  const minimizeImage: () => Promise<void> = async () => {
    if (!mounted || !gsapLoaded) throw new Error('not mounted or gsap not loaded')

    setNavVector('none')

    await minimizeStage({
      gsap: _gsap,
      imgs,
      cordHist: desktop.cordHist(),
      trailLength: config().trailLength,
      mounted,
      setIsAnimating
    })
  }

  onMount(() => {
    imgs.forEach((img, i) => {
      if (i < 5) {
        img.src = img.dataset.loUrl
      }

      onMutation(img, (mutation) => {
        if (desktop.isOpen() || desktop.isAnimating()) return false
        if (mutation.attributeName !== 'style') return false

        const opacity = parseFloat(img.style.opacity)
        if (opacity !== 1) return false

        if (i + 5 < imgs.length) {
          imgs[i + 5].src = imgs[i + 5].dataset.loUrl
        }

        return true
      })
    })

    window.addEventListener('pointermove', () => void ensureGsapReady(), {
      passive: true,
      once: true
    })
    window.addEventListener('pointerdown', () => void ensureGsapReady(), {
      passive: true,
      once: true
    })
    window.addEventListener('click', () => void ensureGsapReady(), {
      passive: true,
      once: true
    })

    abortController = new AbortController()
    const abortSignal = abortController.signal
    window.addEventListener('mousemove', onMouse, {
      passive: true,
      signal: abortSignal
    })

    mounted = true
  })

  createEffect(
    on(
      () => desktop.cordHist(),
      () => {
        setPosition()
      },
      { defer: true }
    )
  )

  createEffect(
    on(
      desktop.isOpen,
      async (isOpen) => {
        if (desktop.isAnimating()) return

        if (isOpen) {
          if (desktop.index() < 0 || desktop.cordHist().length === 0) {
            setIsOpen(false)
            return
          }

          await expandImage()
            .catch(() => {
              setIsOpen(false)
              setIsAnimating(false)
              setIsLoading(false)
            })
            .then(() => {
              abortController?.abort()
            })
        } else {
          await minimizeImage()
            .catch(() => {
              void 0
            })
            .then(() => {
              abortController = new AbortController()
              const abortSignal = abortController.signal
              window.addEventListener('mousemove', onMouse, {
                passive: true,
                signal: abortSignal
              })
              setIsLoading(false)
            })
        }
      },
      { defer: true }
    )
  )

  return (
    <>
      <div class="stage" onClick={onClick} onKeyDown={onClick}>
        <For each={imageState().images}>
          {(ij, i) => (
            <img
              ref={imgs[i()]}
              height={ij.loImgH}
              width={ij.loImgW}
              data-hi-url={ij.hiUrl}
              data-hi-img-h={ij.hiImgH}
              data-hi-img-w={ij.hiImgW}
              data-lo-url={ij.loUrl}
              data-lo-img-h={ij.loImgH}
              data-lo-img-w={ij.loImgW}
              alt={ij.alt}
            />
          )}
        </For>
      </div>
    </>
  )
}
