import { active } from './stage'

let cursor: HTMLDivElement

// create cursor
cursor = document.createElement('div')
cursor.className = 'cursor'
cursor.classList.add('active')
// create cursor inner
const cursorInner = document.createElement('div')
cursorInner.className = 'cursorInner'
// append cursor inner to cursor
cursor.append(cursorInner)

function onMouse(e: MouseEvent) {
  const x = e.clientX
  const y = e.clientY
  cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`
}

export function initCustomCursor(): void {
  // append cursor to main
  document.getElementById('main')!.append(cursor)
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

export function setCustomCursor(text: string): void {
  cursorInner.innerText = text
}
