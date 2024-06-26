import { ZCanvas } from '../js/ZCanvas.mjs'
import { ZNode } from '../js/ZNode.mjs'
import { Page } from './Page.mjs'
import { ZPoint } from '../js/utils/ZPoint.mjs'
import { ZTransform } from '../js/utils/ZTransform.mjs'
import * as easings from '../js/easings.mjs'

import { SmlDocument } from '@stenway/sml'

import aStar from 'https://cdn.jsdelivr.net/npm/a-star@0.2.0/+esm'

import {
  Point,
  Line,
  Rectangle,
  intersections
} from 'https://cdn.jsdelivr.net/npm/@mathigon/euclid@1.1.17/+esm'

class Connector extends ZNode {
  constructor(from, to, dodge = [], margin = 0) {
    super()
    this.from = from
    this.to = to
    this.dodge = dodge
    this.margin = margin
  }

  paint(ctx) {
    const margin = this.margin
    const fromBounds = this.from.globalFullBounds
    const fromPos = new Point(fromBounds.x, fromBounds.y)
    const fromRect = new Rectangle(fromPos, fromBounds.width, fromBounds.height)
    const fromCenter = fromRect.center
    const toBounds = this.to.globalFullBounds
    const toPos = new Point(toBounds.x, toBounds.y)
    const toScale = this.to.globalTransform.scale
    const toRect = new Rectangle(
      toPos,
      toBounds.width * toScale,
      toBounds.height * toScale
    )
    const toCenter = toRect.center

    const line = new Line(fromCenter, toCenter)
    line.type = 'segment'

    const [p1, p2] = intersections(
      line,
      expandRect(fromRect, 20),
      expandRect(toRect, 20)
    )

    const GRID_SIZE = 10

    const dodgeRects = this.dodge
      .map((d) => {
        const dBounds = d.globalFullBounds
        const pos = new Point(dBounds.x, dBounds.y)
        pos.x -= margin
        pos.y -= margin
        const rect = new Rectangle(
          pos,
          dBounds.width + margin * 2,
          dBounds.height + margin * 2
        )
        return rect
      })
      .filter((d) => !d.contains(p1) && !d.contains(p2))
    const l = new Line(p1, p2)
    l.type = 'segment'

    const result = aStar({
      start: p1,
      isEnd(node) {
        return Point.distance(p2, node) < GRID_SIZE
      },
      neighbor(p) {
        return [
          new Point(p.x - GRID_SIZE, p.y - GRID_SIZE),
          new Point(p.x, p.y - GRID_SIZE),
          new Point(p.x + GRID_SIZE, p.y - GRID_SIZE),
          new Point(p.x - GRID_SIZE, p.y),
          new Point(p.x + GRID_SIZE, p.y),
          new Point(p.x - GRID_SIZE, p.y + GRID_SIZE),
          new Point(p.x, p.y + GRID_SIZE),
          new Point(p.x - GRID_SIZE, p.y + GRID_SIZE)
        ]
      },
      distance(p1, p2) {
        return Point.distance(p1, p2)
      },
      heuristic(p) {
        for (const rect of dodgeRects) {
          if (rect.contains(p)) return Number.POSITIVE_INFINITY
        }
        return Point.distance(p, p2)
      },
      hash(p) {
        return p.x + ',' + p.y
      },
      timeout: 500
    })
    const path = douglasPeucker(result.path, 3)

    if (path.length < 2) return
    ctx.strokeStyle = '#00A3F5'
    ctx.lineWidth = 5

    // drawSmoothLine(ctx, path)
    ctx.beginPath()
    path.forEach((p, index) => {
      if (index === 0) {
        ctx.moveTo(p.x, p.y)
      } else {
        ctx.lineTo(p.x, p.y)
      }
    })
    ctx.stroke()
  }
}

function expandRect(rect, size) {
  return new Rectangle(
    new Point(rect.p.x - size, rect.p.y - size),
    rect.w + size * 2,
    rect.h + size * 2
  )
}

function douglasPeucker(points, epsilon) {
  // Find the point with the maximum distance from line between the start and end
  let maxDistance = 0
  let index = 0
  for (let i = 1; i < points.length - 1; i++) {
    let distance = perpendicularDistance(
      points[i],
      points[0],
      points[points.length - 1]
    )
    if (distance > maxDistance) {
      index = i
      maxDistance = distance
    }
  }

  // If max distance is greater than epsilon, recursively simplify
  if (maxDistance > epsilon) {
    // Recursive call
    let recResults1 = douglasPeucker(points.slice(0, index + 1), epsilon)
    let recResults2 = douglasPeucker(
      points.slice(index, points.length),
      epsilon
    )

    // Build the result list
    return recResults1.slice(0, recResults1.length - 1).concat(recResults2)
  } else {
    // All points are within epsilon distance of the linear segment
    return [points[0], points[points.length - 1]]
  }
}

