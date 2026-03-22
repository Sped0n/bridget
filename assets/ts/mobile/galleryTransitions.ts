import { type gsap } from 'gsap'

const OPEN_DELAY_MS = 1200
const CLOSE_DELAY_MS = 1400

export function openGallery(args: {
  gsap: typeof gsap
  curtain: HTMLDivElement
  gallery: HTMLDivElement
  setIsAnimating: (value: boolean) => void
  setIsScrollLocked: (value: boolean) => void
}): void {
  const { gsap, curtain, gallery, setIsAnimating, setIsScrollLocked } = args

  setIsAnimating(true)

  gsap.to(curtain, {
    opacity: 1,
    duration: 1
  })

  gsap.to(gallery, {
    y: 0,
    ease: 'power3.inOut',
    duration: 1,
    delay: 0.4
  })

  setTimeout(() => {
    setIsScrollLocked(true)
    setIsAnimating(false)
  }, OPEN_DELAY_MS)
}

export function closeGallery(args: {
  gsap: typeof gsap
  curtain: HTMLDivElement
  gallery: HTMLDivElement
  setIsAnimating: (value: boolean) => void
  setIsScrollLocked: (value: boolean) => void
  onClosed: () => void
}): void {
  const { gsap, curtain, gallery, setIsAnimating, setIsScrollLocked, onClosed } = args

  setIsAnimating(true)

  gsap.to(gallery, {
    y: '100%',
    ease: 'power3.inOut',
    duration: 1
  })

  gsap.to(curtain, {
    opacity: 0,
    duration: 1.2,
    delay: 0.4
  })

  setTimeout(() => {
    setIsScrollLocked(false)
    setIsAnimating(false)
    onClosed()
  }, CLOSE_DELAY_MS)
}
