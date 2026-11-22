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

export async function getImageJSON(url: string): Promise<ImageJSON[]> {
  try {
    const response = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!response.ok)
      throw new Error(`Gallery data request failed: ${response.status} ${url}`)
    const data: ImageJSON[] = await response.json()
    return data.sort((a, b) => a.index - b.index)
  } catch (e) {
    console.error(e)
    return []
  }
}
