export class DragHandler {
  constructor(target) {
    this._dragging = false
    this._dragStart = null
    this.target = target
  }

  pointermove({ event }) {
    if (event.defaultPrevented) return
    if (!this._dragging) return
    event.preventDefault()
    if (!this._dragStart) return
    const dx = event.point.x - this._dragStart.x
    const dy = event.point.y - this._dragStart.y

    // if (dx * dx + dy * dx > 10) {
    this._dragging = true
    event.preventDefault()
    this.target.offset = { x: this._startPos.x + dx, y: this._startPos.y + dy }
    this.target.invalidatePaint()
    // }
  }

  pointerdown({ event }) {
    window.nav.locked = true
    this._dragging = true
    this._dragStart = event.point
    this._startPos = this.target.offset
  }

  pointerup({ event }) {
    if (event.defaultPrevented) return
    window.nav.locked = false

    if (this._dragging) {
      this._dragging = false
      this._dragStart = null
      event.preventDefault()
    }
  }
}
