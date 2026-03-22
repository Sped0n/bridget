import { Show, createEffect, onCleanup, type JSX } from 'solid-js'

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

  createEffect(() => {
    const container = document.getElementsByClassName('container').item(0)
    if (container === null) return

    if (mobile.isScrollLocked()) {
      container.classList.add('disableScroll')
    } else {
      container.classList.remove('disableScroll')
    }
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
