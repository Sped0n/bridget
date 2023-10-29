import { increment, decrement } from './utils'
import { updateIndexText, updateThresholdText } from './nav'

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

let state = defaultState

export function getState(): State {
  // return a copy of state
  return Object.create(
    Object.getPrototypeOf(state),
    Object.getOwnPropertyDescriptors(state)
  )
}

export function initState(length: number): void {
  state.length = length
}

export function setIndex(index: number): void {
  state.index = index
  updateIndexText()
}

export function incIndex(): void {
  state.index = increment(state.index, state.length)
  updateIndexText()
}

export function decIndex(): void {
  state.index = decrement(state.index, state.length)
  updateIndexText()
}

export function incThreshold(): void {
  state = updateThreshold(state, 1)
  updateThresholdText()
}

export function decThreshold(): void {
  state = updateThreshold(state, -1)
  updateThresholdText()
}

// helper

function updateThreshold(state: State, inc: number): State {
  const i = thresholds.findIndex((t) => state.threshold === t.threshold)
  const newItems = thresholds[i + inc]
  // out of range
  if (!newItems) return state
  return { ...state, ...newItems }
}
