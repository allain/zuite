import { ZCanvas } from '../js/ZCanvas.mjs'
import { ZNavigator } from '../js/events/ZNavigator.mjs'
import { ZNode } from '../js/ZNode.mjs'
import { Page } from './Page.mjs'
import { PADDING } from './constants.mjs'
import { ZText } from '../js/nodes/ZText.mjs'

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

  layer.addListener(new ZNavigator(canvas.camera))

  const pages = new ZNode()

  pages.addChild(
    new Page('Landing Screen', {
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
  )

  pages.addChild(
    new Page('Page 2', {
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
          type: 'masonry',
          title: 'Common Topics',
          cols: 5,
          height: ZText.fontSize * 10
        },
        {
          type: 'article',
          title: 'Article',
          headings: 2
        }
      ]
    }).translateBy(400, 0)
  )

  layer.addChild(pages.translateBy(0, 100))
}

main()
