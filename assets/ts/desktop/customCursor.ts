import { active } from './stage'
import { container } from '../container'

/**
 * variables
 */

const cursor = document.createElement('div')
const cursorInner = document.createElement('div')

/**
 * main functions
 */

function onMouse(e: MouseEvent) {
  const x = e.clientX
  const y = e.clientY
  cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`
}

export function setCustomCursor(text: string): void {
  cursorInner.innerText = text
}

/**
 * init
 */
export function initCustomCursor(): void {
  // cursor class name
  cursor.className = 'cursor'
  // cursor inner class name
  cursorInner.className = 'cursorInner'
  // append cursor inner to cursor
  cursor.append(cursorInner)
  // append cursor to main
  container.append(cursor)
  // bind mousemove event to window
  window.addEventListener('mousemove', onMouse)
  // add active callback
  active.addWatcher(() => {
    if (active.get()) {
      cursor.classList.add('active')
    } else {
      cursor.classList.remove('active')
    }
  })
}
