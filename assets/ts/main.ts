import { initResources } from './resources'
import { initState } from './state'
import { initCustomCursor } from './desktop/customCursor'
import { initNav } from './nav'
import { initStage } from './desktop/stage'
import { initStageNav } from './desktop/stageNav'

initCustomCursor()
const ijs = initResources()
initState(ijs.length)
initStage(ijs)
initStageNav()
initNav()
