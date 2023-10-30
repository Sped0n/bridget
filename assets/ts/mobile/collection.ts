import { container } from '../container'
import { ImageJSON } from '../resources'
import { setIndex } from '../state'
import { getRandom, Watchable } from '../utils'
import { slideUp } from './gallery'

/**
 * variables
 */

export let imgs: HTMLImageElement[] = []
export const mounted = new Watchable<boolean>(false)

/**
 * main functions
 */

function handleClick(i: number): void {
  setIndex(i)
  slideUp()
}

/**
 * init
 */

export function initCollection(ijs: ImageJSON[]): void {
  createCollection(ijs)
  // get container
  const container = document
    .getElementsByClassName('collection')
    .item(0) as HTMLDivElement
  // add watcher
  mounted.addWatcher(() => {
    if (mounted.get()) {
      container.classList.remove('hidden')
    } else {
      container.classList.add('hidden')
    }
  })
  // get image elements
  imgs = Array.from(container.getElementsByTagName('img'))
  // add event listeners
  imgs.forEach((img, i) => {
    img.addEventListener('click', () => handleClick(i))
    img.addEventListener('keydown', () => handleClick(i))
  })
}

/**
 * helper
 */

function createCollection(ijs: ImageJSON[]): void {
  // create container for images
  const collection: HTMLDivElement = document.createElement('div')
  collection.className = 'collection'
  // append images to container
  for (let [i, ij] of ijs.entries()) {
    // random x and y
    const x = i !== 0 ? getRandom(-25, 25) : 0
    const y = i !== 0 ? getRandom(-30, 30) : 0
    // element
    const e = document.createElement('img')
    e.src = ij.loUrl
    e.height = ij.loImgH
    e.width = ij.loImgW
    e.alt = 'image'
    e.style.transform = `translate3d(${x}%, ${y - 50}%, 0)`
    collection.append(e)
  }
  container.append(collection)
}
