import { type ImageJSON } from '../resources'

import { initCollection } from './collection'
import { initGallery } from './gallery'

export function initMobile(ijs: ImageJSON[]): void {
  initCollection(ijs)
  initGallery(ijs)
}
