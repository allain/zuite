import { ZCanvas, ZNode, ZText, ZNavigator } from '../zuite.min.mjs'
import { MonthNode } from './MonthNode.mjs'
import { YearNode } from './YearNode.mjs'

function main() {
  const canvasEl = document.querySelector('canvas')
  canvasEl.width = window.innerWidth
  canvasEl.height = window.innerHeight
  const canvas = new ZCanvas(canvasEl)

  const layer = canvas.camera.layers[0]

  canvas.fillStyle = '#666666'

  window.addEventListener('resize', () => {
    canvasEl.width = window.innerWidth
    canvasEl.height = window.innerHeight
    canvas.bounds = [0, 0, window.innerWidth, window.innerHeight]
  })

  layer.addListener(new ZNavigator(canvas.camera))

  const years = new ZNode()

  const yearCount = 9
  const yearColumns = Math.ceil(Math.sqrt(yearCount))

  for (let i = 0; i < yearCount; i++) {
    years.addChild(
      new YearNode(new Date().getFullYear() + i).translateBy(
        (MonthNode.monthWidth + 100) * (i % yearColumns),
        Math.floor(i / yearColumns) * (570 + 100)
      )
    )
  }
  const yearScale = 1 / yearColumns
  years.scaleBy(yearScale, yearScale)
  layer.addChild(years.translateBy(0, 100))

  const title = new ZText('Years Galore')
  layer.addChild(title.scaleBy(5))
}

main()
