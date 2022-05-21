import html2canvas from 'html2canvas'
import { ZNode } from '../ZNode.mjs'

export class ZHtml extends ZNode {
  constructor(html, options = {}) {
    super({ minSize: 0.05, ...options })

    this.el = document.createElement('div')
    // this.el.style.visibility = 'hidden'
    this.el.innerHTML = html
    this.el.style.width = '800px'
    this.html = html
    document.body.appendChild(this.el)
    this.bounds.add(0, 0)
    html2canvas(this.el).then((canvas) => {
      this.paintedCanvas = canvas
      this.bounds.add(canvas.width, canvas.height)
      this.invalidateBounds()
      document.body.removeChild(this.el)
    })
  }

  paint(ctx) {
    if (this.paintedCanvas) {
      ctx.drawImage(this.paintedCanvas, 0, 0)
    }
  }
}
