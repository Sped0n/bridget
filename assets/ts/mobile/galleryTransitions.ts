import { type gsap } from 'gsap'

export function animateGallery(
  gsapApi: typeof gsap,
  curtain: HTMLDivElement,
  gallery: HTMLDivElement,
  isOpen: boolean,
  onComplete: () => void
): gsap.core.Timeline {
  const timeline = gsapApi.timeline({ onComplete, defaults: { duration: 1 } })
  if (isOpen) {
    timeline.to(curtain, { opacity: 1 }, 0)
    timeline.to(gallery, { y: 0, ease: 'power3.inOut' }, 0.4)
  } else {
    timeline.to(gallery, { y: '100%', ease: 'power3.inOut' }, 0)
    timeline.to(curtain, { opacity: 0, duration: 1.2 }, 0.4)
  }
  return timeline
}
