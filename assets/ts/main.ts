import { footerHeightUpdateInit } from './utils'
import { imgIndexSpanUpdate } from './indexDisp'
import { trackMouseInit } from './trackMouse'
import { thresholdCtlInit } from './thresholdCtl'
import { imagesArrayLen } from './dataFetch'

function init(): void {
  footerHeightUpdateInit()
  imgIndexSpanUpdate(0, imagesArrayLen)
  thresholdCtlInit()
  trackMouseInit()
}

init()
