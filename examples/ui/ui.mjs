import { ZCanvas } from '../js/ZCanvas.mjs'
import { ZNavigator } from '../js/events/ZNavigator.mjs'
import { ZNode } from '../js/ZNode.mjs'
import { Page } from './Page.mjs'
import { ZText } from '../js/nodes/ZText.mjs'

import {
  Point,
  Line,
  Rectangle,
  intersections
} from 'https://cdn.jsdelivr.net/npm/@mathigon/euclid@1.1.17/+esm'
import { ZRect } from '../js/nodes/ZRect.mjs'
import { DragHandler } from './DragHandler.mjs'

class Connector extends ZNode {
  constructor(from, to, dodge = []) {
    super()
    this.from = from
    this.to = to
    this.dodge = dodge
  }

  paint(ctx) {
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

    const [p1, p2] = intersections(line, fromRect, toRect)

    const dodgeRects = this.dodge
      .filter((d) => d !== this.from && d !== this.to)
      .map((d) => {
        const pos = new Point(d.offset.x, d.offset.y)
        pos.x -= 20
        pos.y -= 20
        const rect = new Rectangle(
          pos,
          d.fullBounds.width + 40,
          d.fullBounds.height + 40
        )
        return rect
      })

    const path = findPath(p1, p2, dodgeRects)
    if (path.length < 2) return
    ctx.strokeStyle = '#00A3F5'
    ctx.lineWidth = 10
    ctx.beginPath()
    // ctx.moveTo(path[0].x, path[0].y)

    // for (var i = 1; i < path.length - 2; i++) {
    //   var xc = (path[i].x + path[i + 1].x) / 2
    //   var yc = (path[i].y + path[i + 1].y) / 2
    //   ctx.quadraticCurveTo(path[i].x, path[i].y, xc, yc)
    // }
    // // curve through the last two points
    // ctx.quadraticCurveTo(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y)
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

function findPath(start, end, boxes) {
  if (!intersections(new Line(start, end), ...boxes).length) {
    return [start, end]
  }

  const allPoints = [start, end]
  const selfBoxes = new Map()
  for (const box of boxes) {
    const boxPoints = box.points
    allPoints.push(...boxPoints)
    boxPoints.forEach((p) => selfBoxes.set(p, box))
  }
  const len = allPoints.length

  const graph = new Map(allPoints.map((p) => [p, new Map()]))
  for (let pIndex1 = 0; pIndex1 < len - 1; pIndex1++) {
    const p1 = allPoints[pIndex1]
    for (let pIndex2 = 0; pIndex2 < len; pIndex2++) {
      const p2 = allPoints[pIndex2]
      if (p1 === p2) continue

      if (graph.get(p2).has(p1)) {
        graph.get(p1).set(p2, graph.get(p2).get(p1))
        continue
      }

      const selfBox = selfBoxes.get(p1) ?? selfBoxes.get(p2)
      const l = new Line(p1, p2)
      l.type = 'segment'
      const hits = intersections(l, ...boxes.filter((b) => b !== selfBox))
      if (!hits.length) {
        if (selfBox) {
          if (p1.x !== p2.x && p1.y !== p2.y) {
            let selfHits = intersections(l, selfBox)
            if (selfHits.length > 1) continue
          }
        }
        graph.get(p1).set(p2, l.length)
        graph.get(p2).set(p1, l.length)
      }
    }
  }

  const { distances, previous } = dijkstra(graph, start)
  if (!distances.get(end)) return []

  let path = []
  let current = end
  while (current) {
    path.push(current)
    current = previous.get(current)
  }
  console.log(path)
  return path
}

function dijkstra(graph, start) {
  const distances = new Map()
  const previous = new Map()
  const queue = new PriorityQueue()

  // Initialize distances and queue
  for (let [node] of graph) {
    distances.set(node, Infinity)
    previous.set(node, null)
    queue.enqueue(node, Infinity)
  }
  distances.set(start, 0)
  queue.enqueue(start, 0)

  while (!queue.isEmpty()) {
    let [currentNode, currentDistance] = queue.dequeue()

    // If the distance to the current node is already larger than the known shortest distance, skip it
    if (currentDistance > distances.get(currentNode)) {
      continue
    }

    let neighbors = graph.get(currentNode) || new Map()
    for (let [neighbor, distance] of neighbors) {
      let alt = distances.get(currentNode) + distance
      if (alt < distances.get(neighbor)) {
        distances.set(neighbor, alt)
        previous.set(neighbor, currentNode)
        queue.enqueue(neighbor, alt)
      }
    }
  }

  return { distances, previous }
}

class PriorityQueue {
  constructor() {
    this.elements = []
  }

  enqueue(element, priority) {
    let added = false
    for (let i = 0; i < this.elements.length; i++) {
      if (priority < this.elements[i][1]) {
        this.elements.splice(i, 0, [element, priority])
        added = true
        break
      }
    }
    if (!added) {
      this.elements.push([element, priority])
    }
  }

  dequeue() {
    return this.elements.shift()
  }

  isEmpty() {
    return this.elements.length === 0
  }
}

function main() {
  const canvasEl = document.querySelector('canvas')
  canvasEl.width = window.innerWidth
  canvasEl.height = window.innerHeight
  const canvas = new ZCanvas(canvasEl)

  const layer = canvas.camera.layers[0]

  canvas.fillStyle = '#aaaaaa'

  window.addEventListener('resize', () => {
    canvasEl.width = window.innerWidth
    canvasEl.height = window.innerHeight
    canvas.bounds = [0, 0, window.innerWidth, window.innerHeight]
  })
  const navigator = new ZNavigator(canvas.camera)
  window.nav = navigator
  layer.addListener(navigator)

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

  for (let i = 0; i < 2; i++) {
    const testRect = new ZRect({
      fillStyle: '#ff0000',
      radius: 10,
      bounds: [0, 0, 100, 100]
    }).translateBy(Math.random() * 1000, Math.random() * 1000)

    testRect.addListener(new DragHandler(testRect))
    pages.addChild(testRect)
  }

  layer.addChild(new Connector(page1, page3, pages.children))
  layer.addChild(pages) //.translateBy(0, 100))
}

main()
