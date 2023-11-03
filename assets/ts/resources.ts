// data structure for images info
export interface ImageJSON {
  index: number
  alt: string
  loUrl: string
  loImgH: number
  loImgW: number
  hiUrl: string
  hiImgH: number
  hiImgW: number
}

export function initResources(): ImageJSON[] {
  const imagesJson = document.getElementById('imagesSource')
  if (imagesJson === null) {
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
