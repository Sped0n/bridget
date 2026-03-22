import { type gsap } from 'gsap'

import type { Vector } from '../utils'

import type { DesktopImage } from './layout'
import {
  getCurrentElIndex,
  getImagesFromIndexes,
  getNextElIndex,
  getPrevElIndex,
  getTrailElsIndex,
  getTrailInactiveElsIndex,
  hires,
  lores
} from './stageUtils'
import type { HistoryItem } from './state'

type SetLoading = (value: boolean) => void

export function setLoaderForHiresImage(args: {
  gsap: typeof gsap
  img: DesktopImage
  mounted: boolean
  setIsLoading: SetLoading
}): void {
  const { gsap, img, mounted, setIsLoading } = args
  if (!mounted) return

  if (img.complete) {
    gsap
      .set(img, { opacity: 1 })
      .then(() => {
        setIsLoading(false)
      })
      .catch((e) => {
        console.log(e)
      })
    return
  }

  setIsLoading(true)

  const controller = new AbortController()
  const abortSignal = controller.signal

  img.addEventListener(
    'load',
    () => {
      gsap
        .to(img, { opacity: 1, ease: 'power3.out', duration: 0.5 })
        .then(() => {
          setIsLoading(false)
        })
        .catch((e) => {
          console.log(e)
        })
        .finally(() => {
          controller.abort()
        })
    },
    { once: true, passive: true, signal: abortSignal }
  )
  img.addEventListener(
    'error',
    () => {
      gsap
        .set(img, { opacity: 1 })
        .then(() => {
          setIsLoading(false)
        })
        .catch((e) => {
          console.log(e)
        })
        .finally(() => {
          controller.abort()
        })
    },
    { once: true, passive: true, signal: abortSignal }
  )
}

export function syncStagePosition(args: {
  gsap: typeof gsap
  imgs: DesktopImage[]
  cordHist: HistoryItem[]
  trailLength: number
  length: number
  isOpen: boolean
  navVector: Vector
  mounted: boolean
  setIsLoading: SetLoading
}): void {
  const {
    gsap,
    imgs,
    cordHist,
    trailLength,
    length,
    isOpen,
    navVector,
    mounted,
    setIsLoading
  } = args

  if (!mounted || imgs.length === 0) return

  const trailElsIndex = getTrailElsIndex(cordHist)
  if (trailElsIndex.length === 0) return

  const elsTrail = getImagesFromIndexes(imgs, trailElsIndex)

  gsap.set(elsTrail, {
    x: (i: number) => cordHist[i].x - window.innerWidth / 2,
    y: (i: number) => cordHist[i].y - window.innerHeight / 2,
    opacity: (i: number) =>
      Math.max((i + 1 + trailLength <= cordHist.length ? 0 : 1) - (isOpen ? 1 : 0), 0),
    zIndex: (i: number) => i,
    scale: 0.6
  })

  if (!isOpen) {
    lores(elsTrail)
    return
  }

  const current = getImagesFromIndexes(imgs, [getCurrentElIndex(cordHist)])[0]
  const indexArrayToHires: number[] = []
  const indexArrayToCleanup: number[] = []

  switch (navVector) {
    case 'prev':
      indexArrayToHires.push(getPrevElIndex(cordHist, length))
      indexArrayToCleanup.push(getNextElIndex(cordHist, length))
      break
    case 'next':
      indexArrayToHires.push(getNextElIndex(cordHist, length))
      indexArrayToCleanup.push(getPrevElIndex(cordHist, length))
      break
    default:
      break
  }

  hires(getImagesFromIndexes(imgs, indexArrayToHires))
  gsap.set(getImagesFromIndexes(imgs, indexArrayToCleanup), { opacity: 0 })
  gsap.set(current, { x: 0, y: 0, scale: 1 })
  setLoaderForHiresImage({ gsap, img: current, mounted, setIsLoading })
}

export async function expandStage(args: {
  gsap: typeof gsap
  imgs: DesktopImage[]
  cordHist: HistoryItem[]
  trailLength: number
  length: number
  mounted: boolean
  setIsLoading: SetLoading
  setIsAnimating: (value: boolean) => void
}): Promise<void> {
  const {
    gsap,
    imgs,
    cordHist,
    trailLength,
    length,
    mounted,
    setIsLoading,
    setIsAnimating
  } = args

  if (!mounted) throw new Error('not mounted')

  setIsAnimating(true)

  const currentIndex = getCurrentElIndex(cordHist)
  const current = imgs[currentIndex]

  hires(
    getImagesFromIndexes(imgs, [
      currentIndex,
      getPrevElIndex(cordHist, length),
      getNextElIndex(cordHist, length)
    ])
  )
  setLoaderForHiresImage({ gsap, img: current, mounted, setIsLoading })

  const tl = gsap.timeline()
  const trailInactiveEls = getImagesFromIndexes(
    imgs,
    getTrailInactiveElsIndex(cordHist, trailLength)
  )

  tl.to(trailInactiveEls, {
    y: '+=20',
    ease: 'power3.in',
    stagger: 0.075,
    duration: 0.3,
    delay: 0.1,
    opacity: 0
  })
  tl.to(current, {
    x: 0,
    y: 0,
    ease: 'power3.inOut',
    duration: 0.7,
    delay: 0.3
  })
  tl.to(current, {
    delay: 0.1,
    scale: 1,
    ease: 'power3.inOut'
  })

  await tl.then(() => {
    setIsAnimating(false)
  })
}

export async function minimizeStage(args: {
  gsap: typeof gsap
  imgs: DesktopImage[]
  cordHist: HistoryItem[]
  trailLength: number
  mounted: boolean
  setIsAnimating: (value: boolean) => void
}): Promise<void> {
  const { gsap, imgs, cordHist, trailLength, mounted, setIsAnimating } = args
  if (!mounted) throw new Error('not mounted')

  setIsAnimating(true)

  const currentIndex = getCurrentElIndex(cordHist)
  const trailInactiveIndexes = getTrailInactiveElsIndex(cordHist, trailLength)

  lores(getImagesFromIndexes(imgs, [...trailInactiveIndexes, currentIndex]))

  const tl = gsap.timeline()
  const current = getImagesFromIndexes(imgs, [currentIndex])[0]
  const trailInactiveEls = getImagesFromIndexes(imgs, trailInactiveIndexes)

  tl.to(current, {
    scale: 0.6,
    duration: 0.6,
    ease: 'power3.inOut'
  })
  tl.to(current, {
    delay: 0.3,
    duration: 0.7,
    ease: 'power3.inOut',
    x: cordHist.slice(-1)[0].x - window.innerWidth / 2,
    y: cordHist.slice(-1)[0].y - window.innerHeight / 2
  })
  tl.to(trailInactiveEls, {
    y: '-=20',
    ease: 'power3.out',
    stagger: -0.1,
    duration: 0.3,
    opacity: 1
  })

  await tl.then(() => {
    setIsAnimating(false)
  })
}
