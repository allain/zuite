import { ZActivity } from './ZActivity.mjs'

export class ZInterpolatingActivity extends ZActivity {
  constructor(options) {
    super(options)

    this.stepping = false
    if (typeof options !== 'undefined') {
      if (options.duration) {
        this.duration = options.duration
      } else {
        this.duration = 1000
      }
    }
  }

  step(ellapsedMillis) {
    if (ellapsedMillis >= this.duration) {
      return false
    }

    this.interpolate(ellapsedMillis / this.duration)

    return true
  }

  interpolate(/*zeroToOne*/) {}
}
