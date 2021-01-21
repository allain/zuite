import { ZNode } from '../ZNode.mjs'

export class ZImage extends ZNode {
  constructor (href, options = {}) {
    super(options)

    this.url = href ? href.url || href : ''

    this.loaded = false

    this.image = new Image()
    this.image.onload = ({ target }) => {
      this.bounds.width = target.width
      this.bounds.height = target.height

      this.invalidateBounds()
      this.loaded = true

      this.invalidatePaint()
      this.fullBounds
    }

    this.image.src = this.url
  }

  paint (ctx) {
    if (this.loaded) {
      ctx.drawImage(this.image, 0, 0)
    }
  }
}
