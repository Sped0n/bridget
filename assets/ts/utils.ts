export function increment(num: number, length: number): number {
  return (num + 1) % length
}

export function decrement(num: number, length: number): number {
  return (num + length - 1) % length
}

export function expand(num: number): string {
  return ('0000' + num.toString()).slice(-4)
}

export function isMobile(): boolean {
  return window.matchMedia('(hover: none)').matches
}

export class Watchable<T> {
  constructor(private obj: T) {}
  private watchers: (() => void)[] = []

  get(): T {
    return this.obj
  }

  set(e: T): void {
    this.obj = e
    this.watchers.forEach((watcher) => watcher())
  }

  addWatcher(watcher: () => void): void {
    this.watchers.push(watcher)
  }
}
