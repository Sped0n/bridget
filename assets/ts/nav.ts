import { decThreshold, incThreshold, state } from './state'
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

// links div
const linksDiv = document.getElementsByClassName('links').item(0) as HTMLDivElement

// links
const links = Array.from(linksDiv.getElementsByClassName('link')) as HTMLAnchorElement[]

// current link index
const currentLinkIndex = document
  .getElementById('main')
  ?.getAttribute('currentMenuItemIndex') as string

// set current link
for (const [index, link] of links.entries()) {
  if (index === parseInt(currentLinkIndex)) {
    // set current link style
    link.classList.add('current')
    // set current link title (only if not home)
    if (index !== 0) document.title = link.innerText + ' | ' + document.title
  }
}

/**
 * init
 */

export function initNav(): void {
  const s = state.get()
  // init threshold text
  updateThresholdText(expand(s.threshold))
  // init index text
  updateIndexText(expand(s.index + 1), expand(s.length))
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
