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
  const [fullStatus, setFullStatus] = createSignal<ImageStatus | 'ready-with-fade'>(
    'loading'
  )
  const fadeFromLoading = () => fullStatus() === 'ready-with-fade'
  const showFull = createMemo(
    () =>
      fullStatus() === 'ready' ||
      fadeFromLoading() ||
      // Let the browser show the full image's alt text if neither rendition loads.
      (fullStatus() === 'failed' && thumbnailStatus() === 'failed')
  )
  const showThumbnail = () => !showFull() && thumbnailStatus() === 'ready'

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
        () =>
          setFullStatus(thumbnailStatus() === 'ready' ? 'ready' : 'ready-with-fade'),
        () => setFullStatus('failed')
      )
    }
  )

  return (
    <div class={['slideContainer', fadeFromLoading() && 'fadeFromLoading']}>
      <img
        ref={fullImage}
        class={['fullImage', !showFull() && 'unrevealed']}
        height={props.ij.hiImgH}
        width={props.ij.hiImgW}
        alt={props.ij.alt}
      />
      <img ref={thumbnail} class="thumbnail" alt="" hidden={!showThumbnail()} />
      <div
        class="loadingText"
        aria-hidden={fadeFromLoading() ? 'true' : undefined}
        hidden={(showFull() && !fadeFromLoading()) || showThumbnail()}
      >
        {props.loadingText}
      </div>
    </div>
  )
}
