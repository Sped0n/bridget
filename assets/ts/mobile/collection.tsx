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
import { useState } from '../state'

import type { MobileImage } from './layout'

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

export default function Collection(props: {
  children?: JSX.Element
  ijs: ImageJSON[]
  isAnimating: Accessor<boolean>
  isOpen: Accessor<boolean>
  setIsOpen: Setter<boolean>
}): JSX.Element {
  // variables
  // eslint-disable-next-line solid/reactivity
  const imgs: MobileImage[] = Array<MobileImage>(props.ijs.length)

  // states
  const [state, { setIndex }] = useState()

  // helper functions
  const handleClick: (i: number) => void = (i) => {
    if (props.isAnimating()) return
    setIndex(i)
    props.setIsOpen(true)
  }

  const scrollToActive: () => void = () => {
    imgs[state().index].scrollIntoView({ behavior: 'auto', block: 'center' })
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
      () => {
        props.isOpen()
      },
      () => {
        if (!props.isOpen()) scrollToActive() // scroll to active when closed
      },
      { defer: true }
    )
  )

  return (
    <>
      <div class="collection">
        <For each={props.ijs}>
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
