import { imgIndexSpanUpdate } from './indexDisp'
import { trackMouseInit } from './trackMouse'
import { thresholdCtlInit } from './thresholdCtl'
import { imagesArrayLen } from './dataFetch'
import { vwRefreshInit } from './overlay'
import { preloader } from './imageCache'

function init(): void {
  preloader(0)
  vwRefreshInit()
  imgIndexSpanUpdate(0, imagesArrayLen)
  thresholdCtlInit()
  trackMouseInit()
}

init()
