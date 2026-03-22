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
import { decrement, increment, type Vector } from '../utils'

export interface HistoryItem {
  i: number
  x: number
  y: number
}

export interface DesktopState {
  index: Accessor<number>
  cordHist: Accessor<HistoryItem[]>
  hoverText: Accessor<string>
  isOpen: Accessor<boolean>
  isAnimating: Accessor<boolean>
  isLoading: Accessor<boolean>
  navVector: Accessor<Vector>
}

export type DesktopStateContextType = readonly [
  DesktopState,
  {
    readonly setIndex: Setter<number>
    readonly incIndex: () => void
    readonly decIndex: () => void
    readonly setCordHist: Setter<HistoryItem[]>
    readonly setHoverText: Setter<string>
    readonly setIsOpen: Setter<boolean>
    readonly setIsAnimating: Setter<boolean>
    readonly setIsLoading: Setter<boolean>
    readonly setNavVector: Setter<Vector>
  }
]

const DesktopStateContext = createContext<DesktopStateContextType>()

export function DesktopStateProvider(props: { children?: JSX.Element }): JSX.Element {
  const imageState = useImageState()

  const [index, setIndex] = createSignal(-1)
  const [cordHist, setCordHist] = createSignal<HistoryItem[]>([])
  const [hoverText, setHoverText] = createSignal('')
  const [isOpen, setIsOpen] = createSignal(false)
  const [isAnimating, setIsAnimating] = createSignal(false)
  const [isLoading, setIsLoading] = createSignal(false)
  const [navVector, setNavVector] = createSignal<Vector>('none')

  const updateIndex = (stride: 1 | -1): void => {
    const length = imageState().length
    if (length <= 0) return
    setIndex((current) =>
      stride === 1 ? increment(current, length) : decrement(current, length)
    )
  }

  return createComponent(DesktopStateContext.Provider, {
    value: [
      { index, cordHist, hoverText, isOpen, isAnimating, isLoading, navVector },
      {
        setIndex,
        incIndex: () => {
          updateIndex(1)
        },
        decIndex: () => {
          updateIndex(-1)
        },
        setCordHist,
        setHoverText,
        setIsOpen,
        setIsAnimating,
        setIsLoading,
        setNavVector
      }
    ],
    get children() {
      return props.children
    }
  })
}

export function useDesktopState(): DesktopStateContextType {
  const context = useContext(DesktopStateContext)
  invariant(context, 'undefined desktop context')
  return context
}
