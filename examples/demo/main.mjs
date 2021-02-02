import {
  ZCanvas,
  ZNavigator,
  ZNode,
  ZText,
  ZImage,
  ZHtml,
  ZActivity,
  ZBounds,
  ZPoint,
  easings,
} from "../zuite.min.mjs"

import { simplifyPolyLine } from "./simply-poly-line.mjs"

const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam laoreet nisl sit amet dolor condimentum rutrum. Vestibulum et lacus pellentesque mi pretium tempus. Aliquam erat volutpat. Praesent dapibus augue eros, vitae rutrum eros ultrices vel. Integer lobortis, neque eu tincidunt maximus, quam augue sollicitudin risus, sed consequat leo ipsum id enim. Cras orci nibh, ultrices nec lorem nec, interdum suscipit orci. Nulla id felis vel ligula lobortis aliquam vitae finibus odio. Maecenas vitae feugiat erat, eget porttitor arcu. Proin accumsan mauris sit amet lacus efficitur rutrum. Ut at odio in lorem laoreet tincidunt. Integer in neque suscipit, finibus est eu, molestie justo. Curabitur dui arcu, iaculis sit amet sollicitudin quis, tristique quis lectus. Phasellus in suscipit risus. Phasellus in justo vitae quam ullamcorper gravida vel sed elit. Suspendisse eleifend commodo velit nec vestibulum. Aliquam ut mi purus.

Aliquam erat volutpat. Sed semper turpis vitae massa ullamcorper commodo. Praesent aliquam malesuada convallis. Fusce non nibh volutpat, finibus dui vel, laoreet est. Cras consectetur velit massa, sit amet convallis tellus lacinia sit amet. Donec arcu metus, accumsan quis sem ornare, aliquam pulvinar libero. Integer eget sapien eget ipsum venenatis sagittis. Ut sollicitudin, quam vitae dictum commodo, neque urna tempor odio, molestie dictum massa purus nec neque. Cras iaculis dui vitae elit sagittis faucibus. Cras interdum et arcu eu vehicula. Sed sodales pretium nunc, ut finibus mi condimentum in. Duis commodo volutpat tortor, eget porta purus ullamcorper vel. Proin egestas lorem quis orci ultricies tincidunt. Fusce lobortis justo ut dapibus accumsan.

Pellentesque gravida nulla a ornare convallis. Donec luctus accumsan purus vitae pretium. Nullam porta metus et luctus elementum. Cras fermentum, justo eu dapibus sodales, neque mauris dictum ante, at dictum turpis velit non est. Duis ut lacus ex. Nulla posuere quis metus vitae feugiat. Integer varius ultrices tellus vitae tincidunt.

Etiam eu ornare dolor, at elementum dolor. Duis sit amet turpis laoreet, scelerisque libero in, maximus libero. Nullam auctor tincidunt efficitur. In hac habitasse platea dictumst. Nunc nec massa justo. Sed dictum pellentesque nisl, convallis cursus erat tempus sit amet. Duis vitae rutrum eros.`

const sampleHtml = `
  <div style="background-color: #0096a9; padding: 10px 20px; color: white; font-family: 'Open Sans', sans-serif;">
    <div>
      This uses
      <em><a href="http://html2canvas.hertzen.com/" style="color: white; font-weight: bold; font-family: "Open Sans",arial">html2canvas</a></em>
      to render its content.
    </div>
    <!--
    <p><iframe src="https://example.com"></iframe><p>
    -->
    <p>
      <strong>Limitations:</strong>
      <ul style="margin-top: 0">
        <li>Display Only</li>
        <li>Same origin policy</li>
        <li>Adds <strong>120KB</strong> or so to bundle size</li>
      </ul>
    </p>
  </div>
