import { ZLayer } from '../ZLayer.mjs'
import * as easings from '../easings.mjs'

function debounce (func, wait, immediate) {
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
  constructor (camera) {
    //    setTimeout(() => zoomTo(layer), 0)
    this.zoomTo = debounce(this.zoomToRaw, 200, true)
    this.camera = camera
    this.layer = camera.layers[0]
    this.lastFocus = null
  }

  findUp (node, test) {
    return node === null || test(node) ? node : this.findUp(node.parent, test)
  }

  zoomToRaw (newFocus) {
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

    this.camera.animateViewToTransform(inverse, 500, easings.inOutExpo)
  }

  zoomOut () {
    const newFocus = this.findUp(this.lastFocus.parent, () => true)

    this.zoomTo(newFocus || this.layer)
  }

  findFocusPath (target) {
    let newTarget = target

    const zoomPath = []
    do {
      newTarget = this.findUp(newTarget, n => n.focusable)
      if (newTarget) {
        zoomPath.unshift(newTarget)
        newTarget = newTarget.parent
      }
    } while (newTarget)

    return zoomPath
  }

  click ({ pickedNodes }) {
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
    return true
  }

  mouseup (event) {
    if (event.event.button === 2) {
      this.zoomOut()
      return true
    }
  }

  wheel ({ event, pickedNodes }) {
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
