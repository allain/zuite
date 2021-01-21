import { ZBounds } from './utils/ZBounds.mjs'
import { ZTransform } from './utils/ZTransform.mjs'
import { ZPoint } from './utils/ZPoint.mjs'
import { ZTransformActivity } from './activities/ZTransformActivity.mjs'

export class ZNode {
  constructor (options) {
    this.parent = null
    this.children = []
    this._listeners = new Set()
    this._fullBounds = null
    this._globalFullBounds = null
    this.invalidPaint = true

    this.transform = new ZTransform()
    this.visible = true

    this.focusable = options?.focusable || false
    this.minScale = options?.minScale || 0
    this.fillStyle = options?.fillStyle || null
    this.bounds = options?.bounds || new ZBounds()
    this.bufferSize = options?.bufferSize || false
  }

  invalidatePaint () {
    const root = this.root
    if (root) {
      root.invalidPaint = true
    }
  }

  paint (ctx) {
    if (!this.fillStyle || this.bounds.empty) return
    ctx.fillStyle = this.fillStyle
    ctx.fillRect(
      this.bounds.x,
      this.bounds.y,
      this.bounds.width,
      this.bounds.height
    )
  }

  paintAfterChildren (/*ctx*/) {}

  fullPaint (ctx, paintScale) {
    if (!this.visible) return

    const inViewport =
      !ctx.clipBounds || ctx.clipBounds.intersects(this.globalFullBounds)
    if (!inViewport) return

    paintScale *= this.transform.values[0]
    if (paintScale < this.minScale) return

    ctx.save()
    this.transform.applyTo(ctx)

    const paintChildren = this.paint(ctx, paintScale)
    if (paintChildren !== false) {
      for (const child of this.children) {
        child.fullPaint(ctx, paintScale)
      }
    }
    this.paintAfterChildren(ctx)
    ctx.restore()
  }

  scaleBy (ratio) {
    this.transform.scaleBy(ratio)
    this._fullBounds = null
    this._globalFullBounds = null
    this.invalidatePaint()

    return this
  }

  translateBy (dx, dy) {
    this.transform.translateBy(dx, dy)
    this._fullBounds = null
    this._globalFullBounds = null
    this.invalidatePaint()

    return this
  }

  rotateBy (theta) {
    this.transform.rotateBy(theta)
    this.invalidatePaint()
    if (this.parent) {
      this.parent.invalidateBounds()
      this._globalFullBounds = null
    }

    return this
  }

  addChild (...children) {
    for (const child of children) {
      child.parent = this
    }
    this.children.push(...children)

    this.invalidateBounds()
    this.invalidatePaint()

    return this
  }

  removeChild (child) {
    child.parent = null

    this.children = this.children.filter(c => c !== child)

    this.invalidateBounds()
    this.invalidatePaint()

    return this
  }

  setTransform (transform) {
    this.transform = transform

    if (this.parent) {
      this.parent.invalidateBounds()
      this._globalFullBounds = null
    }

    this.invalidatePaint()

    return this
  }

  animateToTransform (transform, duration, easing) {
    if (duration) {
      this.root.scheduler.schedule(
        new ZTransformActivity(this, transform, duration, easing)
      )
    } else {
      this.transform = transform
    }
  }

  get offset () {
    return new ZPoint(this.transform.values[4], this.transform.values[5])
  }

  set offset (val) {
    this.transform.values[4] = val.x
    this.transform.values[5] = val.y
    this.invalidateBounds()
  }

  get root () {
    return this.parent ? this.parent.root : null
  }

  get fullBounds () {
    if (this._fullBounds) return this._fullBounds

    if (this.layoutChildren) this.layoutChildren()

    const newFullBounds = new ZBounds(this.bounds)
    for (const child of this.children) {
      newFullBounds.add(child.transform.transform(child.fullBounds))
    }
    this._fullBounds = newFullBounds

    return this._fullBounds
  }

  get globalFullBounds () {
    if (this._globalFullBounds) return this._globalFullBounds

    const fb = this.fullBounds
    let currentNode = this
    let tl = new ZPoint(fb.x, fb.y)
    let br = new ZPoint(fb.x + fb.width, fb.y + fb.height)

    while (currentNode.parent) {
      tl = currentNode.transform.transform(tl)
      br = currentNode.transform.transform(br)
      currentNode = currentNode.parent
    }

    this._globalFullBounds = new ZBounds(
      Math.min(tl.x, br.x),
      Math.min(tl.y, br.y),
      Math.abs(tl.x - br.x),
      Math.abs(tl.y - br.y)
    )

    return this._globalFullBounds
  }

  get globalTransform () {
    let t = new ZTransform()
    let currentNode = this

    while (currentNode.parent) {
      t = currentNode.transform.transform(t)
      currentNode = currentNode.parent
    }

    return t
  }

  dispatchEvent (type, event) {
    for (const listener of this._listeners) {
      if (!listener[type]) continue

      const consumed = listener[type](event)
      if (consumed) {
        return true
      }
    }
  }

  invalidateBounds () {
    this._fullBounds = null
    this._globalFullBounds = null

    this.parent && this.parent.invalidateBounds()
  }

  localToParent (target) {
    return this.transform.transform(target)
  }

  parentToLocal (target) {
    return this.transform.inverse.transform(target)
  }

  addListener (listener) {
    this._listeners.add(listener)
  }

  get scale () {
    return this.transform.scale
  }

  set scale (newScale) {
    this.transform.values[0] = newScale
    this.transform.values[3] = newScale
    this.invalidateBounds()
    this.invalidatePaint()
  }

  moveToFront () {
    if (this.parent && this.parent.children.length > 1) {
      this.parent.children = [
        this,
        ...this.parent.children.filter(c => c !== this)
      ]
      this.invalidatePaint()
    }
    return this
  }

  moveToBack () {
    if (this.parent && this.parent.children.length > 1) {
      this.parent.children = [
        ...this.parent.children.filter(c => c !== this),
        this
      ]

      this.invalidatePaint()
    }
    return this
  }
}
