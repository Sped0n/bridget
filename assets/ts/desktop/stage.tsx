import { type gsap } from 'gsap'
import {
  For,
  createEffect,
  on,
  onMount,
  type Accessor,
  type JSX,
  type Setter
} from 'solid-js'

import type { ImageJSON } from '../resources'
import { useState, type State } from '../state'
import { decrement, increment, loadGsap, type Vector } from '../utils'

import type { DesktopImage, HistoryItem } from './layout'

/**
 * helper functions
 */

function getTrailElsIndex(cordHistValue: HistoryItem[]): number[] {
  return cordHistValue.map((el) => el.i)
}

function getTrailCurrentElsIndex(
  cordHistValue: HistoryItem[],
  stateValue: State
): number[] {
  return getTrailElsIndex(cordHistValue).slice(-stateValue.trailLength)
}

function getTrailInactiveElsIndex(
  cordHistValue: HistoryItem[],
  stateValue: State
): number[] {
  return getTrailCurrentElsIndex(cordHistValue, stateValue).slice(0, -1)
}

function getCurrentElIndex(cordHistValue: HistoryItem[]): number {
  return getTrailElsIndex(cordHistValue).slice(-1)[0]
}

function getPrevElIndex(cordHistValue: HistoryItem[], stateValue: State): number {
  return decrement(cordHistValue.slice(-1)[0].i, stateValue.length)
}

function getNextElIndex(cordHistValue: HistoryItem[], stateValue: State): number {
  return increment(cordHistValue.slice(-1)[0].i, stateValue.length)
}

