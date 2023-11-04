import { Watchable, decrement, increment } from './utils'

/**
 * types
 */

export type State = typeof defaultState

/**
 * variables
 */

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
  threshold: thresholds[getThresholdSessionIndex()].threshold,
  trailLength: thresholds[getThresholdSessionIndex()].trailLength
}

export const state = new Watchable<State>(defaultState)

/**
 * main functions
 */

export function initState(length: number): void {
  const s = state.get()
  s.length = length
  updateThreshold(s, 0)
  state.set(s)
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

/**
 * helper
 */

function updateThreshold(state: State, inc: number): State {
  const i = thresholds.findIndex((t) => state.threshold === t.threshold) + inc
  // out of bounds
  if (i < 0 || i >= thresholds.length) return state
  // storage the index so we can restore it even if we go to another page
  sessionStorage.setItem('thresholdsIndex', i.toString())
  const newItems = thresholds[i]
  return { ...state, ...newItems }
}

function getThresholdSessionIndex(): number {
  const s = sessionStorage.getItem('thresholdsIndex')
  if (s === null) return 2
  return parseInt(s)
}
