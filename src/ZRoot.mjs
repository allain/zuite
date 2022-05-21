import { ZActivityScheduler } from './activities/ZActivityScheduler.mjs'
import { ZNode } from './ZNode.mjs'

export class ZRoot extends ZNode {
  constructor(args) {
    super(args)

    this.invalidPaint = true

    this.scheduler = new ZActivityScheduler(25)
  }

  get root() {
    return this
  }

  schedule(activity) {
    this.scheduler.schedule(activity)
  }
}
