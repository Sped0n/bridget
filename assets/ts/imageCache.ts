import { imagesArray, imagesArrayLen } from './dataFetch'
import { preloadImage, calcImageIndex } from './utils'

let lastIndex: number = 0

export const preloader = (index: number): void => {
  lastIndex = index
}
