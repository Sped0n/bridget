import { createEffect, on, type Accessor, type JSX, type Setter } from 'solid-js'

import { useState } from '../state'
import { expand } from '../utils'

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function GalleryNav(props: {
  children?: JSX.Element
  closeText: string
  isAnimating: Accessor<boolean>
  setIsOpen: Setter<boolean>
}): JSX.Element {
  // variables
  const indexNums: HTMLSpanElement[] = Array<HTMLSpanElement>(8)

  // states
  const [state] = useState()
  const stateLength = state().length

  // helper functions
  const updateIndexText: () => void = () => {
    const indexValue: string = expand(state().index + 1)
    const indexLength: string = expand(stateLength)
    indexNums.forEach((e: HTMLSpanElement, i: number) => {
      if (i < 4) {
        e.innerText = indexValue[i]
      } else {
        e.innerText = indexLength[i - 4]
      }
    })
  }

  const onClick: () => void = () => {
    if (props.isAnimating()) return
    props.setIsOpen(false)
  }

  // effects
  createEffect(
    on(
      () => {
        state()
      },
      () => {
        updateIndexText()
      },
      { defer: true }
    )
  )

  return (
    <>
      <div class="nav">
        <div>
          <span ref={indexNums[0]} class="num" />
          <span ref={indexNums[1]} class="num" />
          <span ref={indexNums[2]} class="num" />
          <span ref={indexNums[3]} class="num" />
          <span>/</span>
          <span ref={indexNums[4]} class="num" />
          <span ref={indexNums[5]} class="num" />
          <span ref={indexNums[6]} class="num" />
          <span ref={indexNums[7]} class="num" />
        </div>
        <div onClick={onClick} onKeyDown={onClick}>
          {capitalizeFirstLetter(props.closeText)}
        </div>
      </div>
    </>
  )
}
