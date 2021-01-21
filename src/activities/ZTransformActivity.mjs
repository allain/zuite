import { ZTransform } from '../utils/ZTransform.mjs'
import { ZInterpolatingActivity } from './ZInterpolatingActivity.mjs'
import { linear } from '../easings.mjs'

export class ZTransformActivity extends ZInterpolatingActivity {
  constructor (node, targetTransform, duration, easing = linear) {
    super()
    this.duration = duration
    this.node = node
    this.source = node.transform
    this.target = targetTransform
    this.easing = easing
  }

  interpolate (zeroToOne) {
    const dest = ZTransform.lerp(
      this.source,
      this.target,
      this.easing(zeroToOne)
    )

    this.node.setTransform(dest)
  }

  finished () {
    this.node.setTransform(this.target)
  }
}
