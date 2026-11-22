import { type JSX } from '@solidjs/web'
import {
  createComponent,
  createContext,
  createMemo,
  createSignal,
  useContext,
  type Accessor,
  type Setter
} from 'solid-js'

import { useImageState } from '../imageState'
import { invariant } from '../invariant'
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
    readonly navigate: (direction: 'prev' | 'next') => void
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

  const [cordHist, setCordHist] = createSignal<HistoryItem[]>([])
  const index = createMemo(() => cordHist().at(-1)?.i ?? -1)
  const [hoverText, setHoverText] = createSignal('')
  const [isOpen, setIsOpen] = createSignal(false)
  const [isAnimating, setIsAnimating] = createSignal(false)
  const [isLoading, setIsLoading] = createSignal(false)
  const [navVector, setNavVector] = createSignal<Vector>('none')

  const navigate = (direction: 'prev' | 'next'): void => {
    const step = direction === 'prev' ? decrement : increment
    const length = imageState().length
    setNavVector(direction)
    setCordHist((trail) => trail.map((item) => ({ ...item, i: step(item.i, length) })))
  }

  return createComponent(DesktopStateContext, {
    value: [
      { index, cordHist, hoverText, isOpen, isAnimating, isLoading, navVector },
      {
        navigate,
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
