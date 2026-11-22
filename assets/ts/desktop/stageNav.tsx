import { type JSX } from '@solidjs/web'
import { For, createEffect, createMemo, onCleanup } from 'solid-js'

import { useDesktopState } from './state'

export default function StageNav(props: {
  children?: JSX.Element
  prevText: string
  closeText: string
  nextText: string
}): JSX.Element {
  let controller: AbortController | undefined
  const navItems = [
    { action: 'prev', text: props.prevText },
    { action: 'close', text: props.closeText },
    { action: 'next', text: props.nextText }
  ] as const
  const [desktop, { navigate, setHoverText, setIsOpen }] = useDesktopState()

  const active = createMemo(() => desktop.isOpen() && !desktop.isAnimating())

  const handleAction = (action: (typeof navItems)[number]['action']): void => {
    if (!active()) return
    if (action === 'close') setIsOpen(false)
    else navigate(action)
  }

  const handleKey = (event: KeyboardEvent): void => {
    if (event.key === 'ArrowLeft') handleAction('prev')
    else if (event.key === 'Escape') handleAction('close')
    else if (event.key === 'ArrowRight') handleAction('next')
  }

  createEffect(desktop.isOpen, (isOpen) => {
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

  onCleanup(() => {
    controller?.abort()
  })

  return (
    <>
      <div class={['navOverlay', { active: active() }]}>
        <For each={navItems}>
          {(item) => (
            <div
              class="overlay"
              onClick={() => handleAction(item.action)}
              onFocus={() => setHoverText(item.text)}
              onMouseOver={() => setHoverText(item.text)}
              tabindex="-1"
            />
          )}
        </For>
      </div>
    </>
  )
}
