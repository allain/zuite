import { ZNode, ZText } from '../zuite.min.mjs'
import { NotesNode } from './NoteNode.mjs'

export class TaskNode extends ZNode {
  constructor (task) {
    super()
    const textNode = (this.textNode = new ZText(task.task))
    this.addChild(textNode)

    if (task.note) {
      const noteNode = (this.noteNode = new NotesNode(task.note))
      this.addChild(noteNode)
    }
  }

  layoutChildren () {
    const textBounds = this.textNode.fullBounds
    if (this.noteNode) {
      const noteBounds = this.noteNode.fullBounds

      this.noteNode
        .translateBy(textBounds.width, 0)
        .scaleBy(textBounds.height / noteBounds.height)
    }
  }
}
