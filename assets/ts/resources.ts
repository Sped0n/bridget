// data structure for images info
export interface ImageJSON {
  index: number
  loUrl: string
  loImgH: number
  loImgW: number
  hiUrl: string
  hiImgH: number
  hiImgW: number
}

export function initResources(): ImageJSON[] {
  const imagesJson = document.getElementById('imagesSource')
  if (!imagesJson) {
    return []
  }
  return JSON.parse(imagesJson.textContent as string).sort(
    (a: ImageJSON, b: ImageJSON) => {
      if (a.index < b.index) {
        return -1
      }
      return 1
    }
  )
}
