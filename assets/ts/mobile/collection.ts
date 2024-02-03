import { container } from '../container'
import { setIndex } from '../globalState'
import { type ImageJSON } from '../resources'

import { slideUp } from './gallery'
import { mounted } from './state'
// eslint-disable-next-line sort-imports
import { getRandom, onIntersection, type MobileImage } from './utils'

/**
 * variables
 */

export let imgs: MobileImage[] = []

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
  imgs = Array.from(collection.getElementsByTagName('img')) as MobileImage[]
  // add event listeners
  imgs.forEach((img, i) => {
    // preload first 5 images on page load
    if (i < 5) {
      console.log(`preload ${i + 1}th image`)
      img.src = img.dataset.src
    }
    // event listeners
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
    onIntersection(img, (entries, observer) => {
      entries.every((entry) => {
        // no intersection, skip
        if (entry.intersectionRatio <= 0) return true
        // preload the i + 5th image
        if (i + 5 < imgs.length) {
          console.log(`preload ${i + 5 + 1}th image`)
          imgs[i + 5].src = imgs[i + 5].dataset.src
        }
        // disconnect observer and return false to break the loop
        observer.disconnect()
        return false
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
  for (const [i, ij] of ijs.entries()) {
    // random x and y
    const x = i !== 0 ? getRandom(-25, 25) : 0
    const y = i !== 0 ? getRandom(-30, 30) : 0
    // element
    const e = document.createElement('img') as MobileImage
    e.dataset.src = ij.loUrl
    e.height = ij.loImgH
    e.width = ij.loImgW
    e.alt = ij.alt
    e.style.transform = `translate3d(${x}%, ${y - 50}%, 0)`
    _collection.append(e)
  }
  container.append(_collection)
}
