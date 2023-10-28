import { setCustomCursor } from './customCursor'
import { decIndex, incIndex, getState } from './state'
import { increment, decrement } from './utils'
import {
  cordHist,
  isOpen,
  getIsAnimating,
  minimizeImage,
  addActiveCallback
} from './stage'

type NavItem = (typeof navItems)[number]
const navItems = ['prev', 'close', 'next'] as const

// main functions

function handleClick(type: NavItem) {
  switch (type) {
    case 'prev':
      prevImage()
      break
    case 'close':
      minimizeImage()
      break
    case 'next':
      nextImage()
      break
  }
}

function handleKey(e: KeyboardEvent) {
  if (isOpen.get() || getIsAnimating()) return
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

// init

export function initStageNav() {
  const navOverlay = document.createElement('div')
  navOverlay.className = 'navOverlay'
  for (let navItem of navItems) {
    const overlay = document.createElement('div')
    overlay.className = 'overlay'
    overlay.addEventListener('click', () => handleClick(navItem))
    overlay.addEventListener('keydown', () => handleClick(navItem))
    overlay.addEventListener('mouseover', () => setCustomCursor(navItem))
    overlay.addEventListener('focus', () => setCustomCursor(navItem))
    navOverlay.append(overlay)
  }
  addActiveCallback((active) => {
    if (active) {
      navOverlay.classList.add('active')
    } else {
      navOverlay.classList.remove('active')
    }
  })
  document.getElementById('main')!.append(navOverlay)
  window.addEventListener('keydown', handleKey)
}

// hepler

function nextImage() {
  if (getIsAnimating()) return
  cordHist.set(
    cordHist.get().map((item) => {
      return { ...item, i: increment(item.i, getState().length) }
    })
  )

  incIndex()
}

function prevImage() {
  if (getIsAnimating()) return
  cordHist.set(
    cordHist.get().map((item) => {
      return { ...item, i: decrement(item.i, getState().length) }
    })
  )

  decIndex()
}
