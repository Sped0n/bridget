import { duper } from './utils'

// update index of displaying image
export function imgIndexSpanUpdate(numOne: number, numTwo: number): void {
  // footer index number display module
  const footerIndexDisp = document.getElementsByClassName('ftid')
  const numOneString: string = duper(numOne)
  const numTwoString: string = duper(numTwo)
  for (let i: number = 0; i <= 7; i++) {
    const footerIndex = footerIndexDisp[i] as HTMLSpanElement
    if (i > 3) {
      footerIndex.innerText = numTwoString[i - 4]
    } else {
      footerIndex.innerText = numOneString[i]
    }
  }
}
