import { ZNode } from '../js/ZNode.mjs'
import { ZImage } from '../js/nodes/ZImage.mjs'
import { ZRect } from '../js/nodes/ZRect.mjs'
import { ZText } from '../js/nodes/ZText.mjs'
import {
  PADDING,
  PAGE_PADDING,
  ROUNDING,
  SECTION_BG,
  SECTION_TEXT,
  SECTION_TEXT_LIGHT,
  SECTION_TITLE_TEXT
} from './constants.mjs'

async function objToFloat(obj) {
  const inputString = JSON.stringify(obj)
  // Convert the string to an ArrayBuffer
  const encoder = new TextEncoder()
  const data = encoder.encode(inputString)

  // Hash the data with SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  // Convert bytes array to a hexadecimal string
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  const hashInt = BigInt('0x' + hashHex)

  // Normalize to a value between 0 and 1
  // SHA-256 produces a 256-bit hash. The maximum value is 2^256 - 1.
  const maxValBigInt = BigInt(2) ** BigInt(256) - BigInt(1)
  const normalizedFloat = Number(hashInt) / Number(maxValBigInt)

  return normalizedFloat
}

export class Section extends ZNode {
  constructor({ type, ...data }) {
    super({ bounds: [0, 0, 320 - 2 * PAGE_PADDING, 0] })

    const bgNode = new ZRect({ fillStyle: SECTION_BG, radius: ROUNDING })
    this.bgNode = bgNode
    this.addChild(bgNode)

    const { title } = data
    if (title && type !== 'button') {
      const titleNode = new ZText(title, {
        fillStyle: SECTION_TITLE_TEXT
      }).scaleBy(1.1)
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
    } else if (type === 'picture') {
      this.injectPictureSection(data)
    } else if (type === 'button') {
      bgNode.fillStyle = SECTION_TEXT
      this.addChild(
        new ZText(data.title, { fillStyle: data.color }).translateBy(
          (this.bounds.width - ZText.measureText(data.label)) / 2,
          PADDING
        )
      )
    } else if (type === 'separator') {
      bgNode.fillStyle = SECTION_TEXT
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
          fillStyle: col < data.done ? SECTION_TEXT_LIGHT : SECTION_TEXT
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
        fillStyle: i < data.done ? SECTION_TEXT_LIGHT : SECTION_TEXT
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
          fillStyle: SECTION_TEXT,
          bounds: [
            0,
            0,
            parentWidth * (0.15 + objToFloat(data) * 0.1),
            ZText.fontSize
          ]
        }).translateBy(PADDING, currentY)
      )

      this.addChild(
        new ZRect({
          radius: ROUNDING,
          fillStyle: SECTION_TEXT_LIGHT,
          bounds: [
            parentWidth * 0.25 + PADDING,
            0,
            parentWidth * (0.25 + 0.25 * objToFloat(data)),
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
            fillStyle: SECTION_TEXT,
            bounds: [0, 0, ZText.fontSize, ZText.fontSize]
          }).translateBy(PADDING, currentY)
        )
      }
      this.addChild(
        new ZRect({
          radius: ROUNDING,
          fillStyle: SECTION_TEXT,
          bounds: [
            bullets ? PADDING + ZText.fontSize : 0,
            0,
            this.fullBounds.width * (0.5 + objToFloat(data) * 0.4) -
              PADDING * 2,
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
          fillStyle: SECTION_TEXT,
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
    let { height, cols } = data

    height = height * ZText.fontSize

    const colW = (this.bounds.width - (data.cols + 1) * PADDING) / data.cols

    const startY = this.fullBounds.height + PADDING
    for (let col = 0; col < cols; col++) {
      let cellY = startY
      while (cellY < height + startY) {
        const cellHeight = Math.min(
          height - cellY,
          ZText.fontSize + objToFloat(data) * ZText.fontSize * 2
        )
        if (cellHeight < ZText.fontSize) {
          break
        }
        const cellRect = new ZRect({
          radius: ROUNDING,
          bounds: [0, 0, colW, cellHeight],
          fillStyle: SECTION_TEXT
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
            innerWidth * (0.3 + objToFloat(data) * 0.6),
            ZText.fontSize
          ],
          fillStyle: SECTION_TEXT
        }).translateBy(PADDING, this.fullBounds.height + PADDING)
      )

      for (let l = 0; l < Math.round(2 + objToFloat(data) * 5); l++) {
        this.addChild(
          new ZRect({
            radius: ROUNDING,
            bounds: [
              0,
              0,
              innerWidth * (0.8 + objToFloat(data) * 0.2),
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
          fillStyle: SECTION_TEXT,
          radius: ROUNDING,
          bounds: [0, 0, ZText.fontSize, ZText.fontSize * 0.1]
        }).translateBy(PADDING, PADDING + bar * ZText.fontSize * 0.4)
      )
    }

    this.addChild(
      new ZRect({
        fillStyle: SECTION_TEXT_LIGHT,
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

  injectPictureSection() {
    const width = this.fullBounds.width

    const child = new ZImage(
      'https://widgets.clickncode.com/_uplandjs/icons/bootstrap/card-image.svg',
      {
        loaded: (node) => {
          const ratio = (this.bounds.width - PADDING * 2) / node.bounds.width
          node.scaleBy(ratio)
          this.bgNode.bounds.height += ratio * node.bounds.height
          this.bounds.height += ratio * node.bounds.height
          console.log(this.bounds.height)
          this.parent.bounds.height += ratio * node.bounds.height
          this.parent.parent.bounds.height += ratio * node.bounds.height
        },
        bounds: [0, 0, width - PADDING * 4, 100]
      }
    ).translateBy(PADDING, this.fullBounds.height)
    // .scaleBy(0.15)

    this.addChild(child)
  }
}
