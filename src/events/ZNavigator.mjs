import { ZLayer } from "../ZLayer.mjs"
import { ZPoint } from "../utils/ZPoint.mjs"
import { ZTransform } from "../utils/ZTransform.mjs"
import * as easings from "../easings.mjs"

function debounce(func, wait, immediate) {
  var timeout
  return function () {
    var context = this,
      args = arguments
    var later = function () {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    var callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

export class ZNavigator {
  constructor(camera) {
    //    setTimeout(() => zoomTo(layer), 0)
    this.zoomTo = debounce(this.zoomToRaw, 200, true)
    this.camera = camera
    this.layer = camera.layers[0]
    this.lastFocus = null
    this.downPoint = null
    this.dragDistance = 0
    this.locked = false
  }

  findUp(node, test) {
    return node === null || test(node) ? node : this.findUp(node.parent, test)
  }

  zoomToRaw(newFocus, duration = 500) {
    if (!newFocus) {
      newFocus = this.layer
    }
    this.lastFocus = newFocus

    const globalTransform = newFocus.globalTransform
    const inverse = globalTransform.inverse
    const focusBounds =
      newFocus === this.layer ? this.layer.fullBounds : newFocus.fullBounds

    inverse.translateBy(
      (this.camera.bounds.width - focusBounds.width) / 2,
      (this.camera.bounds.height - focusBounds.height) / 2
    )

    this.camera.animateViewToTransform(inverse, duration, easings.inOutExpo)
  }

  zoomOut() {
    const newFocus = this.findUp(this.lastFocus.parent, () => true)

    this.zoomTo(newFocus || this.layer)
  }

  findFocusPath(target) {
    let newTarget = target

    const zoomPath = []
    do {
      newTarget = this.findUp(newTarget, (n) => n.focusable)
      if (newTarget) {
        zoomPath.unshift(newTarget)
        newTarget = newTarget.parent
      }
    } while (newTarget)

    return zoomPath
  }

  pointermove({ event }) {
    if (!this.downPoint) return
    const drag = new ZPoint(
      event.clientX - this.downPoint.x,
      event.clientY - this.downPoint.y
    )
    const dragDistance = Math.sqrt(drag.x * drag.x + drag.y * drag.y)
    // TODO: make drag distance use the sum of all drag line segments
    this.dragDistance = Math.max(dragDistance, this.dragDistance)

    // panning
    if (event.buttons === 1 && dragDistance > 5) {
      this.camera.viewTransform = new ZTransform([
        ...this.downViewTransform.values,
      ]).translateBy(drag.x, drag.y)
    }
  }

  pointerup({ event, pickedNodes }) {
    if (this.locked) return

    this.downPoint = null
    const dragDistance = this.dragDistance
    this.dragDistance = 0
    if (dragDistance > 20) {
      return
    }

    if (event.button === 2) {
      this.zoomOut()
      return true
    }

    const zoomPath = this.findFocusPath(pickedNodes[0])
    if (zoomPath.length === 0) {
      this.zoomTo(this.layer)
      return true
    }
    let newFocus
    if (this.lastFocus == null || this.lastFocus instanceof ZLayer) {
      newFocus = zoomPath[0]
      this.zoomTo(zoomPath[0])
      return true
    }

    const lastFocusScale = this.lastFocus.globalTransform.scale
    let currentFocusScale = 1
    // set newFocus to the things at or smaller than the current focus in the zoom path
    do {
      newFocus = zoomPath[0]
      currentFocusScale = newFocus.globalTransform.scale
      if (currentFocusScale > lastFocusScale) {
        zoomPath.shift()
      }
    } while (currentFocusScale > lastFocusScale && zoomPath.length)

    this.zoomTo(
      newFocus === this.lastFocus ? zoomPath[1] || newFocus : newFocus
    )
    return event.button === 1
  }

  pointerdown({ event }) {
    if (this.locked) return

    this.downViewTransform = this.camera.viewTransform
    this.downPoint = { x: event.clientX, y: event.clientY }
    this.dragDistance = 0
  }

  _screenDragDistance(event) {
    return Math.sqrt(
      Math.pow(event.clientX - this.downPoint.x, 2) +
        Math.pow(event.clientY - this.downPoint.y, 2)
    )
    // const globalDragDistance = Math.sqrt(
    //   Math.pow(event.point.x - this.downPoint.x, 2) +
    //     Math.pow(event.point.y - this.downPoint.y, 2)
    // )
    // return this.camera.viewTransform.scale * globalDragDistance
  }

  wheel({ event, pickedNodes }) {
    if (this.locked) return

    if (event.deltaY < 0) {
      const zoomPath = this.findFocusPath(pickedNodes[0])
      if (zoomPath.length === 0) {
        // this.zoomTolayer)
        return true
      }
      let newFocus
      if (this.lastFocus == null || this.lastFocus instanceof ZLayer) {
        newFocus = zoomPath[0]
        this.zoomTo(zoomPath[0])
        return true
      }

      const lastFocusScale = this.lastFocus.globalTransform.scale
      let currentFocusScale = 1
      // set newFocus to the things at or smaller than the current focus in the zoom path
      do {
        newFocus = zoomPath[0]
        currentFocusScale = newFocus.globalTransform.scale
        if (currentFocusScale > lastFocusScale) {
          zoomPath.shift()
        }
      } while (currentFocusScale > lastFocusScale && zoomPath.length)
      this.zoomTo(
        newFocus === this.lastFocus ? zoomPath[1] || newFocus : newFocus
      )
      return true
    } else {
      this.zoomOut()
    }
  }
}
