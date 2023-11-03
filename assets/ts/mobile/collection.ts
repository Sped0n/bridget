import { container } from '../container'
import { type ImageJSON } from '../resources'
import { setIndex } from '../state'
import { getRandom, onVisible } from '../utils'

import { slideUp } from './gallery'
import { mounted } from './mounted'

/**
 * variables
 */

export let imgs: HTMLImageElement[] = []

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
  mounted.addWatcher((o) => {
    if (o) {
      collection.classList.remove('hidden')
    } else {
      collection.classList.add('hidden')
    }
  })
  // get image elements
  imgs = Array.from(collection.getElementsByTagName('img'))
  // add event listeners
  imgs.forEach((img, i) => {
    img.addEventListener(
      'click',
      () => {
        handleClick(i)
      },
      { passive: true }
    )
    img.addEventListener(
      'keydown',
      () => {
        handleClick(i)
      },
      { passive: true }
    )
    // preload
    onVisible(img, () => {
      for (let _i = 0; _i < 5; _i++) {
        const n = i + _i
        if (n < 0 || n > imgs.length - 1) continue
        imgs[n].src = imgs[n].dataset.src as string
      }
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
  for (const [i, ij] of ijs.entries()) {
    // random x and y
    const x = i !== 0 ? getRandom(-25, 25) : 0
    const y = i !== 0 ? getRandom(-30, 30) : 0
    // element
    const e = document.createElement('img')
    e.dataset.src = ij.loUrl
    e.height = ij.loImgH
    e.width = ij.loImgW
    e.alt = ij.alt
    e.style.transform = `translate3d(${x}%, ${y - 50}%, 0)`
    _collection.append(e)
  }
  container.append(_collection)
}
