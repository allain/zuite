import { ZNode } from '../js/ZNode.mjs'
import { ZImage } from '../js/nodes/ZImage.mjs'
import { ZRect } from '../js/nodes/ZRect.mjs'
import { ZText } from '../js/nodes/ZText.mjs'
import { PADDING, PAGE_PADDING, ROUNDING } from './constants.mjs'

export class Section extends ZNode {
  constructor({ type, ...data }) {
    super({ bounds: [0, 0, 320 - 2 * PAGE_PADDING, 0], focusable: true })

    const bgNode = new ZRect({ fillStyle: '#E6EEF2', radius: ROUNDING })
    this.addChild(bgNode)

    const { title } = data
    if (title) {
      const titleNode = new ZText(title, { fillStyle: '#355464' }).scaleBy(1.25)
      this.addChild(titleNode.translateBy(PADDING, PADDING))
    }

    if (type === 'text') {
      this.injectTextSection(data)
    } else if (type === 'search') {
      this.injectSearchSection(data)
    } else if (type === 'list') {
      this.injectListSection(data)
    } else if (type === 'form') {
      this.injectFormSection(data)
    } else if (type === 'steps') {
      this.injectStepsSection(data)
    } else if (type === 'table') {
      this.injectTableSection(data)
    } else if (type === 'masonry') {
      this.injectMasonrySection(data)
    } else if (type === 'article') {
      this.injectArticleSection(data)
    } else if (type === 'button') {
      bgNode.fillStyle = '#C5D7E0'
      this.addChild(
        new ZText(data.label, { fillStyle: data.color }).translateBy(
          (this.bounds.width - ZText.measureText(data.label)) / 2,
          PADDING
        )
      )
    } else if (type === 'separator') {
      bgNode.fillStyle = '#C5D7E0'
      bgNode.bounds.height = PADDING
      bgNode.bounds.width = this.bounds.width / 4
      bgNode.translateBy(this.bounds.width * 0.75 * 0.5, 0)
      return
    }

    this.bounds.height = this.fullBounds.height + PADDING
    bgNode.bounds.height = this.bounds.height
    bgNode.bounds.width = this.bounds.width
  }

  injectTableSection(data) {
    const colW = (this.bounds.width - (data.cols + 1) * PADDING) / data.cols

    for (let row = 0; row < data.rows; row++) {
      let cellY = this.fullBounds.height + PADDING
      for (let col = 0; col < data.cols; col++) {
        const cellRect = new ZRect({
          radius: ROUNDING,
          bounds: [0, 0, colW, ZText.fontSize],
          fillStyle: col < data.done ? '#FFFFFF' : '#C5D7E0'
        }).translateBy(PADDING + (colW + PADDING) * col, cellY)

        this.addChild(cellRect)
      }
    }
  }

  injectStepsSection(data) {
    const stepW = (this.bounds.width - (data.total + 1) * PADDING) / data.total

    const stepY = this.fullBounds.height + PADDING
    for (let i = 0; i < data.total; i++) {
      const stepRect = new ZRect({
        radius: ROUNDING,
        bounds: [0, 0, stepW, ZText.fontSize],
        fillStyle: i < data.done ? '#FFFFFF' : '#C5D7E0'
      }).translateBy(PADDING + (stepW + PADDING) * i, stepY)

      this.addChild(stepRect)
    }
  }

  injectFormSection(data) {
    const { fields } = data
    const parentWidth = this.fullBounds.width

    for (let i = 0; i < fields; i++) {
      let currentY = this.fullBounds.height + PADDING

      this.addChild(
        new ZRect({
          radius: ROUNDING,
          fillStyle: '#C5D7E0',
          bounds: [
            0,
            0,
            parentWidth * (0.15 + Math.random() * 0.1),
            ZText.fontSize
          ]
        }).translateBy(PADDING, currentY)
      )

      this.addChild(
        new ZRect({
          radius: ROUNDING,
          fillStyle: '#ffffff',
          bounds: [
            parentWidth * 0.25 + PADDING,
            0,
            parentWidth * (0.25 + 0.25 * Math.random()),
            ZText.fontSize
          ]
        }).translateBy(PADDING, currentY)
      )
    }
  }

