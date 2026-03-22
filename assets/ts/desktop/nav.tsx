import { createEffect, onCleanup, onMount } from 'solid-js'

import { useConfigState } from '../configState'
import { useImageState } from '../imageState'
import { expand } from '../utils'

import { useDesktopState } from './state'

export default function Nav(): null {
  let thresholdNums: HTMLSpanElement[] = []
  let indexNums: HTMLSpanElement[] = []
  let decButton: HTMLButtonElement | undefined
  let incButton: HTMLButtonElement | undefined
  let controller: AbortController | undefined

  const imageState = useImageState()
  const [config, { incThreshold, decThreshold }] = useConfigState()
  const [desktop] = useDesktopState()

  const updateThresholdText = (thresholdValue: string): void => {
    thresholdNums.forEach((element, i) => {
      element.innerText = thresholdValue[i]
    })
  }

  const updateIndexText = (indexValue: string, indexLength: string): void => {
    indexNums.forEach((element, i) => {
      if (i < 4) {
        element.innerText = indexValue[i]
      } else {
        element.innerText = indexLength[i - 4]
      }
    })
  }

  onMount(() => {
    const thresholdDiv = document.getElementsByClassName(
      'threshold'
    )[0] as HTMLDivElement
    const indexDiv = document.getElementsByClassName('index').item(0) as HTMLDivElement

    thresholdNums = Array.from(
      thresholdDiv.getElementsByClassName('num')
    ) as HTMLSpanElement[]
    indexNums = Array.from(indexDiv.getElementsByClassName('num')) as HTMLSpanElement[]
    decButton = thresholdDiv.getElementsByClassName('dec').item(0) as HTMLButtonElement
    incButton = thresholdDiv.getElementsByClassName('inc').item(0) as HTMLButtonElement

    controller = new AbortController()
    const signal = controller.signal

    decButton.addEventListener('click', decThreshold, { signal })
    incButton.addEventListener('click', incThreshold, { signal })
  })

  createEffect(() => {
    if (thresholdNums.length === 0 || indexNums.length === 0) return

    updateIndexText(expand(desktop.index() + 1), expand(imageState().length))
    updateThresholdText(expand(config().threshold))
  })

  onCleanup(() => {
    controller?.abort()
  })

  return null
}
