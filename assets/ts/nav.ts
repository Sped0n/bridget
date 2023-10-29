import { getState, incThreshold, decThreshold } from './state'
import { expand } from './utils'

/**
 * variables
 */

// threshold div
const thresholdDiv = document
  .getElementsByClassName('threshold')
  .item(0) as HTMLDivElement

// threshold nums span
const thresholdDispNums = Array.from(
  thresholdDiv.getElementsByClassName('num')
) as HTMLSpanElement[]

// threshold buttons
const decButton = thresholdDiv
  .getElementsByClassName('dec')
  .item(0) as HTMLButtonElement
const incButton = thresholdDiv
  .getElementsByClassName('inc')
  .item(0) as HTMLButtonElement

// index div
const indexDiv = document.getElementsByClassName('index').item(0) as HTMLDivElement

// index nums span
const indexDispNums = Array.from(
  indexDiv.getElementsByClassName('num')
) as HTMLSpanElement[]

/**
 * init
 */

export function initNav() {
  // init threshold text
  updateThresholdText()
  // init index text
  updateIndexText()
  // event listeners
  decButton.addEventListener('click', () => decThreshold())
  incButton.addEventListener('click', () => incThreshold())
}

// helper

export function updateThresholdText(): void {
  const thresholdValue: string = expand(getState().threshold)
  thresholdDispNums.forEach((e: HTMLSpanElement, i: number) => {
    e.innerText = thresholdValue[i]
  })
}

export function updateIndexText(): void {
  const indexValue: string = expand(getState().index + 1)
  const indexLength: string = expand(getState().length)
  indexDispNums.forEach((e: HTMLSpanElement, i: number) => {
    if (i < 4) {
      e.innerText = indexValue[i]
    } else {
      e.innerText = indexLength[i - 4]
    }
  })
}
