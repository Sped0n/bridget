import { Match, Show, Switch, createResource, lazy, type JSX } from 'solid-js'
import { render } from 'solid-js/web'

import { ConfigStateProvider } from './configState'
import { DesktopStateProvider } from './desktop/state'
import { ImageStateProvider } from './imageState'
import { MobileStateProvider } from './mobile/state'
import { getImageJSON } from './resources'

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
  }
}

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
  const ua = window.navigator.userAgent.toLowerCase()
  const hasTouchInput = 'ontouchstart' in window || window.navigator.maxTouchPoints > 0
  const hasTouchLayout =
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(hover: none)').matches
  const isMobileUA = /android|iphone|ipad|ipod|mobile/.test(ua)
  const isWindowsDesktop = /windows nt/.test(ua)
  const isMobile = isMobileUA || (hasTouchInput && hasTouchLayout && !isWindowsDesktop)

  return (
    <>
      <Show when={ijs.state === 'ready'}>
        <ImageStateProvider images={ijs() ?? []}>
          <ConfigStateProvider>
            <AppContent
              isMobile={isMobile}
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

render(() => <Main />, container)
