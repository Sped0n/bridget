import { type gsap } from 'gsap'
import { createEffect, createSignal, onCleanup, onMount, type JSX } from 'solid-js'
import { render } from 'solid-js/web'

import CustomCursor from './desktop/customCursor'
import { loadGsap } from './utils'

interface Shot {
  url: string
  w: number
  h: number
}

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Lightbox(props: {
  buttons: HTMLButtonElement[]
  closeText: string
}): JSX.Element {
  let overlay: HTMLDivElement | undefined
  let frame: HTMLDivElement | undefined
  let _gsap: typeof gsap
  let origin = { top: 0, left: 0, width: 0, height: 0 }
  let animating = false

  const [open, setOpen] = createSignal(false)
  const [shot, setShot] = createSignal<Shot | null>(null)

  const ensureGsap = async (): Promise<typeof gsap> => {
    if (_gsap === undefined) _gsap = await loadGsap()
    return _gsap
  }

  const rectOf = (el: HTMLElement): typeof origin => {
    const r = el.getBoundingClientRect()
    return { top: r.top, left: r.left, width: r.width, height: r.height }
  }

  const openShot = async (btn: HTMLButtonElement): Promise<void> => {
    if (animating || open()) return
    const img = btn.querySelector('img')
    if (img == null) return

    origin = rectOf(img)
    setShot({
      url: btn.dataset.hiUrl ?? '',
      w: Number(btn.dataset.hiW ?? 0),
      h: Number(btn.dataset.hiH ?? 0)
    })
    setOpen(true)

    const g = await ensureGsap()
    if (frame === undefined) return
    animating = true
    g.fromTo(
      frame,
      { ...origin },
      {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        duration: prefersReducedMotion() ? 0 : 0.55,
        ease: 'expo.out',
        onComplete: () => {
          animating = false
        }
      }
    )
  }

  const close = async (): Promise<void> => {
    if (animating || !open()) return
    const g = await ensureGsap()
    if (frame === undefined) {
      setOpen(false)
      return
    }
    animating = true
    g.to(frame, {
      ...origin,
      duration: prefersReducedMotion() ? 0 : 0.45,
      ease: 'expo.inOut',
      onComplete: () => {
        animating = false
        setOpen(false)
        setShot(null)
      }
    })
  }

  const onKey = (e: KeyboardEvent): void => {
    if (open() && e.key === 'Escape') void close()
  }

  // lock page scroll while the lightbox covers the viewport, so no scrollbar
  // shows behind the overlay
  createEffect(() => {
    document.body.style.overflow = open() ? 'hidden' : ''
  })
  onCleanup(() => {
    document.body.style.overflow = ''
  })

  onMount(() => {
    const controller = new AbortController()
    const { signal } = controller
    props.buttons.forEach((btn) => {
      btn.addEventListener('click', () => void openShot(btn), { signal })
    })
    window.addEventListener('keydown', onKey, { signal })
    onCleanup(() => {
      controller.abort()
    })
  })

  return (
    <>
      <div
        ref={overlay}
        class="postLightbox"
        classList={{ active: open() }}
        onClick={() => void close()}
        role="dialog"
        aria-modal="true"
      >
        <div ref={frame} class="postLightboxFrame">
          {shot() != null && (
            <img src={shot()?.url} width={shot()?.w} height={shot()?.h} alt="" />
          )}
        </div>
      </div>
      <CustomCursor active={open} cursorText={() => props.closeText} />
    </>
  )
}

export function initPost(): void {
  const article = document.querySelector('.postArticle')
  if (article == null) return

  const buttons = Array.from(
    article.querySelectorAll<HTMLButtonElement>('button.postImage')
  )
  if (buttons.length === 0) return

  const closeText =
    document.querySelector<HTMLElement>('.container')?.dataset.close ?? 'close'

  const root = document.createElement('div')
  root.className = 'postOverlayRoot'
  document.body.appendChild(root)

  render(() => <Lightbox buttons={buttons} closeText={closeText} />, root)
}
