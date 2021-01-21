import { ZBounds } from '../utils/ZBounds.mjs'
import { ZNode } from '../ZNode.mjs'

const textMeasurements = new Map()

export class ZText extends ZNode {
  constructor (text = '', options = {}) {
    super({ ...options, minScale: 0.01 })

    let processed = textMeasurements.get(text)
    if (!processed) {
      processed = this.processText(text, 600)
      textMeasurements.set(text, processed)
    }

    this.lines = processed.lines
    this.bounds.add(processed.bounds)
  }

  processText (text, maxWidth) {
    const bounds = new ZBounds()
    bounds.add(0, 0)

    const lines = []

    let y = 0
    let nextLine = ''
    let testLine = ''
    let testWidth = 0
    let lastWidth = 0
    text
      .trim()
      .split(/[ \t]*\n/g)
      .forEach(line => {
        const words = line.matchAll(/[^\s]+|\s+/g)

        for (const word of words) {
          testLine = nextLine + word
          lastWidth = testWidth
          testWidth = this.measureText(testLine)
          if (testWidth > maxWidth) {
            lines.push({ text: nextLine, width: lastWidth })
            nextLine = word
            y += ZText.fontSize
          } else {
            nextLine = testLine
            bounds.add(testWidth, y)
          }
        }
        y += ZText.fontSize
        lines.push({ text: nextLine, width: testWidth })
        bounds.add(testWidth, y)
        nextLine = ''
      })
    if (nextLine !== '') {
      lines.push({ text: nextLine, testWidth })
      bounds.add(testWidth, y + ZText.fontSize)
    }

    return {
      bounds,
      lines
    }
  }

  measureText (text) {
    const metric = hiddenContext.measureText(text)
    return (
      Math.abs(metric.actualBoundingBoxLeft) +
      Math.abs(metric.actualBoundingBoxRight)
    )
  }

  paint (ctx, displayScale) {
    if (!this.lines.length) return

    const displayHeight = this.fullBounds.height * displayScale
    if (displayHeight < 1) return

    let x = this.bounds.x
    let y = 0

    const lineHeight = displayHeight / this.lines.length
    if (lineHeight > 4) {
      ctx.fillStyle = this.fillStyle || 'rgb(0,0,0)'
      ctx.textBaseline = 'top'
      for (const { text } of this.lines) {
        ctx.fillText(text, x, y)
        y += ZText.fontSize
      }
      return
    }

    // const grpSize = Math.floor(lineHeight)
    // // Math.floor(
    // //   this.lines.length / Math.ceil(this.lines.length / lineHeight)
    // // )
    // const grpLengths = new Array(Math.ceil(this.lines.length / grpSize)).fill(0)
    // this.lines.forEach((line, i) => {
    //   const grpIndex = Math.floor(i / grpSize)
    //   grpLengths[grpIndex] = Math.max(grpLengths[grpIndex], line.length)
    // })

    ctx.beginPath()
    ctx.strokeStyle = this.fillStyle || 'rgb(0,0,0)'
    ctx.lineWidth = ZText.fontSize / 4 //  ctx.displayScale
    for (const { width } of this.lines) {
      ctx.moveTo(x, y + ZText.fontSize / 2)
      ctx.lineTo(x + width, y + ZText.fontSize / 2)
      y += ZText.fontSize
    }
    ctx.stroke()
  }
}

ZText.font = 'Arial'
ZText.fontSize = 20

const hiddenContext = document.createElement('canvas').getContext('2d')
hiddenContext.textBaseline = 'top'
hiddenContext.font = ZText.fontSize + 'px ' + ZText.font
