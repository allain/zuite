export class ZActivityScheduler {
  constructor (frameRate) {
    this.pollingRate = frameRate
    this.nextCallTime = 0
    this.activities = []
    this.intervalID = null
    this.globalTime = new Date().getTime()
  }

  schedule (activity, startTime) {
    startTime = startTime || new Date().getTime()
    activity.startTime = startTime
    this.activities.push(activity)
    this._start()
  }

  step () {
    const keepers = []

    this.globalTime = new Date().getTime()

    for (const activity of this.activities) {
      if (activity.startTime > this.globalTime) {
        keepers.push(activity)
        continue
      }

      if (!activity.stepping) {
        activity.stepping = true
        activity.started()
      }

      if (activity.step(this.globalTime - activity.startTime) !== false) {
        keepers.push(activity)
      } else {
        activity.finished()
      }
    }

    this.activities = keepers

    if (!this.activities) {
      this._stop()
    }
  }

  _start () {
    if (!this.intervalID) {
      const _this = this
      this.intervalID = setInterval(function () {
        _this.currentTime = new Date().getTime()
        _this.step()
      }, this.pollingRate)
    }
  }

  _stop () {
    if (this.intervalID) {
      clearInterval(this.intervalID)
      this.intervalID = null
    }
  }
}
