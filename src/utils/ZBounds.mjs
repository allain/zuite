export class ZBounds {
  constructor(...args) {
    if (args.length === 1) {
      this.x = args[0].x
      this.y = args[0].y
      this.width = args[0].width
      this.height = args[0].height
      this.touched = true
    } else {
      this.x = args[0] || 0
      this.y = args[1] || 0
      this.width = args[2] || 0
      this.height = args[3] || 0
      this.touched = args.length > 0
    }
  }

  equals(bounds) {
    return (
      bounds.x === this.x &&
      bounds.y === this.y &&
      bounds.width === this.width &&
      bounds.height === this.height
    )
  }

  get empty() {
    return this.width === 0 && this.height === 0
  }

  add(...args) {
    if (args.length === 1) {
      const src = args[0]
      this._add(src.x, src.y, src.width || 0, src.height || 0)
    } else {
      this._add(args[0], args[1], args[2] || 0, args[3] || 0)
    }
  }

  _add(x, y, width, height) {
    if (this.touched) {
      const newX = Math.min(x, this.x)
      const newY = Math.min(y, this.y)
      Object.assign(this, {
        x: newX,
        y: newY,
        width: Math.max(this.x + this.width, x + width) - newX,
        height: Math.max(this.y + this.height, y + height) - newY
      })
    } else {
      this.x = x
      this.y = y
      this.width = width
      this.height = height
      this.touched = true
    }
  }

  contains(...args) {
    let x, y
    if (args.length === 1) {
      x = args[0].x
      y = args[0].y
    } else if (args.length === 2) {
      x = args[0]
      y = args[1]
    } else {
      throw new Error('invalid args')
    }

    return (
      x >= this.x &&
      x < this.x + this.width &&
      y >= this.y &&
      y < this.y + this.height
    )
  }

  intersects({ x, y, width, height }) {
    return !(
      x + width < this.x ||
      x > this.x + this.width ||
      y + height < this.y ||
      y > this.y + this.height
    )
  }
}
