import {
  createContext,
  createSignal,
  useContext,
  type Accessor,
  type JSX,
  type Setter
} from 'solid-js'
import { decrement, getThresholdSessionIndex, increment } from './utils'

/**
 * interfaces and types
 */

export interface ThresholdRelated {
  threshold: number
  trailLength: number
}

export interface State {
  index: number
  length: number
  threshold: number
  trailLength: number
}

export type StateContextType = ReturnType<typeof makeStateContext>

/**
 * constants
 */

const thresholds: ThresholdRelated[] = [
    { threshold: 20, trailLength: 20 },
    { threshold: 40, trailLength: 10 },
    { threshold: 80, trailLength: 5 },
    { threshold: 140, trailLength: 5 },
    { threshold: 200, trailLength: 5 }
  ],
  makeStateContext = (state: Accessor<State>, setState: Setter<State>) => {
    return [
      state,
      {
        setIndex: (index: number) => {
          setState((s) => {
            return { ...s, index }
          })
        },
        incIndex: () => {
          setState((s) => {
            return { ...s, index: increment(s.index, s.length) }
          })
        },
        decIndex: () => {
          setState((s) => {
            return { ...s, index: decrement(s.index, s.length) }
          })
        },
        incThreshold: () => {
          setState((s) => {
            return { ...s, ...updateThreshold(s.threshold, thresholds, 1) }
          })
        },
        decThreshold: () => {
          setState((s) => {
            return { ...s, ...updateThreshold(s.threshold, thresholds, -1) }
          })
        }
      }
    ] as const
  },
  StateContext = createContext<StateContextType>()

/**
 * helper functions
 */

function updateThreshold(
  currentThreshold: number,
  thresholds: ThresholdRelated[],
  stride: number
): ThresholdRelated {
  const i = thresholds.findIndex((t) => t.threshold === currentThreshold) + stride
  if (i < 0 || i >= thresholds.length) return thresholds[i - stride]
  // storage the index so we can restore it even if we go to another page
  sessionStorage.setItem('thresholdsIndex', i.toString())
  return thresholds[i]
}

/**
 * StateProvider
 */

export function StateProvider(props: { children?: JSX.Element; length: number }) {
  const defaultState: State = {
    index: -1,
    length: props.length,
    threshold: thresholds[getThresholdSessionIndex()].threshold,
    trailLength: thresholds[getThresholdSessionIndex()].trailLength
  }

  const [state, setState] = createSignal(defaultState),
    contextValue = makeStateContext(state, setState)
  return (
    <StateContext.Provider value={contextValue}>{props.children}</StateContext.Provider>
  )
}

/**
 * use context
 */

export function useState(): StateContextType {
  return useContext(StateContext)!
}
