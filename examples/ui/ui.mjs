import { ZCanvas } from '../js/ZCanvas.mjs'
import { ZNode } from '../js/ZNode.mjs'
import { ZText } from '../js/nodes/ZText.mjs'
import { Page } from './Page.mjs'
import { ZRect } from '../js/nodes/ZRect.mjs'
import { ZPoint } from '../js/utils/ZPoint.mjs'
import { ZTransform } from '../js/utils/ZTransform.mjs'
import * as easings from '../js/easings.mjs'

import aStar from 'https://cdn.jsdelivr.net/npm/a-star@0.2.0/+esm'

import {
  Point,
  Line,
  Rectangle,
  intersections
} from 'https://cdn.jsdelivr.net/npm/@mathigon/euclid@1.1.17/+esm'

class Connector extends ZNode {
  constructor(from, to, dodge = [], margin = 10) {
    super()
    this.from = from
    this.to = to
    this.dodge = dodge
    this.margin = margin
  }

  paint(ctx) {
    const margin = this.margin
    const fromPos = new Point(this.from.offset.x, this.from.offset.y)
    const fromRect = new Rectangle(
      fromPos,
      this.from.fullBounds.width,
      this.from.fullBounds.height
    )
    const fromCenter = fromRect.center
    const toPos = new Point(this.to.offset.x, this.to.offset.y)
    const toRect = new Rectangle(
      toPos,
      this.to.fullBounds.width,
      this.to.fullBounds.height
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
        const pos = new Point(d.offset.x, d.offset.y)
        pos.x -= margin
        pos.y -= margin
        const rect = new Rectangle(
          pos,
          d.fullBounds.width + margin * 2,
          d.fullBounds.height + margin * 2
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

    drawSmoothLine(ctx, path)
    // ctx.beginPath()
    // path.forEach((p, index) => {
    //   if (index === 0) {
    //     ctx.moveTo(p.x, p.y)
    //   } else {
    //     ctx.lineTo(p.x, p.y)
    //   }
    // })
    // ctx.stroke()
  }
}

function expandRect(rect, size) {
  return new Rectangle(
    new Point(rect.p.x - size, rect.p.y - size),
    rect.w + size * 2,
    rect.h + size * 2
  )
}

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

function main() {
  const canvasEl = document.querySelector('canvas')
  canvasEl.width = window.innerWidth
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

      inverse.translateBy(
        (canvas.camera.bounds.width - focusBounds.width) / 2,
        (canvas.camera.bounds.height - focusBounds.height) / 2
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

      if (this._startViewTransform) {
        const dx = event.clientX - this._dragStart.x
        const dy = event.clientY - this._dragStart.y
        this._dragDistance = Math.sqrt(dx * dx + dy * dy)
        this._dragging.viewTransform = new ZTransform([
          ...this._startViewTransform
        ]).translateBy(dx, dy)
      } else {
        const dx = event.point.x - this._dragStart.x
        const dy = event.point.y - this._dragStart.y
        this._dragDistance = Math.sqrt(dx * dx + dy * dy)
        this._dragging.offset = {
          x: this._startOffset.x + dx,
          y: this._startOffset.y + dy
        }
        this._dragging.invalidatePaint()
      }
    }
    // wheel({ event, pickedNodes }) {
    //   if (event.deltaY < 0) {
    //     canvas.camera.scaleBy(0.9)
    //   } else {
    //     canvas.camera.scaleBy(1 / 0.9)
    //   }
    // }
  })

  canvas.fillStyle = '#aaaaaa'

  window.addEventListener('resize', () => {
    canvasEl.width = window.innerWidth
    canvasEl.height = window.innerHeight
    canvas.bounds = [0, 0, window.innerWidth, window.innerHeight]
  })
  // const navigator = new ZNavigator(canvas.camera)
  // window.nav = navigator
  // layer.addListener(navigator)

  const pages = new ZNode()
  const page1 = new Page('Landing Screen', {
    sections: [
      {
        type: 'search'
      },
      {
        type: 'text',
        title: 'Text',
        lines: 2
      },
      {
        type: 'separator'
      },
      {
        type: 'list',
        title: 'All Topics',
        lines: 4,
        bullets: true
      },
      {
        type: 'steps',
        title: 'Phase / Stage',
        done: 3,
        total: 5
      },
      {
        type: 'table',
        title: 'Table',
        rows: 4,
        cols: 4
      },
      {
        type: 'button',
        label: 'Team'
      },
      {
        type: 'button',
        label: 'Approve',
        color: '#D0193A'
      }
    ]
  })

  const page2 = new Page('Page 2', {
    sections: [
      {
        type: 'text',
        title: 'Text Section 1',
        lines: 1
      },
      {
        type: 'text',
        title: 'Text Section 2',
        lines: 3
      },
      {
        type: 'form',
        title: 'Reset Password',
        fields: 2
      },
      {
        type: 'form',
        title: 'Account Info',
        fields: 4
      }
    ]
  })

  const page3 = new Page('Page 3', {
    sections: [
      {
        type: 'masonry',
        title: 'Common Topics',
        cols: 5,
        height: ZText.fontSize * 10
      },
      {
        type: 'article',
        title: 'Article',
        headings: 2
      },
      {
        type: 'picture',
        title: 'Picture'
      }
    ]
  })

  pages.addChild(page1)
  pages.addChild(page3.translateBy(800, 0))
  pages.addChild(page2.translateBy(400, 0))

  for (let i = 0; i < 5; i++) {
    const testRect = new ZRect({
      fillStyle: '#ff0000',
      radius: 10,
      bounds: [0, 0, 100, 100]
    }).translateBy(Math.random() * 1000, Math.random() * 1000)
    testRect.draggable = testRect

    // testRect.addListener(new DragHandler(testRect))
    pages.addChild(testRect)
  }

  layer.addChild(pages) //.translateBy(0, 100))
  layer.addChild(new Connector(page1, page3, pages.children))
}

main()
