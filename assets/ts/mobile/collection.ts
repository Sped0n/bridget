import { container } from '../container'
import { ImageJSON } from '../resources'
import { getNextFive, setIndex } from '../state'
import { Watchable, getRandom, onVisible } from '../utils'
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
  const collection = document
    .getElementsByClassName('collection')
    .item(0) as HTMLDivElement
  // add watcher
  mounted.addWatcher(() => {
    if (mounted.get()) {
      collection.classList.remove('hidden')
    } else {
      collection.classList.add('hidden')
    }
  })
  // get image elements
  imgs = Array.from(collection.getElementsByTagName('img'))
  // add event listeners
  imgs.forEach((img, i) => {
    img.addEventListener('click', () => handleClick(i))
    img.addEventListener('keydown', () => handleClick(i))
    // preload
    onVisible(img, () => {
      // minues one because we want to preload the current and the next 4 images
      getNextFive(i - 1, imgs.length)
        .map((i) => imgs[i])
        .forEach((e) => {
          e.src = e.dataset.src!
        })
    })
  })
}

/**
 * helper
 */

function createCollection(ijs: ImageJSON[]): void {
  // create container for images
  const _collection: HTMLDivElement = document.createElement('div')
  _collection.className = 'collection'
  // append images to container
  for (let [i, ij] of ijs.entries()) {
    // random x and y
    const x = i !== 0 ? getRandom(-25, 25) : 0
    const y = i !== 0 ? getRandom(-30, 30) : 0
    // element
    const e = document.createElement('img')
    e.dataset.src = ij.loUrl
    e.height = ij.loImgH
    e.width = ij.loImgW
    e.alt = 'image'
    e.style.transform = `translate3d(${x}%, ${y - 50}%, 0)`
    _collection.append(e)
  }
  container.append(_collection)
}
