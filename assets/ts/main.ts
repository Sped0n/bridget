import { createDesktopElements, createMobileElements } from './elemGen'
import { imgIndexSpanUpdate } from './indexDisp'
import { trackMouseInit } from './desktop'
import { thresholdCtlInit } from './thresholdCtl'
import { imagesArrayLen } from './dataFetch'
import { vwRefreshInit } from './overlay'
import { preloader } from './imageCache'
import { getDeviceType } from './utils'
import { renderImages } from './mobile'

const desktopInit = (): void => {
  createDesktopElements()
  preloader(0)
  vwRefreshInit()
  imgIndexSpanUpdate(0, imagesArrayLen)
  thresholdCtlInit()
  trackMouseInit()
}

const mobileInit = (): void => {
  createMobileElements()
  vwRefreshInit()
  imgIndexSpanUpdate(0, imagesArrayLen)
  renderImages()
  console.log('mobile')
}

getDeviceType().desktop ? mobileInit() : desktopInit()
