import {
  createContext,
  createMemo,
  useContext,
  type Accessor,
  type JSX
} from 'solid-js'
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

  return (
    <ImageStateContext.Provider value={state}>
      {props.children}
    </ImageStateContext.Provider>
  )
}

export function useImageState(): ImageStateContextType {
  const context = useContext(ImageStateContext)
  invariant(context, 'undefined image context')
  return context
}
