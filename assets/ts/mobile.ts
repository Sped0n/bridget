import { imagesDivNodes as images } from './elemGen'
import { imagesLen } from './dataFetch'

export const renderImages = (): void => {
  images.forEach((img: HTMLImageElement, idx: number): void => {
    const randomX: number = Math.floor(Math.random() * 35) + 2
    let randomY: number

    // random Y calculation
    if (idx === 0) {
      randomY = 68
    } else if (idx === 1) {
      randomY = 44
    } else if (idx === imagesLen - 1) {
      randomY = 100
    } else {
      randomY = Math.floor(Math.random() * 51) + 2
    }

    img.style.transform = `translate(${randomX}vw, -${randomY}%)`
    img.style.marginTop = `${idx === 1 ? 70 : 0}vh`
    img.style.visibility = 'visible'
  })
}
