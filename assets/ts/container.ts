import { scrollable } from './mobile/scroll'

export let container: HTMLDivElement

export function initContainer(): void {
  container = document.getElementsByClassName('container').item(0) as HTMLDivElement
  scrollable.addWatcher((o) => {
    if (o) {
      container.classList.remove('disableScroll')
    } else {
      container.classList.add('disableScroll')
    }
  })
}
