import { type JSX } from '@solidjs/web'
import { createContext, createMemo, useContext, type Accessor } from 'solid-js'
import invariant from 'tiny-invariant'

import type { ImageJSON } from './resources'

export interface ImageState {
  images: ImageJSON[]
  length: number
}

type ImageStateContextType = Accessor<ImageState>

const ImageStateContext = createContext<ImageStateContextType>()

export function ImageStateProvider(props: {
  children?: JSX.Element
  images: ImageJSON[]
}): JSX.Element {
  const state = createMemo<ImageState>(() => ({
    images: props.images,
    length: props.images.length
  }))

  return <ImageStateContext value={state}>{props.children}</ImageStateContext>
}

export function useImageState(): ImageStateContextType {
  const context = useContext(ImageStateContext)
  invariant(context, 'undefined image context')
  return context
}
