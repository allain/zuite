import { ZNode } from '../js/ZNode.mjs'
import { ZText } from '../js/nodes/ZText.mjs'
// import { DragHandler } from './DragHandler.mjs'
import { Section } from './Section.mjs'
import {
  PADDING,
  PAGE_BODY_BG,
  PAGE_HEADER_BG,
  PAGE_HEADER_TEXT,
  PAGE_PADDING
} from './constants.mjs'

export class Page extends ZNode {
  constructor(title, { sections = [] } = {}) {
    super({
      focusable: true,
      bounds: [0, 0, 320, 0],
      fillStyle: PAGE_BODY_BG
    })

    globalThis.targets.set(title, this)

    const headerNode = new ZNode({
      focusable: false,
      bounds: [0, 0, 320, ZText.fontSize + PADDING * 2],
      fillStyle: PAGE_HEADER_BG
    })

    this._headerNode = headerNode

    headerNode.addChild(
      new ZText(title, {
        fillStyle: PAGE_HEADER_TEXT
      }).translateBy(PADDING, PADDING)
    )

    headerNode.draggable = this

    this.addChild(headerNode)

    const pageContent = new ZNode({
      bounds: [0, 0, 320 - PAGE_PADDING * 2, 0]
    })

    this.addChild(
      pageContent.translateBy(
        PAGE_PADDING,
        PAGE_PADDING + this.fullBounds.height
      )
    )

    for (const section of sections) {
      const sectionNode = new Section(section)
      if (section.name) {
        globalThis.targets.set(section.name, sectionNode)
      }
      if (section.link) {
        globalThis.links.push([sectionNode, section.link])
      }
      let sectionYPosition = pageContent.fullBounds.height
      if (sectionYPosition) {
        sectionYPosition += PAGE_PADDING
      }

      pageContent.addChild(sectionNode.translateBy(0, sectionYPosition))
    }
    this.bounds.height = this.fullBounds.height + PAGE_PADDING
  }
}
