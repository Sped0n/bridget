import { Match, Show, Switch, createResource, lazy, type JSX } from 'solid-js'
import { render } from 'solid-js/web'

import { ConfigStateProvider } from './configState'
import { DesktopStateProvider } from './desktop/state'
import { ImageStateProvider } from './imageState'
import { MobileStateProvider } from './mobile/state'
import { getImageJSON } from './resources'
import { isMobile } from './utils'

import '../scss/style.scss'

/**
 * interfaces
 */

export interface Container extends HTMLDivElement {
  dataset: {
    next: string
    close: string
    prev: string
    loading: string
    page?: string
  }
}

// disable right-click / context menu site-wide
document.addEventListener('contextmenu', (e) => e.preventDefault())

// container
const container = document.getElementsByClassName('container')[0] as Container

// lazy components
const Desktop = lazy(async () => await import('./desktop/layout'))
const Mobile = lazy(async () => await import('./mobile/layout'))

function AppContent(props: {
  isMobile: boolean
  prevText: string
  closeText: string
  nextText: string
  loadingText: string
}): JSX.Element {
  return (
    <Switch fallback={<div>Error</div>}>
      <Match when={props.isMobile}>
        <MobileStateProvider>
          <Mobile closeText={props.closeText} loadingText={props.loadingText} />
        </MobileStateProvider>
      </Match>
      <Match when={!props.isMobile}>
        <DesktopStateProvider>
          <Desktop
            prevText={props.prevText}
            closeText={props.closeText}
            nextText={props.nextText}
            loadingText={props.loadingText}
          />
        </DesktopStateProvider>
      </Match>
    </Switch>
  )
}

function Main(): JSX.Element {
  // variables
  const [ijs] = createResource(getImageJSON)
  return (
    <>
      <Show when={ijs.state === 'ready'}>
        <ImageStateProvider images={ijs() ?? []}>
          <ConfigStateProvider>
            <AppContent
              isMobile={isMobile()}
              prevText={container.dataset.prev}
              closeText={container.dataset.close}
              nextText={container.dataset.next}
              loadingText={container.dataset.loading}
            />
          </ConfigStateProvider>
        </ImageStateProvider>
      </Show>
    </>
  )
}

const page = container?.dataset.page

if (page === 'post') {
  // blog-style post: augment server-rendered prose with the click-to-open
  // lightbox instead of booting the scatter gallery.
  void import('./post').then((m) => {
    m.initPost()
  })
} else if (page === 'postlist') {
  // scattered post index. Desktop gets hover cycling; mobile is a static
  // server-rendered column, so it needs no JS at all.
  if (!isMobile()) {
    void import('./postList').then((m) => {
      m.initPostList()
    })
  }
} else {
  render(() => <Main />, container)
}
