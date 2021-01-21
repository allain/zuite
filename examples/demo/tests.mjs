import {
  ZBounds,
  ZCanvas,
  ZNavigator,
  ZNode,
  ZText,
  ZImage,
  ZHtml,
  ZActivity,
  easings
} from '../zuite.min.mjs'

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

class ExampleNode extends ZNode {
  constructor (name, example) {
    super({
      focusable: true,
      bounds: new ZBounds(0, 0, 600, 400),
      fillStyle: '#ffffff'
    })

    this.addChild(new ZText(name).scaleBy(4))
    this.addChild(example)
  }

  layoutChildren () {
    const headerBottom = this.children[0].fullBounds.height
    this.children[1].offset = { x: 0, y: headerBottom * 4 + 20 }
  }
}

class AnimationNode extends ZNode {
  constructor (n) {
    super({
      focusable: true
    })

    for (let x = 0; x < n; x++) {
      this.addChild(
        new ZNode({
          fillStyle: this.randomColor(),
          bounds: new ZBounds(0, 0, 20, 20)
        })
      )
    }
  }

  animate (millis) {
    let index = 0
    const cols = Math.floor(Math.sqrt(this.children.length))
    for (const c of this.children) {
      index++
      const ratio = easings.inOutQuad(
        0.5 + 0.5 * Math.sin(Math.PI * (millis / 2000) + index)
      )
      c.offset = {
        x: (index % cols) * 20 + 40 * ratio,
        y: Math.floor(index / cols) * 20 + 40 * ratio
      }
    }
    this.invalidatePaint()
  }

  randomColor () {
    return (
      'rgb(' +
      [0, 150 + Math.random() * 50, 169 + Math.random() * 50]
        .map(Math.round)
        .join(',') +
      ')'
    )
  }
}

function main () {
  const canvasEl = document.querySelector('canvas')
  canvasEl.width = window.innerWidth
  canvasEl.height = window.innerHeight
  const canvas = new ZCanvas(canvasEl)

  window.addEventListener('resize', () => {
    canvasEl.width = window.innerWidth
    canvasEl.height = window.innerHeight
    // pCanvas.setBounds(new ZBounds(0, 0, window.innerWidth, window.innerHeight))
  })

  const layer = canvas.camera.layers[0]

  layer.addListener(new ZNavigator(canvas.camera))
  canvas.fillStyle = '#666666'

  const examples = new ZNode()

  const animationNodeCount = 1000
  const animatedNode = new AnimationNode(animationNodeCount).scaleBy(0.25, 0.25)

  layer.root.scheduler.schedule(
    new ZActivity({
      step (millis) {
        animatedNode.animate(millis)
      }
    })
  )
  const foundMe = new ZText('You found me', { focusable: true })
    .scaleBy(0.2, 0.2)
    .translateBy(500, 280)

  examples.addChild(
    new ExampleNode(
      'Text',
      new ZNode().addChild(
        new ZText(loremIpsum, { focusable: true }).scaleBy(0.25, 0.25),
        new ZText(loremIpsum, { focusable: true })
          .translateBy(200, 0)
          .scaleBy(0.1, 0.15),
        new ZText(loremIpsum, { focusable: true })
          .scaleBy(0.01, 0.1)
          .translateBy(300, 0),
        new ZNode({
          focusable: true,
          fillStyle: '#0096a9',
          bounds: new ZBounds(0, 0, 100, 100)
        })
          .translateBy(500 + foundMe.fullBounds.width * foundMe.scale, 280)
          .scaleBy(0.1, 0.1),
        foundMe
      )
    ).scaleBy(0.25),
    new ExampleNode(
      'Images',
      new ZNode()
        .addChild(
          new ZImage('/demo/images/elastalink.png', {
            focusable: true
          }).scaleBy(0.25, 0.25),
          new ZImage('https://elastalink.com/_nuxt/img/logo-icon.9a036c7.svg', {
            focusable: true
          }).translateBy(0, 100)
        )
        .translateBy(20, 0)
        .scaleBy(0.5, 0.5)
    )
      .scaleBy(0.25, 0.25)
      .translateBy(200, 0),
    new ExampleNode(
      'Animation',
      new ZNode().addChild(
        new ZText(`${animationNodeCount} nodes all being animated`).scaleBy(
          0.5,
          0.5
        ),
        animatedNode.translateBy(0, 20)
      )
    )
      .scaleBy(0.25, 0.25)
      .translateBy(400, 0),
    new ExampleNode(
      'HTML',
      new ZNode().addChild(
        new ZText(sampleHtml, { focusable: true }).scaleBy(0.4, 0.4),
        new ZHtml(sampleHtml, { focusable: true })
          .translateBy(260, 0)
          .scaleBy(0.4, 0.4)
      )
    )
      .scaleBy(0.25, 0.25)
      .translateBy(600, 0)
  )

  layer.addChild(examples)
}

main()