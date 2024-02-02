import { initContainer } from './container'
import { initState } from './globalState'
import { initNav } from './nav'
import { initResources } from './resources'

// this is the main entry point for the app
document.addEventListener('DOMContentLoaded', () => {
  main().catch((e) => {
    console.log(e)
  })
})

/**
 * main functions
 */

async function main(): Promise<void> {
  initContainer()
  const ijs = await initResources()
  initState(ijs.length)
  initNav()

  if (ijs.length === 0) {
    return
  }

  // NOTE: it seems firefox and chromnium don't like top layer await
  //       so we are using import then instead
  if (!isMobile()) {
    await import('./desktop/init')
      .then((d) => {
        d.initDesktop(ijs)
      })
      .catch((e) => {
        console.log(e)
      })
  } else {
    await import('./mobile/init')
      .then((m) => {
        m.initMobile(ijs)
      })
      .catch((e) => {
        console.log(e)
      })
  }
}

/**
 * hepler
 */

function isMobile(): boolean {
  return window.matchMedia('(hover: none)').matches
}
