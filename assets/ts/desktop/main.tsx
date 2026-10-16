import { render } from '@solidjs/web'

import { loadPage } from '../bootstrap'
import { ConfigStateProvider } from '../configState'
import { ImageStateProvider } from '../imageState'
import Desktop from './layout'
import { DesktopStateProvider } from './state'

async function mountDesktop(): Promise<void> {
  const { container, images } = await loadPage()

  render(
    () => (
      <ImageStateProvider images={images}>
        <ConfigStateProvider>
          <DesktopStateProvider>
            <Desktop
              prevText={container.dataset.prev}
              closeText={container.dataset.close}
              nextText={container.dataset.next}
              loadingText={container.dataset.loading}
            />
          </DesktopStateProvider>
        </ConfigStateProvider>
      </ImageStateProvider>
    ),
    container
  )
}

void mountDesktop().catch(console.error)
