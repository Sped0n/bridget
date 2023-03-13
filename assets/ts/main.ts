import { footerHeightUpdateInit } from './utils'
import { imgIndexSpanUpdate } from './indexDisp'
import { imagesArrayLen, trackMouseInit } from './trackMouse'
import { thresholdCtlInit } from './thresholdCtl'

function init(): void {
  footerHeightUpdateInit()
  imgIndexSpanUpdate(0, imagesArrayLen)
  thresholdCtlInit()
  trackMouseInit()
}

init()
