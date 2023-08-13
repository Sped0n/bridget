import { type ImageData } from './utils'

// fetch images info from JSON
const imageArrayElement = document.getElementById('images_info') as HTMLScriptElement
const rawImagesInfo = imageArrayElement.textContent as string
export const imagesInfo: ImageData[] = JSON.parse(rawImagesInfo).sort(
  (a: ImageData, b: ImageData) => {
    if (a.index < b.index) {
      return -1
    }
    return 1
  }
)
export const imagesLen: number = imagesInfo.length
