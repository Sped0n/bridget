import { For, createEffect, on, onMount, type JSX } from 'solid-js'

import { useImageState } from '../imageState'

import type { MobileImage } from './layout'
import { useMobileState } from './state'

function getRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function onIntersection<T extends HTMLElement>(
  element: T,
  trigger: (arg0: IntersectionObserverEntry) => boolean
): void {
  new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (trigger(entry)) {
        observer.disconnect()
        break
      }
    }
  }).observe(element)
}

export default function Collection(): JSX.Element {
  // variables
  const imageState = useImageState()
  const imgs: MobileImage[] = Array<MobileImage>(imageState().length)

  // states
  const [mobile, { setIndex, setIsOpen }] = useMobileState()

  // helper functions
  const handleClick: (i: number) => void = (i) => {
    if (mobile.isAnimating()) return
    setIndex(i)
    setIsOpen(true)
  }

  const scrollToActive: () => void = () => {
    const index = mobile.index()

    if (index < 0) return
    imgs[index].scrollIntoView({ behavior: 'auto', block: 'center' })
  }

  // effects
  onMount(() => {
    imgs.forEach((img, i) => {
      // preload first 5 images on page load
      if (i < 5) {
        img.src = img.dataset.src
      }
      // event listeners
      img.addEventListener(
        'click',
        () => {
          handleClick(i)
        },
        { passive: true }
      )
      img.addEventListener(
        'keydown',
        () => {
          handleClick(i)
        },
        { passive: true }
      )
      // preload
      onIntersection(img, (entry) => {
        // no intersection, hold
        if (entry.intersectionRatio <= 0) return false
        // preload the i + 5th image, if it exists
        if (i + 5 < imgs.length) {
          imgs[i + 5].src = imgs[i + 5].dataset.src
        }
        // triggered
        return true
      })
    })
  })

  createEffect(
    on(
      mobile.isOpen,
      () => {
        if (!mobile.isOpen()) scrollToActive() // scroll to active when closed
      },
      { defer: true }
    )
  )

  return (
    <>
      <div class="collection">
        <For each={imageState().images}>
          {(ij, i) => (
            <img
              ref={imgs[i()]}
              height={ij.loImgH}
              width={ij.loImgW}
              data-src={ij.loUrl}
              alt={ij.alt}
              style={{
                transform: `translate3d(${i() !== 0 ? getRandom(-25, 25) : 0}%, ${i() !== 0 ? getRandom(-35, 35) : 0}%, 0)`
              }}
              onClick={() => {
                handleClick(i())
              }}
              onKeyDown={() => {
                handleClick(i())
              }}
            />
          )}
        </For>
      </div>
    </>
  )
}
