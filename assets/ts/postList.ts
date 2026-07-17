/**
 * Desktop-only enhancement for the scattered post index.
 * Tiles are fully server-rendered (up to 4 frames, one per corner); on hover
 * we riffle through a post's frames
 * and hop its title from corner to corner in sync with the frames.
 * Mobile is a static column and never loads this module.
 */

const FRAME_MS = 420
const TITLE_SLOTS = 4 // four corners; title index = frame index mod 4

function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function setupTile(tile: HTMLElement): void {
  const frames = Array.from(tile.querySelectorAll<HTMLImageElement>('.tileFrame'))
  const title = tile.querySelector<HTMLElement>('.tileTitle')
  if (frames.length === 0 || title == null) return

  let timer: number | undefined
  let idx = 0

  const show = (next: number): void => {
    frames[idx]?.classList.remove('active')
    idx = next % frames.length
    frames[idx]?.classList.add('active')
    title.dataset.slot = String(idx % TITLE_SLOTS)
  }

  const start = (): void => {
    // load the remaining frames the first time this tile is entered
    frames.forEach((f) => {
      const src = f.dataset.src
      if (src !== undefined && f.getAttribute('src') === null) f.src = src
    })
    tile.classList.add('hovered')
    if (frames.length < 2 || reducedMotion()) return
    timer = window.setInterval(() => {
      show(idx + 1)
    }, FRAME_MS)
  }

  const stop = (): void => {
    if (timer !== undefined) {
      clearInterval(timer)
      timer = undefined
    }
    show(0)
    tile.classList.remove('hovered')
  }

  frames[0].classList.add('active')
  tile.addEventListener('pointerenter', start)
  tile.addEventListener('pointerleave', stop)
}

export function initPostList(): void {
  const tiles = Array.from(document.querySelectorAll<HTMLElement>('.tile'))
  tiles.forEach(setupTile)
}
