import invariant from 'tiny-invariant'

import { getImageJSON, type ImageJSON } from './resources'

interface PageContainer extends HTMLDivElement {
  dataset: {
    next: string
    close: string
    prev: string
    loading: string
  }
}

export async function loadPage(): Promise<{
  container: PageContainer
  images: ImageJSON[]
}> {
  // The chosen module can arrive before the parser creates its mount target.
  if (document.readyState === 'loading') {
    await new Promise<void>((resolve) => {
      document.addEventListener('DOMContentLoaded', () => resolve(), { once: true })
    })
  }

  const container = document.getElementsByClassName('container')[0] as
    PageContainer | undefined
  invariant(container, 'page container is not defined')

  return { container, images: await getImageJSON() }
}