  injectListSection(data) {
    const { lines, bullets } = data

    for (let i = 0; i < lines; i++) {
      let currentY = this.fullBounds.height + PADDING
      if (bullets) {
        this.addChild(
          new ZRect({
            radius: ROUNDING,
            fillStyle: '#C5D7E0',
            bounds: [0, 0, ZText.fontSize, ZText.fontSize]
          }).translateBy(PADDING, currentY)
        )
      }
      this.addChild(
        new ZRect({
          radius: ROUNDING,
          fillStyle: '#C5D7E0',
          bounds: [
            bullets ? PADDING + ZText.fontSize : 0,
            0,
            this.fullBounds.width * (0.5 + Math.random() * 0.4) - PADDING * 2,
            ZText.fontSize
          ]
        }).translateBy(PADDING, currentY)
      )
    }
  }

  injectTextSection(data) {
    const { lines } = data

    for (let i = 0; i < lines; i++) {
      const last = i > 0 && i === lines - 1
      let currentY = this.fullBounds.height + PADDING
      this.addChild(
        new ZRect({
          radius: ROUNDING,
          fillStyle: '#C5D7E0',
          bounds: [
            0,
            0,
            this.fullBounds.width * (last ? 0.8 : 1) - PADDING * 2,
            ZText.fontSize
          ]
        }).translateBy(PADDING, currentY)
      )
    }
  }

  injectMasonrySection(data) {
    const { height, cols } = data

    const colW = (this.bounds.width - (data.cols + 1) * PADDING) / data.cols

    const startY = this.fullBounds.height + PADDING
    for (let col = 0; col < cols; col++) {
      let cellY = startY
      while (cellY < height + startY) {
        const cellHeight = Math.min(
          height - cellY,
          ZText.fontSize + Math.random() * ZText.fontSize * 2
        )
        if (cellHeight < ZText.fontSize) {
          break
        }
        const cellRect = new ZRect({
          radius: ROUNDING,
          bounds: [0, 0, colW, cellHeight],
          fillStyle: '#C5D7E0'
        }).translateBy(PADDING + (colW + PADDING) * col, cellY)
        cellY += cellHeight + PADDING

        this.addChild(cellRect)
      }
    }
  }

  injectArticleSection(data) {
    const { headings } = data

    const width = this.fullBounds.width
    const innerWidth = width - PADDING * 2
    for (let i = 0; i < headings; i++) {
      this.addChild(
        new ZRect({
          radius: ROUNDING,
          bounds: [
            0,
            0,
            innerWidth * (0.3 + Math.random() * 0.6),
            ZText.fontSize
          ],
          fillStyle: '#C5D7E0'
        }).translateBy(PADDING, this.fullBounds.height + PADDING)
      )

      for (let l = 0; l < Math.round(2 + Math.random() * 5); l++) {
        this.addChild(
          new ZRect({
            radius: ROUNDING,
            bounds: [
              0,
              0,
              innerWidth * (0.8 + Math.random() * 0.2),
              ZText.fontSize
            ],
            fillStyle: '#DDEAF3'
          }).translateBy(PADDING, this.fullBounds.height + PADDING)
        )
      }
    }
  }

  injectSearchSection() {
    const width = this.fullBounds.width

    for (let bar = 0; bar < 3; bar++) {
      this.addChild(
        new ZRect({
          fillStyle: '#C5D7E0',
          radius: ROUNDING,
          bounds: [0, 0, ZText.fontSize, ZText.fontSize * 0.1]
        }).translateBy(PADDING, PADDING + bar * ZText.fontSize * 0.4)
      )
    }

    this.addChild(
      new ZRect({
        fillStyle: '#ffffff',
        radius: ROUNDING,
        bounds: [0, 0, width - PADDING * 4 - ZText.fontSize * 2, ZText.fontSize]
      }).translateBy(PADDING * 2 + ZText.fontSize, PADDING)
    )

    this.addChild(
      new ZImage(
        'https://widgets.clickncode.com/_uplandjs/icons/ionic/search.svg'
      )
        .translateBy(width - PADDING * 3, PADDING * 0.8)
        .scaleBy(0.15)
    )
  }
}
