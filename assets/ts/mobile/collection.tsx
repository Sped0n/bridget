import { type JSX } from '@solidjs/web'
import { For, createEffect, createMemo, onCleanup, onSettled } from 'solid-js'

import { useImageState } from '../imageState'
import { useMobileState } from './state'

const PRELOAD_AHEAD = 5

function getRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default function Collection(): JSX.Element {
  const { images } = useImageState()()
  const thumbnails: HTMLButtonElement[] = []
  const imgs: HTMLImageElement[] = []
  const [mobile, { open }] = useMobileState()
  const canFocusThumbnails = createMemo(() => mobile().phase === 'closed')

  onSettled(() => {
    const indexes = new Map<Element, number>()
    const loadThumbnail = (index: number): void => {
      const img = imgs[index]
      if (img && !img.hasAttribute('src')) img.src = images[index].loUrl
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.intersectionRatio <= 0) continue
        const index = indexes.get(entry.target)
        if (index === undefined) continue
        loadThumbnail(index)
        loadThumbnail(index + PRELOAD_AHEAD)
        observer.unobserve(entry.target)
        indexes.delete(entry.target)
      }
    })
    onCleanup(() => observer.disconnect())

    for (const [index, img] of imgs.entries()) {
      if (index < PRELOAD_AHEAD) loadThumbnail(index)
      indexes.set(img, index)
      observer.observe(img)
    }
  })

  createEffect(mobile, (state, previous) => {
    if (state.phase === 'closing' && state.index !== state.openingIndex) {
      thumbnails[state.index]?.scrollIntoView({ behavior: 'auto', block: 'center' })
    }
    if (
      state.phase === 'closed' &&
      previous?.phase === 'closing' &&
      previous.restoreFocus
    ) {
      thumbnails[previous.index]?.focus({ preventScroll: true })
    }
  })

  return (
    <div class="collection">
      <For each={images}>
        {(image, i) => {
          const transform =
            i() === 0
              ? 'translate3d(0%, 0%, 0)'
              : `translate3d(${getRandom(-25, 25)}%, ${getRandom(-35, 35)}%, 0)`

          return (
            <button
              ref={thumbnails[i()]}
              type="button"
              tabindex={canFocusThumbnails() ? undefined : -1}
              style={{ transform }}
              onClick={(event) =>
                open(i(), event.currentTarget.matches(':focus-visible'))
              }
            >
              <img
                ref={imgs[i()]}
                height={image.loImgH}
                width={image.loImgW}
                loading={i() === 0 ? 'eager' : 'lazy'}
                alt={image.alt}
              />
            </button>
          )
        }}
      </For>
    </div>
  )
}
