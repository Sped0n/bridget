import { type JSX } from '@solidjs/web'
import {
  createContext,
  createMemo,
  createSignal,
  useContext,
  type Accessor
} from 'solid-js'

import { invariant } from './invariant'

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

const THRESHOLD_STORAGE_KEY = 'thresholdsIndex'

function getInitialThresholdIndex(): number {
  try {
    const storedIndex = sessionStorage.getItem(THRESHOLD_STORAGE_KEY)
    if (storedIndex !== null) {
      const index = Number.parseInt(storedIndex, 10)
      if (index >= 0 && index < thresholds.length) return index
    }
  } catch {
    // The gallery still works when storage is unavailable.
  }
  return 2
}

export function ConfigStateProvider(props: { children?: JSX.Element }): JSX.Element {
  const [thresholdIndex, setThresholdIndex] = createSignal(getInitialThresholdIndex())

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
    setThresholdIndex(nextIndex)
    try {
      sessionStorage.setItem(THRESHOLD_STORAGE_KEY, nextIndex.toString())
    } catch {
      // Keep the in-memory selection if it cannot be persisted.
    }
  }

  return (
    <ConfigStateContext
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
    </ConfigStateContext>
  )
}

export function useConfigState(): ConfigStateContextType {
  const context = useContext(ConfigStateContext)
  invariant(context, 'undefined config context')
  return context
}
