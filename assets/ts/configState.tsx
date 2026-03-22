import {
  createContext,
  createMemo,
  createSignal,
  useContext,
  type Accessor,
  type JSX
} from 'solid-js'
import invariant from 'tiny-invariant'

import { getThresholdSessionIndex } from './utils'

export interface ThresholdRelated {
  threshold: number
  trailLength: number
}

export interface ConfigState {
  thresholdIndex: number
  threshold: number
  trailLength: number
}

export type ConfigStateContextType = readonly [
  Accessor<ConfigState>,
  {
    readonly incThreshold: () => void
    readonly decThreshold: () => void
  }
]

const thresholds: ThresholdRelated[] = [
  { threshold: 20, trailLength: 20 },
  { threshold: 40, trailLength: 10 },
  { threshold: 80, trailLength: 5 },
  { threshold: 140, trailLength: 5 },
  { threshold: 200, trailLength: 5 }
]

const ConfigStateContext = createContext<ConfigStateContextType>()

function getSafeThresholdIndex(): number {
  const index = getThresholdSessionIndex()
  if (index < 0 || index >= thresholds.length) return 2
  return index
}

export function ConfigStateProvider(props: { children?: JSX.Element }): JSX.Element {
  const [thresholdIndex, setThresholdIndex] = createSignal(getSafeThresholdIndex())

  const state = createMemo<ConfigState>(() => {
    const current = thresholds[thresholdIndex()]

    return {
      thresholdIndex: thresholdIndex(),
      threshold: current.threshold,
      trailLength: current.trailLength
    }
  })

  const updateThreshold = (stride: number): void => {
    const nextIndex = thresholdIndex() + stride
    if (nextIndex < 0 || nextIndex >= thresholds.length) return
    sessionStorage.setItem('thresholdsIndex', nextIndex.toString())
    setThresholdIndex(nextIndex)
  }

  return (
    <ConfigStateContext.Provider
      value={[
        state,
        {
          incThreshold: () => {
            updateThreshold(1)
          },
          decThreshold: () => {
            updateThreshold(-1)
          }
        }
      ]}
    >
      {props.children}
    </ConfigStateContext.Provider>
  )
}

export function useConfigState(): ConfigStateContextType {
  const context = useContext(ConfigStateContext)
  invariant(context, 'undefined config context')
  return context
}
