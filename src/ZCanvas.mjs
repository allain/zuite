import { ZBounds } from './utils/ZBounds.mjs'
import { ZCamera } from './ZCamera.mjs'
import { ZLayer } from './ZLayer.mjs'
import { ZRoot } from './ZRoot.mjs'
import { ZText } from './nodes/ZText.mjs'

export class ZCanvas {
  constructor (canvas, root = new ZRoot()) {
    const _pCanvas = this

    this.canvas = canvas
    canvas.font = ZText.fontSize + 'px ' + ZText.font
    this.root = root
    this.camera = new ZCamera()
    this.camera.bounds = new ZBounds(0, 0, canvas.width, canvas.height)

    const layer = new ZLayer()
    this.root.addChild(layer)
    this.root.addChild(this.camera)
    this.camera.addLayer(layer)

    const animate = () => {
      requestAnimationFrame(animate)
      this.paint()
    }

    setTimeout(animate, 0)

    function dispatchEvent (type, event, pickedNodes = []) {
      let consumed = false
      for (let currentNode of pickedNodes) {
        while (!consumed && currentNode) {
          consumed = currentNode.dispatchEvent(type, { event, pickedNodes })
          currentNode = currentNode.parent
        }
      }
      return consumed
    }

    let previousPickedNodes = []

    const subtract = (a, b) => a.filter(aItem => !b.includes(aItem))

    function processMouseOvers (oldNodes, newNodes, event) {
      const mouseOutNodes = subtract(oldNodes, newNodes)
      const mouseOverNodes = subtract(newNodes, oldNodes)

      dispatchEvent('mouseout', event, mouseOutNodes)
      dispatchEvent('mouseover', event, mouseOverNodes)
    }

    function processMouseEvent (name, event) {
      event.preventDefault()

      const x = event.pageX - canvas.offsetLeft
      const y = event.pageY - canvas.offsetTop
      const newPickedNodes = _pCanvas.getPickedNodes(x, y)

      processMouseOvers(previousPickedNodes, newPickedNodes, event)

      dispatchEvent(name, event, newPickedNodes)
      previousPickedNodes = newPickedNodes
    }

    canvas.addEventListener('contextmenu', event => {
      event.stopPropagation()
      event.preventDefault()
    })

    for (const eventName of [
      'click',
      'mousemove',
      'mousedown',
      'mouseup',
      'wheel'
    ]) {
      canvas.addEventListener(eventName, event =>
        processMouseEvent(eventName, event)
      )
    }

    canvas.addEventListener('mouseout', event => {
      dispatchEvent('mouseout', event, previousPickedNodes)
      previousPickedNodes = []
    })
  }

  paint () {
    const root = this.camera.root
    if (!root.invalidPaint) return

    const ctx = this.canvas.getContext('2d')

    ctx.font = ZText.fontSize + 'px ' + ZText.font
    ctx.fillStyle = this.fillStyle || 'rgb(255,255,255)'

    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.camera.fullPaint(ctx, 1)

    root.invalidPaint = false
  }

  getPickedNodes (x, y) {
    return this.camera.getPickedNodes(x, y)
  }
}
