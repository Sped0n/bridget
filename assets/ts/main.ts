import { initContainer } from './container'
import { initNav } from './nav'
import { initResources } from './resources'
import { initState } from './state'
import { isMobile } from './utils'

initContainer()
const ijs = initResources()
initState(ijs.length)
initNav()

if (ijs.length > 0) {
  if (!isMobile()) {
    const d = await import('./desktop/init')
    d.initDesktop(ijs)
  } else {
    const m = await import('./mobile/init')
    m.initMobile(ijs)
  }
}
