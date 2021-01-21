import { ZNode, ZText } from '../zuite.min.mjs'

export class NotesNode extends ZNode {
  constructor (note) {
    super({
      focusable: true
    })
    this.addChild(new ZText(note))
  }
}
