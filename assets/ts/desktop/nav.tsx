import { createEffect } from 'solid-js'

import { useState } from '../state'
import { expand } from '../utils'

/**
 * constants
 */

// threshold div
const thresholdDiv = document.getElementsByClassName('threshold')[0] as HTMLDivElement
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
 * helper functions
 */

function updateThresholdText(thresholdValue: string): void {
  thresholdDispNums.forEach((e: HTMLSpanElement, i: number) => {
    e.innerText = thresholdValue[i]
  })
}

function updateIndexText(indexValue: string, indexLength: string): void {
  indexDispNums.forEach((e: HTMLSpanElement, i: number) => {
    if (i < 4) {
      e.innerText = indexValue[i]
    } else {
      e.innerText = indexLength[i - 4]
    }
  })
}

/**
 * Nav component
 */

export default function Nav(): null {
  const [state, { incThreshold, decThreshold }] = useState()

  createEffect(() => {
    updateIndexText(expand(state().index + 1), expand(state().length))
    updateThresholdText(expand(state().threshold))
  })

  decButton.onclick = decThreshold
  incButton.onclick = incThreshold

  return null
}
