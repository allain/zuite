export class ZActivity {
  constructor(options) {
    this.stepping = false
    if (typeof options === 'undefined') return

    options.init && options.init.call(this)

    if (options.started) {
      this.started = options.started
    }

    if (options.step) {
      this.step = options.step
    }

    if (options.finished) {
      this.finished = options.finished
    }
  }

  started() {}

  step(/*ellapsedMillis*/) {}

  finished() {}
}
