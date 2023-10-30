import { initContainer } from './container'
import { initCustomCursor } from './desktop/customCursor'
import { initStage } from './desktop/stage'
import { initStageNav } from './desktop/stageNav'
import { initCollection } from './mobile/collection'
import { initGallery } from './mobile/gallery'
import { initNav } from './nav'
import { initResources } from './resources'
import { initState } from './state'
import { isMobile } from './utils'

initContainer()
initCustomCursor()
const ijs = initResources()
initState(ijs.length)

initNav()

if (ijs.length > 0) {
  if (!isMobile()) {
    initStage(ijs)
    initStageNav()
  } else {
    initCollection(ijs)
    initGallery(ijs)
  }
}