`

class RowNode extends ZNode {
  constructor(padding = 0) {
    super()
    this.padding = padding
  }
  layoutChildren() {
    let x = 0

    for (const child of this.children) {
      child.offset = { x, y: 0 }
      x += child.fullBounds.width * child.scale + this.padding
    }
  }
}

class ExampleNode extends ZNode {
  constructor(name, example, description = null) {
    super({
      focusable: true,
      bounds: [0, 0, 600, 400],
      fillStyle: "#ffffff",
    })

    this.addChild(new ZText(name).scaleBy(4))
    this.addChild(example)
    if (description) {
      this.addChild(new ZText(description))
    }
  }

  layoutChildren() {
    const [headerNode, bodyNode, descriptionNode] = this.children
    let bodyStart = headerNode.fullBounds.height * 4 + 10
    if (descriptionNode) {
      descriptionNode.offset = { x: 0, y: bodyStart }
      bodyStart += descriptionNode.fullBounds.height + 10
    }

    bodyNode.offset = { x: 0, y: bodyStart }
  }
}

class AnimationNode extends ZNode {
  constructor(n) {
    super({
      focusable: true,
    })

    for (let x = 0; x < n; x++) {
      this.addChild(
        new ZNode({
          fillStyle: this.randomColor(),
          bounds: [0, 0, 20, 20],
        })
      )
    }
  }

  animate(millis) {
    let index = 0
    const cols = Math.floor(Math.sqrt(this.children.length))
    for (const c of this.children) {
      index++
      const ratio = easings.inOutQuad(
        0.5 + 0.5 * Math.sin(Math.PI * (millis / 2000) + index)
      )
      c.offset = {
        x: (index % cols) * 20 + 40 * ratio,
        y: Math.floor(index / cols) * 20 + 40 * ratio,
      }
    }
    this.invalidatePaint()
  }

  randomColor() {
    return (
      "rgb(" +
      [0, 150 + Math.random() * 50, 169 + Math.random() * 50]
        .map(Math.round)
        .join(",") +
      ")"
    )
  }
}

class DiagramNode extends ZNode {
  constructor({ camera, navigator, depth = 1 }, options = {}) {
    super({
      bounds: [
        0,
        0,
        Math.min(window.innerHeight * (16 / 10), window.innerWidth * 0.8),
        window.innerHeight * 0.8,
      ],
      fillStyle: "#e9e9e9",
      ...options,
    })

    this.navigator = navigator
    this.camera = camera
    this.addListener(this)
    this.painting = false

    this.strokes = []
    this.currentStroke = null

    const editToggle = new ZNode()

    const editPencil = new ZImage(
      "https://icons.clickncode.com/icons/zondicons/edit-pencil.svg",
      {
        bounds: [0, 0, 24, 24],
      }
    )

    const savePic = new ZImage(
      "https://icons.clickncode.com/icons/zondicons/save-disk.svg",
      {
        bounds: [0, 0, 24, 24],
        visible: false,
      }
    )

    editToggle.addListener({
      click: () => {
        this.painting = !this.painting
        editPencil.visible = !this.painting
        savePic.visible = this.painting
        childrenPanel.visible = !this.painting
        navigator.locked = this.painting
        return true
      },
    })

    // editPencil.invalidateBounds()
    editToggle.addChild(editPencil)
    editToggle.addChild(savePic)
    this.addChild(editToggle)

    const childrenPanel = new RowNode(5)
    const childMaker = new ZImage(
      "https://icons.clickncode.com/icons/zondicons/add-outline.svg",
      {
        bounds: [0, 0, 24, 24],
      }
    )

    if (depth < 5) {
      const childScale = 48 / this.bounds.height

      childMaker.addListener({
        click: () => {
          if (!childMaker.visible || navigator.locked) return
          const newDiagram = new DiagramNode(
            { camera, navigator, depth: depth + 1 },
            options
          )
          childrenPanel.addChild(newDiagram.scaleBy(childScale))
          childMaker.visible = childrenPanel.children.length < 12
          setTimeout(() => navigator.zoomTo(newDiagram), 10)
        },
      })

      childrenPanel.addChild(childMaker)
      this.addChild(childrenPanel.translateBy(0, this.bounds.height + 5))
    }
  }

  // TODO: Try tricks from: http://perfectionkills.com/exploring-canvas-drawing-techniques/
  paint(ctx, displayScale) {
    this.fillStyle = this.painting ? "#f9f9ff" : "#ffffff"
    super.paint(ctx, displayScale)
    let lineWidth = displayScale > 4 ? 4 : Math.min(10, 4 / displayScale)
    ctx.lineWidth = lineWidth
    // ctx.shadowBlur = lineWidth
    // ctx.shadowColor = "rgb(0, 0, 0)"
    ctx.strokeStyle = "#000"
    ctx.lineJoin = ctx.lineCap = "round"
    for (const stroke of this.strokes) {
      const simpler = simplifyPolyLine(stroke, 1 / displayScale)
      if (stroke === this.currentStroke) {
        this.paintSimpleStroke(ctx, simpler)
      } else {
        this.paintBezierStroke(ctx, simpler)
      }
    }
  }

  paintSimpleStroke(ctx, points) {
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (const point of points) {
      ctx.lineTo(point.x, point.y)
    }
    ctx.stroke()
  }

  paintBezierStroke(ctx, points) {
    let p1 = points[0]
    let p2 = points[1]

    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)

    for (let i = 1, len = points.length; i < len; i++) {
      const midPoint = {
        x: p1.x + (p2.x - p1.x) / 2,
        y: p1.y + (p2.y - p1.y) / 2,
      }
      ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y)
      p1 = points[i]
      p2 = points[i + 1]
    }
    ctx.lineTo(p1.x, p1.y)
    ctx.stroke()
  }

  pointerdown({ event }) {
    if (!this.painting) return

    this.currentStroke = []
    this.strokes.push(this.currentStroke)

    const point = this.globalToLocal(new ZPoint(event.point.x, event.point.y))
    this.currentStroke.push(point)
  }

  pointerup() {
    if (this.currentStroke) {
      this.strokes[this.strokes.length - 1] = simplifyPolyLine(
        this.currentStroke,
        1
      )
      this.currentStroke = null
    }
  }

  pointermove({ event }) {
    if (this.currentStroke) {
      const point = this.globalToLocal(new ZPoint(event.point.x, event.point.y))
      this.currentStroke.push(point)
    }
  }

  paintAfterChildren(ctx) {
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, this.bounds.width, this.bounds.height)
  }
}

function main() {
  const canvasEl = document.querySelector("canvas")
  canvasEl.width = window.innerWidth
  canvasEl.height = window.innerHeight
  const canvas = new ZCanvas(canvasEl)

  window.addEventListener("resize", () => {
    canvasEl.width = window.innerWidth
    canvasEl.height = window.innerHeight
    // canvas.camera.setBounds(new ZBounds(0, 0, window.innerWidth, window.innerHeight))
  })

  const layer = canvas.camera.layers[0]
  const navigator = new ZNavigator(canvas.camera)
  layer.addListener(navigator)
  canvas.fillStyle = "#666666"

  const examples = new RowNode(20)

  const animationNodeCount = 1000
  const animatedNode = new AnimationNode(animationNodeCount).scaleBy(0.25, 0.25)

  layer.root.scheduler.schedule(
    new ZActivity({
      step(millis) {
        animatedNode.animate(millis)
      },
    })
  )

  examples.addChild(
    new ExampleNode(
      "Text",
      new RowNode(10).addChild(
        new ZText(loremIpsum, { focusable: true }).scaleBy(0.25, 0.25),
        new ZText(loremIpsum, { focusable: true }).scaleBy(0.1, 0.15),
        new ZText(loremIpsum, { focusable: true }).scaleBy(0.01, 0.1),
        new ZText("You found me", { focusable: true }).scaleBy(0.005, 0.05)
      )
    ).scaleBy(0.25),
    new ExampleNode(
      "Images",
      new RowNode(10)
        .addChild(
          new ZImage("/demo/images/elastalink.png", {
            focusable: true,
          }).scaleBy(0.25, 0.25),
          new ZImage("https://elastalink.com/_nuxt/img/logo-icon.9a036c7.svg", {
            focusable: true,
          })
        )
        .scaleBy(0.5, 0.5)
    ).scaleBy(0.25, 0.25),
    new ExampleNode(
      "Animation",
      new ZNode().addChild(animatedNode.translateBy(0, 20)),
      `${animationNodeCount} nodes all being animated`
    ).scaleBy(0.25, 0.25),
    new ExampleNode(
      "HTML",
      new RowNode(1)
        .addChild(
          new ZText(sampleHtml, { focusable: true }).scaleBy(0.4, 0.4),
          new ZHtml(sampleHtml, { focusable: true }).scaleBy(0.4, 0.4)
        )
        .scaleBy(0.8, 0.8)
    ).scaleBy(0.25, 0.25),
    new DiagramNode(
      { camera: canvas.camera, navigator },
      { focusable: true }
    ).scaleBy(0.6, 0.6)
  )

  layer.addChild(examples)

  navigator.zoomToRaw(examples, 0)
}

main()
