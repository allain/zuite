import { ZNode } from '../ZNode.mjs'

export class ZRect extends ZNode {
  constructor(options) {
    super(options)
    this.radius = options.radius ?? 0
  }

  paint(ctx) {
    if (!this.fillStyle || this.bounds.empty) return
    ctx.fillStyle = this.fillStyle
    if (this.radius) {
      ctx.beginPath()
      ctx.roundRect(
        this.bounds.x,
        this.bounds.y,
        this.bounds.width,
        this.bounds.height,
        this.radius
      )
      ctx.fill()
    } else {
      ctx.fillRect(
        this.bounds.x,
        this.bounds.y,
        this.bounds.width,
        this.bounds.height
      )
    }
  }
}
