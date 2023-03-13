import { imgIndexSpanUpdate } from './indexDisp'
import { trackMouseInit } from './trackMouse'
import { thresholdCtlInit } from './thresholdCtl'
import { imagesArrayLen } from './dataFetch'
import { vwRefreshInit } from './overlay'

function init(): void {
  vwRefreshInit()
  imgIndexSpanUpdate(0, imagesArrayLen)
  thresholdCtlInit()
  trackMouseInit()
}

init()
