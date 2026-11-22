import { type JSX } from '@solidjs/web'
import {
  createComponent,
  createContext,
  createSignal,
  useContext,
  type Accessor
} from 'solid-js'

import { invariant } from '../invariant'

interface Selection {
  openingIndex: number
  index: number
  restoreFocus: boolean
}

type MobileState =
  | { phase: 'closed' }
  | ({ phase: 'opening' | 'open' | 'closing' } & Selection)

type MobileContext = readonly [
  Accessor<MobileState>,
  {
    open: (index: number, restoreFocus: boolean) => void
    select: (index: number) => void
    close: () => void
    finishOpening: () => void
    cancelOpening: () => void
    finishClosing: () => void
  }
]

const MobileStateContext = createContext<MobileContext>()

export function MobileStateProvider(props: { children?: JSX.Element }): JSX.Element {
  const [state, setState] = createSignal<MobileState>({ phase: 'closed' })

  return createComponent(MobileStateContext, {
    value: [
      state,
      {
        open(index, restoreFocus) {
          setState((current) =>
            current.phase === 'closed'
              ? { phase: 'opening', openingIndex: index, index, restoreFocus }
              : current
          )
        },
        select(index) {
          setState((current) =>
            current.phase === 'open' && current.index !== index
              ? { ...current, index }
              : current
          )
        },
        close() {
          setState((current) =>
            current.phase === 'open' ? { ...current, phase: 'closing' } : current
          )
        },
        finishOpening() {
          setState((current) =>
            current.phase === 'opening' ? { ...current, phase: 'open' } : current
          )
        },
        cancelOpening() {
          setState((current) =>
            current.phase === 'opening' ? { phase: 'closed' } : current
          )
        },
        finishClosing() {
          setState((current) =>
            current.phase === 'closing' ? { phase: 'closed' } : current
          )
        }
      }
    ],
    get children() {
      return props.children
    }
  })
}

export function useMobileState(): MobileContext {
  const context = useContext(MobileStateContext)
  invariant(context, 'undefined mobile context')
  return context
}
