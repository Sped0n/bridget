import { createMemo, type JSX } from 'solid-js'

import { useImageState } from '../imageState'
import { expand } from '../utils'

import { useMobileState } from './state'

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function GalleryNav(props: {
  children?: JSX.Element
  closeText: string
}): JSX.Element {
  // states
  const imageState = useImageState()
  const [mobile, { setIsOpen }] = useMobileState()
  const indexValue = createMemo(() => expand(mobile.index() + 1))
  const indexLength = createMemo(() => expand(imageState().length))

  const onClick: () => void = () => {
    if (mobile.isAnimating()) return
    setIsOpen(false)
  }

  return (
    <>
      <div class="nav">
        <div>
          <span class="num">{indexValue()[0]}</span>
          <span class="num">{indexValue()[1]}</span>
          <span class="num">{indexValue()[2]}</span>
          <span class="num">{indexValue()[3]}</span>
          <span>/</span>
          <span class="num">{indexLength()[0]}</span>
          <span class="num">{indexLength()[1]}</span>
          <span class="num">{indexLength()[2]}</span>
          <span class="num">{indexLength()[3]}</span>
        </div>
        <div
          class="navClose"
          onClick={onClick}
          onTouchEnd={onClick}
          onKeyDown={onClick}
          role="button"
          tabIndex="0"
        >
          {capitalizeFirstLetter(props.closeText)}
        </div>
      </div>
    </>
  )
}
