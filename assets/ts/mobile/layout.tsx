import { Show, createSignal, type JSX, type Setter } from 'solid-js'

import type { ImageJSON } from '../resources'

import Collection from './collection'
import Gallery from './gallery'

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
  ijs: ImageJSON[]
  closeText: string
  loadingText: string
  setScrollable: Setter<boolean>
}): JSX.Element {
  // states
  const [isOpen, setIsOpen] = createSignal(false)
  const [isAnimating, setIsAnimating] = createSignal(false)

  return (
    <>
      <Show when={props.ijs.length > 0}>
        <Collection
          ijs={props.ijs}
          isAnimating={isAnimating}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
        <Gallery
          ijs={props.ijs}
          closeText={props.closeText}
          loadingText={props.loadingText}
          isAnimating={isAnimating}
          setIsAnimating={setIsAnimating}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          setScrollable={props.setScrollable}
        />
      </Show>
    </>
  )
}
