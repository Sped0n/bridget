import { createMemo, type Accessor, type JSX, type Setter } from 'solid-js'

import { useState } from '../state'
import { expand } from '../utils'

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function GalleryNav(props: {
  children?: JSX.Element
  closeText: string
  isAnimating: Accessor<boolean>
  setIsOpen: Setter<boolean>
}): JSX.Element {
  // states
  const [state] = useState()
  const indexValue = createMemo(() => expand(state().index + 1))
  const indexLength = createMemo(() => expand(state().length))

  const onClick: () => void = () => {
    if (props.isAnimating()) return
    props.setIsOpen(false)
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
        <div onClick={onClick} onKeyDown={onClick}>
          {capitalizeFirstLetter(props.closeText)}
        </div>
      </div>
    </>
  )
}
