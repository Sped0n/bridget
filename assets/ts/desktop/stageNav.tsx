import { For, createEffect, createMemo, on, onCleanup, type JSX } from 'solid-js'

import { useImageState } from '../imageState'
import { decrement, increment } from '../utils'

import { useDesktopState } from './state'

export default function StageNav(props: {
  children?: JSX.Element
  prevText: string
  closeText: string
  nextText: string
}): JSX.Element {
  // types
  type NavItem = (typeof navItems)[number]

  // variables
  let controller: AbortController | undefined
  // eslint-disable-next-line solid/reactivity
  const navItems = [props.prevText, props.closeText, props.nextText] as const

  // states
  const imageState = useImageState()
  const [
    desktop,
    { incIndex, decIndex, setCordHist, setHoverText, setIsOpen, setNavVector }
  ] = useDesktopState()

  const active = createMemo(() => desktop.isOpen() && !desktop.isAnimating())

  const prevImage: () => void = () => {
    setNavVector('prev')
    setCordHist((c) =>
      c.map((item) => {
        return { ...item, i: decrement(item.i, imageState().length) }
      })
    )
    decIndex()
  }

  const closeImage: () => void = () => {
    setIsOpen(false)
  }

  const nextImage: () => void = () => {
    setNavVector('next')
    setCordHist((c) =>
      c.map((item) => {
        return { ...item, i: increment(item.i, imageState().length) }
      })
    )
    incIndex()
  }

  const handleClick: (item: NavItem) => void = (item) => {
    if (!desktop.isOpen() || desktop.isAnimating()) return
    if (item === navItems[0]) prevImage()
    else if (item === navItems[1]) closeImage()
    else nextImage()
  }

  const handleKey: (e: KeyboardEvent) => void = (e) => {
    if (!desktop.isOpen() || desktop.isAnimating()) return
    if (e.key === 'ArrowLeft') prevImage()
    else if (e.key === 'Escape') closeImage()
    else if (e.key === 'ArrowRight') nextImage()
  }

  createEffect(
    on(desktop.isOpen, (isOpen) => {
      controller?.abort()

      if (isOpen) {
        controller = new AbortController()
        const abortSignal = controller.signal
        window.addEventListener('keydown', handleKey, {
          passive: true,
          signal: abortSignal
        })
      }
    })
  )

  onCleanup(() => {
    controller?.abort()
  })

  return (
    <>
      <div class="navOverlay" classList={{ active: active() }}>
        <For each={navItems}>
          {(item) => (
            <div
              class="overlay"
              onClick={() => {
                handleClick(item)
              }}
              onFocus={() => setHoverText(item)}
              onMouseOver={() => setHoverText(item)}
              tabIndex="-1"
            />
          )}
        </For>
      </div>
    </>
  )
}
