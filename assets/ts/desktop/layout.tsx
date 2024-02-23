// eslint-disable-next-line sort-imports
import { Show, createMemo, createSignal, type JSX } from 'solid-js'

import type { ImageJSON } from '../resources'
import type { Vector } from '../utils'

import CustomCursor from './customCursor'
import Nav from './nav'
import Stage from './stage'
import StageNav from './stageNav'

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

export interface HistoryItem {
  i: number
  x: number
  y: number
}

/**
 * components
 */

export default function Desktop(props: {
  children?: JSX.Element
  ijs: ImageJSON[]
  prevText: string
  closeText: string
  nextText: string
  loadingText: string
}): JSX.Element {
  const [cordHist, setCordHist] = createSignal<HistoryItem[]>([])
  const [isLoading, setIsLoading] = createSignal(false)
  const [isOpen, setIsOpen] = createSignal(false)
  const [isAnimating, setIsAnimating] = createSignal(false)
  const [hoverText, setHoverText] = createSignal('')
  const [navVector, setNavVector] = createSignal<Vector>('none')

  const active = createMemo(() => isOpen() && !isAnimating())
  const cursorText = createMemo(() => (isLoading() ? props.loadingText : hoverText()))

  return (
    <>
      <Nav />
      <Show when={props.ijs.length > 0}>
        <Stage
          ijs={props.ijs}
          setIsLoading={setIsLoading}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          isAnimating={isAnimating}
          setIsAnimating={setIsAnimating}
          cordHist={cordHist}
          setCordHist={setCordHist}
          navVector={navVector}
          setNavVector={setNavVector}
        />
        <Show when={isOpen()}>
          <CustomCursor cursorText={cursorText} active={active} isOpen={isOpen} />
          <StageNav
            prevText={props.prevText}
            closeText={props.closeText}
            nextText={props.nextText}
            loadingText={props.loadingText}
            active={active}
            isAnimating={isAnimating}
            setCordHist={setCordHist}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            setHoverText={setHoverText}
            navVector={navVector}
            setNavVector={setNavVector}
          />
        </Show>
      </Show>
    </>
  )
}
