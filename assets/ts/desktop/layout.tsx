import { Show, createMemo, type JSX } from 'solid-js'

import { useImageState } from '../imageState'

import CustomCursor from './customCursor'
import Nav from './nav'
import Stage from './stage'
import StageNav from './stageNav'
import { useDesktopState } from './state'

/**
 * interfaces and types
 */

export interface DesktopImage extends HTMLImageElement {
  dataset: {
    hiUrl: string
    hiImgH: string
    hiImgW: string
    loUrl: string
    loImgH: string
    loImgW: string
  }
}

/**
 * components
 */

export default function Desktop(props: {
  children?: JSX.Element
  prevText: string
  closeText: string
  nextText: string
  loadingText: string
}): JSX.Element {
  const imageState = useImageState()
  const [desktop] = useDesktopState()

  const active = createMemo(() => desktop.isOpen() && !desktop.isAnimating())
  const cursorText = createMemo(() =>
    desktop.isLoading() ? props.loadingText : desktop.hoverText()
  )

  return (
    <>
      <Nav />
      <Show when={imageState().length > 0}>
        <Stage />
        <Show when={desktop.isOpen()}>
          <CustomCursor cursorText={cursorText} active={active} />
          <StageNav
            prevText={props.prevText}
            closeText={props.closeText}
            nextText={props.nextText}
          />
        </Show>
      </Show>
    </>
  )
}
