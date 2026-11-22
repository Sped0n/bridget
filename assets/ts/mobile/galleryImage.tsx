import { type JSX } from '@solidjs/web'
import { createEffect, createSignal } from 'solid-js'

import type { ImageJSON } from '../resources'

export default function GalleryImage(props: {
  load: boolean
  selected: boolean
  ij: ImageJSON
  loadingText: string
}): JSX.Element {
  let img: HTMLImageElement | undefined
  const [status, setStatus] = createSignal<'loading' | 'ready' | 'fade-in'>('loading')

  const reveal = (loaded: boolean): void => {
    setStatus((current) => {
      if (current !== 'loading') return current
      return loaded && props.selected ? 'fade-in' : 'ready'
    })
  }

  createEffect(
    () => props.load,
    (load) => {
      if (load && img?.complete && img.hasAttribute('src')) reveal(img.naturalWidth > 0)
    }
  )

  return (
    <div class={['slideContainer', status()]}>
      <img
        ref={img}
        src={props.load ? props.ij.hiUrl : undefined}
        height={props.ij.hiImgH}
        width={props.ij.hiImgW}
        alt={props.ij.alt}
        onLoad={() => reveal(true)}
        onError={() => reveal(false)}
      />
      <div class="loadingText">{props.loadingText}</div>
    </div>
  )
}
