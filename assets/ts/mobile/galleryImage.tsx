import { type JSX } from '@solidjs/web'
import { createEffect, createMemo, createSignal } from 'solid-js'

import type { ImageJSON } from '../resources'

type ImageStatus = 'loading' | 'ready' | 'failed'

export default function GalleryImage(props: {
  load: boolean
  ij: ImageJSON
  loadingText: string
}): JSX.Element {
  let thumbnail: HTMLImageElement | undefined
  let fullImage: HTMLImageElement | undefined
  const [thumbnailStatus, setThumbnailStatus] = createSignal<ImageStatus>('loading')
  const [fullStatus, setFullStatus] = createSignal<ImageStatus>('loading')
  const visibleImage = createMemo(() => {
    if (fullStatus() === 'ready') return 'full'
    if (thumbnailStatus() === 'ready') return 'thumbnail'
    if (fullStatus() === 'failed' && thumbnailStatus() === 'failed') return 'error'
    return 'none'
  })
  const hasImage = () => visibleImage() === 'full' || visibleImage() === 'thumbnail'

  createEffect(
    () => props.load,
    (load) => {
      if (!load || !thumbnail || !fullImage) return

      thumbnail.src = props.ij.loUrl
      fullImage.src = props.ij.hiUrl
      void thumbnail.decode().then(
        () => setThumbnailStatus('ready'),
        () => setThumbnailStatus('failed')
      )
      void fullImage.decode().then(
        () => setFullStatus('ready'),
        () => setFullStatus('failed')
      )
    }
  )

  return (
    <div class={['slideContainer', hasImage() && 'imageReady']}>
      <div class={['slideImage', visibleImage() === 'none' && 'unrevealed']}>
        <img
          ref={fullImage}
          class={['fullImage', visibleImage() === 'thumbnail' && 'unrevealed']}
          height={props.ij.hiImgH}
          width={props.ij.hiImgW}
          alt={props.ij.alt}
        />
        <img
          ref={thumbnail}
          class="thumbnail"
          alt=""
          hidden={visibleImage() !== 'thumbnail'}
        />
      </div>
      <div
        class="loadingText"
        aria-hidden={hasImage() ? 'true' : undefined}
        hidden={visibleImage() === 'error'}
      >
        {props.loadingText}
      </div>
    </div>
  )
}
