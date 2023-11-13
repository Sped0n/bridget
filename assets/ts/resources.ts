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

export async function initResources(): Promise<ImageJSON[]> {
  try {
    const response = await fetch(`${window.location.href}index.json`, {
      headers: {
        Accept: 'application/json'
      }
    })
    const data: ImageJSON[] = await response.json()
    return data.sort((a: ImageJSON, b: ImageJSON) => {
      if (a.index < b.index) {
        return -1
      }
      return 1
    })
  } catch (_) {
    return []
  }
}
