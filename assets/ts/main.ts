import { imgIndexSpanUpdate } from './indexDisp'
import { trackMouseInit } from './desktop'
import { thresholdCtlInit } from './thresholdCtl'
import { imagesArrayLen } from './dataFetch'
import { vwRefreshInit } from './overlay'
import { preloader } from './imageCache'
import { getDeviceType } from './utils'

function desktopInit(): void {
  preloader(0)
  vwRefreshInit()
  imgIndexSpanUpdate(0, imagesArrayLen)
  thresholdCtlInit()
  trackMouseInit()
}

function mobileInit(): void {
  console.log('mobile')
}

getDeviceType().mobile ? mobileInit() : desktopInit()