function perpendicularDistance(point, lineStart, lineEnd) {
  let x0 = point.x
  let y0 = point.y
  let x1 = lineStart.x
  let y1 = lineStart.y
  let x2 = lineEnd.x
  let y2 = lineEnd.y
  let numerator = Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1)
  let denominator = Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2)
  return numerator / denominator
}

function drawSmoothLine(ctx, points) {
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  for (let i = 1; i < points.length - 2; i++) {
    let cp = {
      x: (points[i].x + points[i + 1].x) / 2,
      y: (points[i].y + points[i + 1].y) / 2
    }
    ctx.quadraticCurveTo(points[i].x, points[i].y, cp.x, cp.y)
  }
  // Curve through the last two points
  ctx.quadraticCurveTo(
    points[points.length - 2].x,
    points[points.length - 2].y,
    points[points.length - 1].x,
    points[points.length - 1].y
  )

  ctx.stroke()
}

async function main() {
  const canvasEl = document.querySelector('canvas')
  canvasEl.width = window.innerWidth - 300
  canvasEl.height = window.innerHeight
  const canvas = new ZCanvas(canvasEl)

  const layer = canvas.camera.layers[0]

  layer.addListener({
    _dragDistance: 0,
    _lastFocus: null,
    _buttons: 0,
    _findUp(node, test) {
      return node === null || test(node)
        ? node
        : this._findUp(node.parent, test)
    },

    pointerdown({ event, pickedNodes }) {
      this._dragDistance = 0
      this._buttons = event.buttons
      const focusNode = pickedNodes.find((n) =>
        this._findUp(n, (n) => n.draggable)
      )
      if (focusNode) {
        this._lastFocus = focusNode
        this._dragging = focusNode.draggable
        this._dragStart = event.point
        this._startOffset = new ZPoint(
          this._dragging.offset.x,
          this._dragging.offset.y
        )
      } else {
        this._dragging = canvas.camera
        this._dragStart = { x: event.clientX, y: event.clientY }
        this._startViewTransform = canvas.camera.viewTransform.values
      }
    },
    pointerup({ pickedNodes }) {
      this._stopDragging()
      const focusNode = pickedNodes.find((n) =>
        this._findUp(n, (n) => n.focusable)
      )

      if (this._dragDistance < 10) {
        if (focusNode) {
          if (this._buttons === 1) {
            this.zoomToRaw(focusNode)
          } else if (this._buttons === 2) {
            const parent = this._findUp(focusNode.parent, (n) => n.focusable)
            if (parent) {
              this.zoomToRaw(focusNode)
            } else {
              this.zoomToRaw(layer)
            }
          }
        } else {
          this.zoomToRaw(layer)
        }
      }
    },
    zoomToRaw(newFocus, duration = 500) {
      if (!newFocus) {
        newFocus = layer
      }
      this.lastFocus = newFocus

      const globalTransform = newFocus.globalTransform
      const inverse = globalTransform.inverse
      const focusBounds =
        newFocus === this.layer ? this.layer.fullBounds : newFocus.fullBounds

      const scale = canvas.camera.scale
      inverse.translateBy(
        (canvas.camera.bounds.width - focusBounds.width / scale) / 2,
        (canvas.camera.bounds.height - focusBounds.height / scale) / 2
      )

      canvas.camera.animateViewToTransform(inverse, duration, easings.inOutExpo)
    },
    _stopDragging() {
      this._dragging = null
      this._dragStart = null
      this._startViewTransform = null
    },
    pointermove({ event }) {
      if (!this._dragging) return

      if (this._dragging && (event.buttons & 1) === 0) {
        this._stopDragging()
        return
      }

      const scale = canvas.camera.scale

      if (this._startViewTransform) {
        const dx = (event.clientX - this._dragStart.x) / scale
        const dy = (event.clientY - this._dragStart.y) / scale
        this._dragDistance = Math.sqrt(dx * dx + dy * dy)
        this._dragging.viewTransform = new ZTransform([
          ...this._startViewTransform
        ]).translateBy(dx, dy)
        this._dragging._globalFullBounds = null
      } else {
        const dx = (event.point.x - this._dragStart.x) / scale
        const dy = (event.point.y - this._dragStart.y) / scale
        this._dragDistance = Math.sqrt(dx * dx + dy * dy)
        this._dragging.offset = {
          x: this._startOffset.x + dx,
          y: this._startOffset.y + dy
        }
        this._dragging._globalFullBounds = null
        this._dragging.invalidatePaint()
      }
      updateConnectors()
    }
  })

  canvas.fillStyle = '#aaaaaa'
  const siteEl = document.getElementById('site')
  siteEl.height = window.innerHeight

  window.addEventListener('resize', () => {
    canvasEl.width = window.innerWidth
    canvasEl.height = window.innerHeight
    siteEl.height = window.innerHeight
    canvas.bounds = [0, 0, window.innerWidth, window.innerHeight]
  })
  // const navigator = new ZNavigator(canvas.camera)
  // window.nav = navigator
  // layer.addListener(navigator)

  const pages = new ZNode()
  const connectors = new ZNode()

  const params = new URLSearchParams(document.location.search)
  const uiName = params.get('ui') ?? 'starter'
  let spec = localStorage.getItem('spec-' + uiName)
  spec ??= await fetch('/ui/uis/' + uiName + '.ui').then((res) => res.text())
  siteEl.value = spec

  siteEl.addEventListener('input', () => {
    buildFromSite()
  })

  siteEl.addEventListener('keydown', function (event) {
    switch (event.key) {
      case 'Enter': {
        const start = this.selectionStart
        const end = this.selectionEnd

        let padding = ''
        const value = event.target.value
        for (let i = start - 1; i > 0; i--) {
          if (value[i] === '\n') {
            padding = value.substring(i + 1)
            console.log(padding)
            padding = padding.match(/^(\s*)/)[1]
            break
          }
        }
        event.target.value =
          value.substring(0, start) + '\n' + padding + value.substring(end)

        // put caret at right position again (add one for the tab)
        this.selectionStart = this.selectionEnd = start + padding.length + 1
        event.preventDefault()
        break
      }
      case 'Tab': {
        const start = this.selectionStart
        const end = this.selectionEnd

        const value = event.target.value

        // set textarea value to: text before caret + tab + text after caret
        if (event.shiftKey) {
          let padding = ''
          const value = event.target.value
          let i
          for (i = start - 1; i > 0; i--) {
            if (value[i] === '\n') {
              padding = value.substring(i + 1)
              padding = padding.match(/^(\s*)/)[1]
              break
            }
          }
          event.target.value =
            value.substring(0, i + 1) +
            padding.substring(2) +
            value.substring(i + padding.length)
          this.selectionStart = this.selectionEnd = start - 1
        } else {
          event.target.value =
            value.substring(0, start) + '\t' + value.substring(end)

          // put caret at right position again (add one for the tab)
          this.selectionStart = this.selectionEnd = start + 1
        }

        // prevent the focus lose
        event.preventDefault()
        break
      }
    }
  })

  siteEl.addEventListener('change', () => {
    try {
      const siteDoc = SmlDocument.parse(siteEl.value)
      siteDoc.root.alignAttributes('  ', 1)
      const newSiteDoc = siteDoc.toString(false)
      if (newSiteDoc !== siteDoc) {
        siteEl.value = newSiteDoc
      }
      localStorage.setItem('spec-' + uiName, newSiteDoc)
    } catch (err) {
      console.error(err)
    }
  })

  function buildFromSite() {
    globalThis.targets = new Map()
    globalThis.links = []
    let siteDoc
    try {
      siteDoc = SmlDocument.parse(siteEl.value)
      for (const child of pages.children) {
        pages.removeChild(child)
      }
    } catch (err) {
      console.error(err.message)
      return
    }
    for (const pageInfo of siteDoc.root.elements()) {
      const pageTitle = pageInfo.hasAttribute('title')
        ? pageInfo.attribute('title').values.join(' ')
        : ''
      const sections = []

      for (const sectionInfo of pageInfo.nodes) {
        if (sectionInfo.isElement()) {
          const section = {
            type: sectionInfo.name.toLowerCase()
          }
          for (const attr of sectionInfo.attributes()) {
            const rawValue = attr.values[0]
            let cleanValue
            if (rawValue === null) {
              cleanValue = true
            } else if (rawValue === 'false') {
              cleanValue = false
            } else if (rawValue.match(/^\d+([.]\d+)?$/)) {
              cleanValue = parseFloat(rawValue)
            } else {
              cleanValue = attr.values.join(' ')
            }
            section[attr.name.toLowerCase()] = cleanValue
          }
          sections.push(section)
        } else if (
          sectionInfo.isAttribute() &&
          sectionInfo.values[0] === null
        ) {
          sections.push({
            type: sectionInfo.name.toLowerCase()
          })
        }
      }

      const page = new Page(pageTitle, { sections })

      pages.addChild(page.translateBy(pages.children.length * 400, 0))
    }
  }

  function updateConnectors() {
    // for (const child of connectors.children) {
    //   connectors.removeChild(child)
    // }
    // for (const [fromNode, targetName] of globalThis.links) {
    //   const targetNode = globalThis.targets.get(targetName)
    //   if (fromNode && targetNode) {
    //     layer.addChild(new Connector(fromNode, targetNode, pages.children))
    //   }
    // }
  }
  buildFromSite()
  updateConnectors()

  layer.addChild(pages) //.translateBy(0, 100))
  layer.addChild(connectors)
  connectors.moveToFront()
  // layer.addChild(new Connector(page1, page3, pages.children))
}

main()
