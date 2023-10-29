import { initResources } from './resources'
import { initState } from './state'
import { initCustomCursor } from './customCursor'
import { initNav } from './nav'
import { initStage } from './stage'
import { initStageNav } from './stageNav'

initCustomCursor()
const ijs = initResources()
initState(ijs.length)
initStage(ijs)
initStageNav()
initNav()
