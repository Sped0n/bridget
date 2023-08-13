import { imagesInfo, imagesLen } from './dataFetch'
import { preloadImage, calcImageIndex } from './utils'

let lastIndex: number = 0

export const preloader = (index: number): void => {
  if (lastIndex === index) {
    for (let i: number = -2; i <= 1; i++)
      preloadImage(imagesInfo[calcImageIndex(index + i, imagesLen)].url)
  } else if (lastIndex > index) {
    for (let i: number = 1; i <= 3; i++)
      preloadImage(imagesInfo[calcImageIndex(index - i, imagesLen)].url)
  } else {
    for (let i: number = 1; i <= 3; i++)
      preloadImage(imagesInfo[calcImageIndex(index + i, imagesLen)].url)
  }
  lastIndex = index
}
