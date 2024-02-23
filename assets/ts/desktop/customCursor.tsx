import { createSignal, onCleanup, onMount, type Accessor, type JSX } from 'solid-js'

export default function CustomCursor(props: {
  children?: JSX.Element
  active: Accessor<boolean>
  cursorText: Accessor<string>
  isOpen: Accessor<boolean>
}): JSX.Element {
  // types
  interface XY {
    x: number
    y: number
  }

  // variables
  let controller: AbortController | undefined

  // states
  const [xy, setXy] = createSignal<XY>({ x: 0, y: 0 })

  // helper functions
  const onMouse: (e: MouseEvent) => void = (e) => {
    const { clientX, clientY } = e
    setXy({ x: clientX, y: clientY })
  }

  // effects
  onMount(() => {
    controller = new AbortController()
    const abortSignal = controller.signal
    window.addEventListener('mousemove', onMouse, {
      passive: true,
      signal: abortSignal
    })
  })

  onCleanup(() => {
    controller?.abort()
  })

  return (
    <>
      <div
        class="cursor"
        classList={{ active: props.active() }}
        style={{ transform: `translate3d(${xy().x}px, ${xy().y}px, 0)` }}
      >
        <div class="cursorInner">{props.cursorText()}</div>
      </div>
    </>
  )
}
