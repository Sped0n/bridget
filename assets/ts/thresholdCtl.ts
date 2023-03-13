import { duper } from './utils'

// get threshold display element
const thresholdDisp = document.getElementsByClassName('thid').item(0) as HTMLSpanElement

// threshold data
const threshold: number[] = [0, 40, 80, 120, 160, 200]
export const thresholdSensitivityArray: number[] = [100, 40, 18, 14, 9, 5]
export let thresholdIndex: number = 2

// update inner text of threshold display element
function thresholdUpdate(): void {
  thresholdDisp.innerText = duper(threshold[thresholdIndex])
}

// threshold control initialization
export function thresholdCtlInit(): void {
  thresholdUpdate()
  const dec = document.getElementById('thresholdDec') as HTMLButtonElement
  dec.addEventListener(
    'click',
    function () {
      if (thresholdIndex > 0) {
        thresholdIndex--
        thresholdUpdate()
      }
    },
    { passive: true }
  )

  const inc = document.getElementById('thresholdInc') as HTMLButtonElement
  inc.addEventListener(
    'click',
    function () {
      if (thresholdIndex < 5) {
        thresholdIndex++
        thresholdUpdate()
      }
    },
    { passive: true }
  )
}
