import { type JSX } from '@solidjs/web'
import { createMemo } from 'solid-js'

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
  const imageState = useImageState()
  const [mobile, { close }] = useMobileState()
  const indexValue = createMemo(() => {
    const state = mobile()
    return expand(state.phase === 'closed' ? 0 : state.index + 1)
  })
  const indexLength = createMemo(() => expand(imageState().length))

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
        <button class="navClose" type="button" onClick={() => close()}>
          {capitalizeFirstLetter(props.closeText)}
        </button>
      </div>
    </>
  )
}
