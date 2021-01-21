import { ZNode } from '../zuite.min.mjs'

import { TaskNode } from './TaskNode.mjs'

export class TaskListNode extends ZNode {
  constructor (tasks) {
    super({
      minScale: 0.05
    })
    this.addChild(...tasks.map(t => new TaskNode(t)))
    this.bounds.add(0, 400)
  }

  layoutChildren () {
    this.children.forEach(function (child, index) {
      child.translateBy(0, 30 * index)
    })
  }
}
