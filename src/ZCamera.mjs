import { ZViewTransformActivity } from './activities/ZViewTransformActivity.mjs'
import { ZNode } from './ZNode.mjs'
import { ZPoint } from './utils/ZPoint.mjs'
import { ZTransform } from './utils/ZTransform.mjs'

export class ZCamera extends ZNode {
  constructor () {
    super()
    this.layers = []

    this._viewTransform = new ZTransform()
  }

  get viewTransform () {
    return this._viewTransform
  }

  set viewTransform (newTransform) {
    this._viewTransform = newTransform
    this.invalidatePaint()
  }

  paint (ctx, displayScale = 1) {
    super.paint(ctx)

    ctx.save()

    this._viewTransform.applyTo(ctx)
    displayScale *= this._viewTransform.values[0]

    const viewInverse = this._viewTransform.inverse
    ctx.clipBounds = viewInverse.transform(this.bounds)

    for (const layer of this.layers) {
      layer.fullPaint(ctx, displayScale)
    }

    ctx.restore()
  }

  addLayer (layer) {
    if (this.layers.includes(layer)) return

    this.layers.push(layer)
    layer.addCamera(this)

    this.invalidatePaint()
  }

  removeLayer (layer) {
    this.layers = this.layers.filter(l => l !== layer)

    this.invalidatePaint()
  }

  getPickedNodes (x, y) {
    const viewInverse = this._viewTransform.inverse
    const mousePoint = new ZPoint(x, y)
    const globalPoint = viewInverse.transform(mousePoint)
    const pickedNodes = this._getPickedNodes(this, mousePoint)

    let layerPoint
    for (const layer of this.layers) {
      layerPoint = layer.transform.inverse.transform(globalPoint)
      pickedNodes.push(...this._getPickedNodes(layer, layerPoint))
    }

    return pickedNodes
  }

  _getPickedNodes (parent, parentPoint) {
    const pickedChildren = []

    for (const child of parent.children) {
      const childBounds = child.fullBounds
      const childPoint = child.parentToLocal(parentPoint)
      if (childBounds.contains(childPoint)) {
        pickedChildren.push(...this._getPickedNodes(child, childPoint))
      }
    }

    return pickedChildren.length === 0 && !(parent instanceof ZCamera)
      ? [parent]
      : pickedChildren
  }

  animateViewToTransform (transform, duration, easing) {
    this.root.scheduler.schedule(
      new ZViewTransformActivity(this, transform, duration, easing)
    )
  }
}
