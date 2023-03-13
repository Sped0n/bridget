interface ImageData {
  index: string
  url: string
  imgH: string
  imgW: string
}

// fetch images info from JSON
const imageArrayElement = document.getElementById('images_array') as HTMLScriptElement
const rawImageArray = imageArrayElement.textContent as string
export const imagesArray: ImageData[] = JSON.parse(rawImageArray).sort(
  (a: ImageData, b: ImageData) => {
    if (a.index < b.index) {
      return -1
    }
    return 1
  }
)
export const imagesArrayLen: number = imagesArray.length
