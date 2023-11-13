import { initContainer } from './container'
import { initNav } from './nav'
import { initResources } from './resources'
import { initState } from './state'
import { isMobile } from './utils'

initContainer()
const ijs = await initResources()
initState(ijs.length)
initNav()

// NOTE: it seems firefox and chromnium don't like top layer await
//       so we are using import then instead
if (ijs.length > 0) {
  if (!isMobile()) {
    import('./desktop/init')
      .then((d) => {
        d.initDesktop(ijs)
      })
      .catch((e) => {
        console.log(e)
      })
  } else {
    import('./mobile/init')
      .then((m) => {
        m.initMobile(ijs)
      })
      .catch((e) => {
        console.log(e)
      })
  }
}
