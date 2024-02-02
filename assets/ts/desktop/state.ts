import { Watchable } from '../utils'

/**
 * types
 */

export interface HistoryItem {
  i: number
  x: number
  y: number
}

/**
 * variables
 */

export const cordHist = new Watchable<HistoryItem[]>([])
export const isOpen = new Watchable<boolean>(false)
export const active = new Watchable<boolean>(false)
export const isLoading = new Watchable<boolean>(false)
