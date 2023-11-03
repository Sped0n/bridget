import { container } from '../container'
import { decIndex, incIndex, state } from '../state'
import { decrement, increment } from '../utils'

import { setCustomCursor } from './customCursor'
import { active, cordHist, isAnimating, isOpen, minimizeImage } from './stage'

/**
 * types
 */

type NavItem = (typeof navItems)[number]

/**
 * variables
 */

const mainDiv = document.getElementById('main') as HTMLDivElement
const navItems = [
  mainDiv.getAttribute('prevText') as string,
  mainDiv.getAttribute('closeText') as string,
  mainDiv.getAttribute('nextText') as string
] as const

/**
 * main functions
 */

function handleClick(type: NavItem): void {
  if (type === navItems[0]) {
    prevImage()
  } else if (type === navItems[1]) {
    minimizeImage()
  } else {
    nextImage()
  }
}

function handleKey(e: KeyboardEvent): void {
  if (isOpen.get() || isAnimating.get()) return
  switch (e.key) {
    case 'ArrowLeft':
      prevImage()
      break
    case 'Escape':
      minimizeImage()
      break
    case 'ArrowRight':
      nextImage()
      break
  }
}

/**
 * init
 */

export function initStageNav(): void {
  const navOverlay = document.createElement('div')
  navOverlay.className = 'navOverlay'
  for (const navItem of navItems) {
    const overlay = document.createElement('div')
    overlay.className = 'overlay'
    overlay.addEventListener(
      'click',
      () => {
        handleClick(navItem)
      },
      { passive: true }
    )
    overlay.addEventListener(
      'keydown',
      () => {
        handleClick(navItem)
      },
      { passive: true }
    )
    overlay.addEventListener(
      'mouseover',
      () => {
        setCustomCursor(navItem)
      },
      { passive: true }
    )
    overlay.addEventListener(
      'focus',
      () => {
        setCustomCursor(navItem)
      },
      { passive: true }
    )
    navOverlay.append(overlay)
  }
  active.addWatcher(() => {
    if (active.get()) {
      navOverlay.classList.add('active')
    } else {
      navOverlay.classList.remove('active')
    }
  })
  container.append(navOverlay)
  window.addEventListener('keydown', handleKey, { passive: true })
}

/**
 * hepler
 */

function nextImage(): void {
  if (isAnimating.get()) return
  cordHist.set(
    cordHist.get().map((item) => {
      return { ...item, i: increment(item.i, state.get().length) }
    })
  )

  incIndex()
}

function prevImage(): void {
  if (isAnimating.get()) return
  cordHist.set(
    cordHist.get().map((item) => {
      return { ...item, i: decrement(item.i, state.get().length) }
    })
  )

  decIndex()
}
