import { decThreshold, incThreshold, state } from './globalState'
import { expand } from './globalUtils'

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

export function initNav(): void {
  // add watcher for updating nav text
  state.addWatcher((o) => {
    updateIndexText(expand(o.index + 1), expand(o.length))
    updateThresholdText(expand(o.threshold))
  })

  // event listeners
  decButton.addEventListener(
    'click',
    () => {
      decThreshold()
    },
    { passive: true }
  )
  incButton.addEventListener(
    'click',
    () => {
      incThreshold()
    },
    { passive: true }
  )
}

// helper

export function updateThresholdText(thresholdValue: string): void {
  thresholdDispNums.forEach((e: HTMLSpanElement, i: number) => {
    e.innerText = thresholdValue[i]
  })
}

export function updateIndexText(indexValue: string, indexLength: string): void {
  indexDispNums.forEach((e: HTMLSpanElement, i: number) => {
    if (i < 4) {
      e.innerText = indexValue[i]
    } else {
      e.innerText = indexLength[i - 4]
    }
  })
}
