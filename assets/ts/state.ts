import { updateIndexText, updateThresholdText } from './nav'
import { Watchable, decrement, increment } from './utils'

const thresholds = [
  { threshold: 20, trailLength: 20 },
  { threshold: 40, trailLength: 10 },
  { threshold: 80, trailLength: 5 },
  { threshold: 140, trailLength: 5 },
  { threshold: 200, trailLength: 5 }
]

const defaultState = {
  index: -1,
  length: 0,
  threshold: thresholds[2].threshold,
  trailLength: thresholds[2].trailLength
}

export type State = typeof defaultState

export const state = new Watchable<State>(defaultState)

export function initState(length: number): void {
  const s = state.get()
  s.length = length
  state.set(s)
  state.addWatcher(() => {
    updateIndexText()
    updateThresholdText()
  })
}

export function setIndex(index: number): void {
  const s = state.get()
  s.index = index
  state.set(s)
}

export function incIndex(): void {
  const s = state.get()
  s.index = increment(s.index, s.length)
  state.set(s)
}

export function decIndex(): void {
  const s = state.get()
  s.index = decrement(s.index, s.length)
  state.set(s)
}

export function incThreshold(): void {
  let s = state.get()
  s = updateThreshold(s, 1)
  state.set(s)
}

export function decThreshold(): void {
  let s = state.get()
  s = updateThreshold(s, -1)
  state.set(s)
}

// helper

function updateThreshold(state: State, inc: number): State {
  const i = thresholds.findIndex((t) => state.threshold === t.threshold)
  const newItems = thresholds[i + inc]
  // out of range
  if (!newItems) return state
  return { ...state, ...newItems }
}
