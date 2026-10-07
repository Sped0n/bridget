import { type JSX } from '@solidjs/web'
import { Show, createEffect, onCleanup } from 'solid-js'

import { useImageState } from '../imageState'

import Collection from './collection'
import Gallery from './gallery'
import { useMobileState } from './state'

/**
 * interfaces
 */

export interface MobileImage extends HTMLImageElement {
  dataset: {
    src: string
    index: string
  }
}

export default function Mobile(props: {
  children?: JSX.Element
  closeText: string
  loadingText: string
}): JSX.Element {
  const imageState = useImageState()
  const [mobile] = useMobileState()

  createEffect(mobile.isScrollLocked, (isScrollLocked) => {
    const container = document.getElementsByClassName('container').item(0)
    if (container === null) return

    container.classList.toggle('disableScroll', isScrollLocked)
  })

  onCleanup(() => {
    const container = document.getElementsByClassName('container').item(0)
    container?.classList.remove('disableScroll')
  })

  return (
    <>
      <Show when={imageState().length > 0}>
        <Collection />
        <Gallery closeText={props.closeText} loadingText={props.loadingText} />
      </Show>
    </>
  )
}
