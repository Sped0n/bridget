import { render } from '@solidjs/web'

import { loadPage } from '../bootstrap'
import { ImageStateProvider } from '../imageState'

import Mobile from './layout'
import { MobileStateProvider } from './state'

async function mountMobile(): Promise<void> {
  const { container, images } = await loadPage()

  render(
    () => (
      <ImageStateProvider images={images}>
        <MobileStateProvider>
          <Mobile
            closeText={container.dataset.close}
            loadingText={container.dataset.loading}
          />
        </MobileStateProvider>
      </ImageStateProvider>
    ),
    container
  )
}

void mountMobile().catch(console.error)