function getImagesFromIndexes(imgs: DesktopImage[], indexes: number[]): DesktopImage[] {
  return indexes.map((i) => imgs[i])
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

function onMutation<T extends HTMLElement>(
  element: T,
  trigger: (arg0: MutationRecord) => boolean,
  observeOptions: MutationObserverInit = { attributes: true }
): void {
  new MutationObserver((mutations, observer) => {
    for (const mutation of mutations) {
      if (trigger(mutation)) {
        observer.disconnect()
        break
      }
    }
  }).observe(element, observeOptions)
}

/**
 * Stage component
 */

export default function Stage(props: {
  ijs: ImageJSON[]
  setIsLoading: Setter<boolean>
  isOpen: Accessor<boolean>
  setIsOpen: Setter<boolean>
  isAnimating: Accessor<boolean>
  setIsAnimating: Setter<boolean>
  cordHist: Accessor<HistoryItem[]>
  setCordHist: Setter<HistoryItem[]>
  navVector: Accessor<Vector>
  setNavVector: Setter<Vector>
}): JSX.Element {
  // variables
  let _gsap: typeof gsap

  // eslint-disable-next-line solid/reactivity
  const imgs: DesktopImage[] = Array<DesktopImage>(props.ijs.length)
  let last = { x: 0, y: 0 }

  let abortController: AbortController | undefined

  // states
  let gsapLoaded = false

  const [state, { incIndex }] = useState()
  const stateLength = state().length

  let mounted = false

  const onMouse: (e: MouseEvent) => void = (e) => {
    if (props.isOpen() || props.isAnimating() || !gsapLoaded || !mounted) return
    const cord = { x: e.clientX, y: e.clientY }
    const travelDist = Math.hypot(cord.x - last.x, cord.y - last.y)

    if (travelDist > state().threshold) {
      last = cord
      incIndex()

      const _state = state()
      const newHist = { i: _state.index, ...cord }
      props.setCordHist((prev) => [...prev, newHist].slice(-stateLength))
    }
  }

  const onClick: () => void = () => {
    !props.isAnimating() && props.setIsOpen(true)
  }

  const setPosition: () => void = () => {
    if (!mounted) return
    if (imgs.length === 0) return
    const _cordHist = props.cordHist()
    const trailElsIndex = getTrailElsIndex(_cordHist)
    if (trailElsIndex.length === 0) return

    const elsTrail = getImagesFromIndexes(imgs, trailElsIndex)

    const _isOpen = props.isOpen()
    const _state = state()

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
      const elc = getImagesFromIndexes(imgs, [getCurrentElIndex(_cordHist)])[0]
      const indexArrayToHires: number[] = []
      const indexArrayToCleanup: number[] = []
      switch (props.navVector()) {
        case 'prev':
          indexArrayToHires.push(getPrevElIndex(_cordHist, _state))
          indexArrayToCleanup.push(getNextElIndex(_cordHist, _state))
          break
        case 'next':
          indexArrayToHires.push(getNextElIndex(_cordHist, _state))
          indexArrayToCleanup.push(getPrevElIndex(_cordHist, _state))
          break
        default:
          break
      }
      hires(getImagesFromIndexes(imgs, indexArrayToHires)) // preload
      _gsap.set(getImagesFromIndexes(imgs, indexArrayToCleanup), { opacity: 0 })
      _gsap.set(elc, { x: 0, y: 0, scale: 1 }) // set current to center
      setLoaderForHiresImage(elc) // set loader, if loaded set current opacity to 1
    } else {
      lores(elsTrail)
    }
  }

  const expandImage: () => Promise<
    gsap.core.Omit<gsap.core.Timeline, 'then'>
  > = async () => {
    // isAnimating is prechecked in isOpen effect
    if (!mounted || !gsapLoaded) throw new Error('not mounted or gsap not loaded')

    props.setIsAnimating(true)

    const _cordHist = props.cordHist()
    const _state = state()

    const elcIndex = getCurrentElIndex(_cordHist)
    const elc = imgs[elcIndex]

    // don't hide here because we want a better transition
    hires(
      getImagesFromIndexes(imgs, [
        elcIndex,
        getPrevElIndex(_cordHist, _state),
        getNextElIndex(_cordHist, _state)
      ])
    )
    setLoaderForHiresImage(elc)

    const tl = _gsap.timeline()
    const trailInactiveEls = getImagesFromIndexes(
      imgs,
      getTrailInactiveElsIndex(_cordHist, _state)
    )
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
    // eslint-disable-next-line solid/reactivity
    return await tl.then(() => {
      props.setIsAnimating(false)
    })
  }

  const minimizeImage: () => Promise<
    gsap.core.Omit<gsap.core.Timeline, 'then'>
  > = async () => {
    if (!mounted || !gsapLoaded) throw new Error('not mounted or gsap not loaded')

    props.setIsAnimating(true)
    props.setNavVector('none') // cleanup

    const _cordHist = props.cordHist()
    const _state = state()

    const elcIndex = getCurrentElIndex(_cordHist)
    const elsTrailInactiveIndexes = getTrailInactiveElsIndex(_cordHist, _state)

    lores(getImagesFromIndexes(imgs, [...elsTrailInactiveIndexes, elcIndex]))

    const tl = _gsap.timeline()
    const elc = getImagesFromIndexes(imgs, [elcIndex])[0]
    const elsTrailInactive = getImagesFromIndexes(imgs, elsTrailInactiveIndexes)
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
      x: _cordHist.slice(-1)[0].x - window.innerWidth / 2,
      y: _cordHist.slice(-1)[0].y - window.innerHeight / 2
    })
    // show trail inactive
    tl.to(elsTrailInactive, {
      y: '-=20',
      ease: 'power3.out',
      stagger: -0.1,
      duration: 0.3,
      opacity: 1
    })
    // eslint-disable-next-line solid/reactivity
    return await tl.then(() => {
      props.setIsAnimating(false)
    })
  }

  function setLoaderForHiresImage(img: DesktopImage): void {
    if (!mounted || !gsapLoaded) return
    if (!img.complete) {
      props.setIsLoading(true)
      // abort controller for cleanup
      const controller = new AbortController()
      const abortSignal = controller.signal
      // event listeners
      img.addEventListener(
        'load',
        () => {
          _gsap
            .to(img, { opacity: 1, ease: 'power3.out', duration: 0.5 })
            // eslint-disable-next-line solid/reactivity
            .then(() => {
              props.setIsLoading(false)
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
      img.addEventListener(
        'error',
        () => {
          _gsap
            .set(img, { opacity: 1 })
            // eslint-disable-next-line solid/reactivity
            .then(() => {
              props.setIsLoading(false)
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
        .set(img, { opacity: 1 })
        // eslint-disable-next-line solid/reactivity
        .then(() => {
          props.setIsLoading(false)
        })
        .catch((e) => {
          console.log(e)
        })
    }
  }

  onMount(() => {
    // preload logic
    imgs.forEach((img, i) => {
      // preload first 5 images on page load
      if (i < 5) {
        img.src = img.dataset.loUrl
      }
      // lores preloader for rest of the images
      // eslint-disable-next-line solid/reactivity
      onMutation(img, (mutation) => {
        // if open or animating, hold
        if (props.isOpen() || props.isAnimating()) return false
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
    // load gsap on mousemove
    window.addEventListener(
      'mousemove',
      () => {
        loadGsap()
          .then((g) => {
            _gsap = g
            gsapLoaded = true
          })
          .catch((e) => {
            console.log(e)
          })
      },
      { passive: true, once: true }
    )
    // event listeners
    abortController = new AbortController()
    const abortSignal = abortController.signal
    window.addEventListener('mousemove', onMouse, {
      passive: true,
      signal: abortSignal
    })
    // mounted
    mounted = true
  })

  createEffect(
    on(
      () => props.cordHist(),
      () => {
        setPosition()
      },
      { defer: true }
    )
  )

  createEffect(
    on(
      () => props.isOpen(),
      async () => {
        if (props.isAnimating()) return
        if (props.isOpen()) {
          // expand image
          await expandImage()
            .catch(() => {
              void 0
            })
            // eslint-disable-next-line solid/reactivity
            .then(() => {
              // abort controller for cleanup
              abortController?.abort()
            })
        } else {
          // minimize image
          await minimizeImage()
            .catch(() => {
              void 0
            })
            // eslint-disable-next-line solid/reactivity
            .then(() => {
              // event listeners and its abort controller
              abortController = new AbortController()
              const abortSignal = abortController.signal
              window.addEventListener('mousemove', onMouse, {
                passive: true,
                signal: abortSignal
              })
              // cleanup isLoading
              props.setIsLoading(false)
            })
        }
      },
      { defer: true }
    )
  )

  return (
    <>
      <div class="stage" onClick={onClick} onKeyDown={onClick}>
        <For each={props.ijs}>
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
