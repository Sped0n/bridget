import { type JSX } from '@solidjs/web'
import { Show, createEffect, onCleanup } from 'solid-js'

import { useImageState } from '../imageState'
import Collection from './collection'
import Gallery from './gallery'
import { useMobileState } from './state'

export default function Mobile(props: {
  children?: JSX.Element
  closeText: string
  loadingText: string
}): JSX.Element {
  const imageState = useImageState()
  const [mobile] = useMobileState()

  const container = document.querySelector('.container')
  createEffect(
    () => mobile().phase === 'open' || mobile().phase === 'closing',
    (locked) => {
      container?.classList.toggle('disableScroll', locked)
    }
  )

  onCleanup(() => container?.classList.remove('disableScroll'))

  return (
    <>
      <Show when={imageState().length > 0}>
        <Collection />
        <Gallery closeText={props.closeText} loadingText={props.loadingText} />
      </Show>
    </>
  )
}
