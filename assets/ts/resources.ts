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

export async function getImageJSON(): Promise<ImageJSON[]> {
  if (document.title.split(' | ')[0] === '404') {
    return [] // no images on 404 page
  }

  const ogUrlMetaTag = document.querySelector(
    'meta[property="og:url"]'
  ) as HTMLMetaElement | null
  const indexJsonUrl = ogUrlMetaTag?.content
    ? new URL('index.json', ogUrlMetaTag.content).href
    : new URL('index.json', window.location.href).href

  try {
    const response = await fetch(indexJsonUrl, {
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
  } catch (e) {
    console.error(e)
    return []
  }
}
