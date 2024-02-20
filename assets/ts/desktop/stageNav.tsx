import { type Accessor, type JSX, type Setter } from 'solid-js'

import { useState } from '../state'
import { decrement, increment, type Vector } from '../utils'
import type { HistoryItem } from './layout'

export function StageNav(props: {
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
  const navItems = [props.prevText, props.closeText, props.nextText] as const

  // states
  const [state, { incIndex, decIndex }] = useState()

  const stateLength = state().length

  const prevImage = () => {
    props.setNavVector('prev')
    props.setCordHist((c) =>
      c.map((item) => {
        return { ...item, i: decrement(item.i, stateLength) }
      })
    )
    decIndex()
  }

  const closeImage = () => {
    props.setIsOpen(false)
  }

  const nextImage = () => {
    props.setNavVector('next')
    props.setCordHist((c) =>
      c.map((item) => {
        return { ...item, i: increment(item.i, stateLength) }
      })
    )
    incIndex()
  }

  const handleClick = (item: NavItem) => {
    if (!props.isOpen() || props.isAnimating()) return
    if (item === navItems[0]) prevImage()
    else if (item === navItems[1]) closeImage()
    else nextImage()
  }

  const handleKey = (e: KeyboardEvent) => {
    if (!props.isOpen() || props.isAnimating()) return
    if (e.key === 'ArrowLeft') prevImage()
    else if (e.key === 'Escape') closeImage()
    else if (e.key === 'ArrowRight') nextImage()
  }

  return (
    <>
      <div class="navOverlay" classList={{ active: props.active() }}>
        {navItems.map((item) => (
          <div
            class="overlay"
            onClick={() => handleClick(item)}
            onKeyDown={handleKey}
            onFocus={() => props.setHoverText(item)}
            onMouseOver={() => props.setHoverText(item)}
          ></div>
        ))}
      </div>
    </>
  )
}
