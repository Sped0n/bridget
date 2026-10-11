// Vite supplies the entry graphs inside this script's enclosing function.
declare const entryPreloads: Record<'desktop' | 'mobile', string[]>

;(() => {
  const entryLoader = document.currentScript
  if (
    !(entryLoader instanceof HTMLScriptElement) ||
    entryLoader.dataset.base === undefined
  ) {
    throw new Error('Entry loader requires an inline script with an asset base URL')
  }
  const base = entryLoader.dataset.base

  const updateWindowHeight = () =>
    document.documentElement.style.setProperty(
      '--window-height',
      `${window.innerHeight}px`
    )
  updateWindowHeight()
  window.addEventListener('resize', updateWindowHeight, { passive: true })

  const ua = navigator.userAgent.toLowerCase()
  const hasTouchInput = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const hasTouchLayout =
    matchMedia('(pointer: coarse)').matches || matchMedia('(hover: none)').matches
  const isMobileUA = /android|iphone|ipad|ipod|mobile/.test(ua)
  const isWindowsDesktop = /windows nt/.test(ua)
  const isMobile = isMobileUA || (hasTouchInput && hasTouchLayout && !isWindowsDesktop)
  const files = entryPreloads[isMobile ? 'mobile' : 'desktop']

  for (const file of files) {
    const preload = document.createElement('link')
    preload.rel = 'modulepreload'
    preload.href = new URL(file, base).href
    document.head.appendChild(preload)
  }

  const script = document.createElement('script')
  script.type = 'module'
  script.src = new URL(files[0], base).href
  document.head.appendChild(script)
})()
