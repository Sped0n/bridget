import { type gsap } from 'gsap'

import { loadGsap } from './utils'

// prose + imagery the reader can pick up, toss around, and watch spring back
const SELECTOR = [
  '.postTitle',
  '.postLede',
  '.postBody > p',
  '.postBody > h2',
  '.postBody > h3',
  '.postBody > blockquote',
  '.postFigure figcaption',
  '.postImage'
].join(',')

const DRAG_THRESHOLD = 4 // px of travel before a press becomes a drag

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Makes the server-rendered post prose and imagery draggable: grab any block,
 * it trails the pointer with an eased lag, and springs home on release. A
 * decorative, pointer-only flourish — it never touches keyboard flow, and a
 * plain click still falls through to the image lightbox. Returns a disposer.
 */
export function initPostDrag(article: HTMLElement): () => void {
  if (prefersReducedMotion()) return () => {}

  const targets = Array.from(article.querySelectorAll<HTMLElement>(SELECTOR))
  if (targets.length === 0) return () => {}
  targets.forEach((el) => el.classList.add('postDraggable'))

  const controller = new AbortController()
  const { signal } = controller

  let g: typeof gsap | undefined
  let active: HTMLElement | null = null
  let moveX: gsap.QuickToFunc | null = null
  let moveY: gsap.QuickToFunc | null = null
  let startX = 0
  let startY = 0
  let baseX = 0 // element's offset carried over from earlier drags
  let baseY = 0
  let pointerId = -1
  let dragged = false

  // warm gsap up front so the first grab follows the pointer without a hitch
  void loadGsap().then((lib) => {
    g = lib
  })

  // a drag ends with a synthetic click on interactive targets (the image
  // lightbox listens for it) — swallow that one so a toss never opens a photo
  const suppressClick = (e: Event): void => {
    e.stopImmediatePropagation()
    e.preventDefault()
  }

  const onDown = (e: PointerEvent): void => {
    if (e.button !== 0 || active !== null || g === undefined) return
    const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(SELECTOR)
    if (target == null) return

    active = target
    startX = e.clientX
    startY = e.clientY
    baseX = Number(g.getProperty(target, 'x'))
    baseY = Number(g.getProperty(target, 'y'))
    pointerId = e.pointerId
    dragged = false
    moveX = g.quickTo(target, 'x', { duration: 0.15, ease: 'power2.out' })
    moveY = g.quickTo(target, 'y', { duration: 0.15, ease: 'power2.out' })
  }

  const onMove = (e: PointerEvent): void => {
    if (active === null || e.pointerId !== pointerId) return
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    if (!dragged) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return
      dragged = true
      active.classList.add('is-dragging') // floats above siblings, stays put
    }
    moveX?.(baseX + dx)
    moveY?.(baseY + dy)
  }

  const onUp = (e: PointerEvent): void => {
    if (active === null || e.pointerId !== pointerId) return
    const el = active
    active = null
    moveX = null
    moveY = null
    if (!dragged) return // a plain click — let it reach the lightbox

    // block the drag's trailing click, then leave the block where it landed
    el.addEventListener('click', suppressClick, { capture: true, once: true })
  }

  article.addEventListener('pointerdown', onDown, { signal })
  window.addEventListener('pointermove', onMove, { signal })
  window.addEventListener('pointerup', onUp, { signal })
  window.addEventListener('pointercancel', onUp, { signal })
  // block the browser's native image-drag ghost so ours is the only one
  article.addEventListener('dragstart', (e) => e.preventDefault(), { signal })

  return () => controller.abort()
}
