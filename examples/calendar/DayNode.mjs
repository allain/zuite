import { ZNode, ZText } from '../zuite.min.mjs'
import { TaskListNode } from './TaskListNode.mjs'

export class DayNode extends ZNode {
  constructor (number, tasks, options = {}) {
    super({
      focusable: true,
      ...options
    })

    this.fillStyle = tasks.length ? '#ffffff' : '#dddddd'

    this.addChild(new ZText('' + number).scaleBy(5).translateBy(10, 10))

    if (tasks) {
      this.addChild(new TaskListNode(tasks).translateBy(10, 130))
    }
  }

  paint (ctx, displayScale) {
    super.paint(ctx)

    if (displayScale < 0.01) {
      return false
    }
  }

  // paintAfterChildren (ctx) {
  //   ctx.strokeRect(0, 0, this.bounds.width, this.bounds.height)
  // }
}
