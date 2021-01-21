import { linear } from '../easings.mjs'
import { ZInterpolatingActivity } from './ZInterpolatingActivity.mjs'
import { ZTransform } from '../utils/ZTransform.mjs'

export class ZViewTransformActivity extends ZInterpolatingActivity {
  constructor (camera, targetTransform, duration, easing = linear) {
    super()
    this.duration = duration
    this.camera = camera
    this.source = camera.viewTransform
    this.target = targetTransform
    // eslint-disable-next-line security/detect-object-injection
    this.easing = easing
  }

  interpolate (zeroToOne) {
    const dest = ZTransform.lerp(
      this.source,
      this.target,
      this.easing(zeroToOne)
    )

    this.camera.viewTransform = dest
  }

  finished () {
    this.camera.viewTransform = this.target
  }
}
