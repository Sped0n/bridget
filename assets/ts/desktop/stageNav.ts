import { container } from '../container'
import { decIndex, incIndex, isAnimating, state } from '../globalState'
import { decrement, increment } from '../globalUtils'

import { setCustomCursor } from './customCursor'
import { minimizeImage } from './stage'
import { active, cordHist, isLoading, isOpen } from './state'

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
const loadingText = (mainDiv.getAttribute('loadingText') as string) + '...'
let loadedText = ''

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
  // isLoading
  isLoading.addWatcher((o) => {
    if (o) setCustomCursor(loadingText)
    else setCustomCursor(loadedText)
  })
  // navOverlay
  const navOverlay = document.createElement('div')
  navOverlay.className = 'navOverlay'
  for (const [index, navItem] of navItems.entries()) {
    const overlay = document.createElement('div')
    overlay.className = 'overlay'
    const isClose = index === 1
    // close
    if (isClose) {
      overlay.addEventListener(
        'click',
        () => {
          handleCloseClick(navItem)
        },
        { passive: true }
      )
      overlay.addEventListener(
        'keydown',
        () => {
          handleCloseClick(navItem)
        },
        { passive: true }
      )
      overlay.addEventListener(
        'mouseover',
        () => {
          handleCloseHover(navItem)
        },
        { passive: true }
      )
      overlay.addEventListener(
        'focus',
        () => {
          handleCloseHover(navItem)
        },
        { passive: true }
      )
    }
    // prev and next
    else {
      overlay.addEventListener(
        'click',
        () => {
          handlePNClick(navItem)
        },
        { passive: true }
      )
      overlay.addEventListener(
        'keydown',
        () => {
          handlePNClick(navItem)
        },
        { passive: true }
      )
      overlay.addEventListener(
        'mouseover',
        () => {
          handlePNHover(navItem)
        },
        { passive: true }
      )
      overlay.addEventListener(
        'focus',
        () => {
          handlePNHover(navItem)
        },
        { passive: true }
      )
    }
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

function handleCloseClick(navItem: NavItem): void {
  handleClick(navItem)
  isLoading.set(false)
}

function handleCloseHover(navItem: NavItem): void {
  loadedText = navItem
  setCustomCursor(navItem)
}

function handlePNClick(navItem: NavItem): void {
  if (!isLoading.get()) handleClick(navItem)
}

function handlePNHover(navItem: NavItem): void {
  loadedText = navItem
  if (isLoading.get()) setCustomCursor(loadingText)
  else setCustomCursor(navItem)
}
