import { type ImageJSON } from '../resources'

import { initCustomCursor } from './customCursor'
import { initStage } from './stage'
import { initStageNav } from './stageNav'

export function initDesktop(ijs: ImageJSON[]): void {
  initCustomCursor()
  initStage(ijs)
  initStageNav()
}
