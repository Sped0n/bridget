import {
  createComponent,
  createContext,
  createSignal,
  useContext,
  type Accessor,
  type JSX,
  type Setter
} from 'solid-js'
import invariant from 'tiny-invariant'

import { useImageState } from '../imageState'
import { decrement, increment } from '../utils'

export interface MobileState {
  index: Accessor<number>
  isOpen: Accessor<boolean>
  isAnimating: Accessor<boolean>
  isScrollLocked: Accessor<boolean>
}

export type MobileStateContextType = readonly [
  MobileState,
  {
    readonly setIndex: Setter<number>
    readonly incIndex: () => void
    readonly decIndex: () => void
    readonly setIsOpen: Setter<boolean>
    readonly setIsAnimating: Setter<boolean>
    readonly setIsScrollLocked: Setter<boolean>
  }
]

const MobileStateContext = createContext<MobileStateContextType>()

export function MobileStateProvider(props: { children?: JSX.Element }): JSX.Element {
  const imageState = useImageState()

  const [index, setIndex] = createSignal(-1)
  const [isOpen, setIsOpen] = createSignal(false)
  const [isAnimating, setIsAnimating] = createSignal(false)
  const [isScrollLocked, setIsScrollLocked] = createSignal(false)

  const updateIndex = (stride: 1 | -1): void => {
    const length = imageState().length
    if (length <= 0) return
    setIndex((current) =>
      stride === 1 ? increment(current, length) : decrement(current, length)
    )
  }

  return createComponent(MobileStateContext.Provider, {
    value: [
      { index, isOpen, isAnimating, isScrollLocked },
      {
        setIndex,
        incIndex: () => {
          updateIndex(1)
        },
        decIndex: () => {
          updateIndex(-1)
        },
        setIsOpen,
        setIsAnimating,
        setIsScrollLocked
      }
    ],
    get children() {
      return props.children
    }
  })
}

export function useMobileState(): MobileStateContextType {
  const context = useContext(MobileStateContext)
  invariant(context, 'undefined mobile context')
  return context
}
