// data structure for images info
export interface ImageJSON {
  index: number
  url: string
  imgH: number
  imgW: number
  pColor: string
  sColor: string
}

export function initResources(): ImageJSON[] {
  const imagesJson = document.getElementById('imagesSource') as HTMLScriptElement
  return JSON.parse(imagesJson.textContent as string).sort(
    (a: ImageJSON, b: ImageJSON) => {
      if (a.index < b.index) {
        return -1
      }
      return 1
    }
  )
}
