import { For, createEffect, type Accessor, type JSX, type Setter } from 'solid-js'

import { useState } from '../state'
import { decrement, increment, type Vector } from '../utils'

import type { HistoryItem } from './layout'

export default function StageNav(props: {
  children?: JSX.Element
  prevText: string
  closeText: string
  nextText: string
  loadingText: string
  active: Accessor<boolean>
  isAnimating: Accessor<boolean>
  setCordHist: Setter<HistoryItem[]>
  isOpen: Accessor<boolean>
  setIsOpen: Setter<boolean>
  setHoverText: Setter<string>
  navVector: Accessor<Vector>
  setNavVector: Setter<Vector>
}): JSX.Element {
  // types
  type NavItem = (typeof navItems)[number]

  // variables
  let controller: AbortController | undefined
  // eslint-disable-next-line solid/reactivity
  const navItems = [props.prevText, props.closeText, props.nextText] as const

  // states
  const [state, { incIndex, decIndex }] = useState()

  const stateLength = state().length

  const prevImage: () => void = () => {
    props.setNavVector('prev')
    props.setCordHist((c) =>
      c.map((item) => {
        return { ...item, i: decrement(item.i, stateLength) }
      })
    )
    decIndex()
  }

  const closeImage: () => void = () => {
    props.setIsOpen(false)
  }

  const nextImage: () => void = () => {
    props.setNavVector('next')
    props.setCordHist((c) =>
      c.map((item) => {
        return { ...item, i: increment(item.i, stateLength) }
      })
    )
    incIndex()
  }

  const handleClick: (item: NavItem) => void = (item) => {
    if (!props.isOpen() || props.isAnimating()) return
    if (item === navItems[0]) prevImage()
    else if (item === navItems[1]) closeImage()
    else nextImage()
  }

  const handleKey: (e: KeyboardEvent) => void = (e) => {
    if (!props.isOpen() || props.isAnimating()) return
    if (e.key === 'ArrowLeft') prevImage()
    else if (e.key === 'Escape') closeImage()
    else if (e.key === 'ArrowRight') nextImage()
  }

  createEffect(() => {
    if (props.isOpen()) {
      controller = new AbortController()
      const abortSignal = controller.signal
      window.addEventListener('keydown', handleKey, {
        passive: true,
        signal: abortSignal
      })
    } else {
      controller?.abort()
    }
  })

  return (
    <>
      <div class="navOverlay" classList={{ active: props.active() }}>
        <For each={navItems}>
          {(item) => (
            <div
              class="overlay"
              onClick={() => {
                handleClick(item)
              }}
              onFocus={() => props.setHoverText(item)}
              onMouseOver={() => props.setHoverText(item)}
              tabIndex="-1"
            />
          )}
        </For>
      </div>
    </>
  )
}
