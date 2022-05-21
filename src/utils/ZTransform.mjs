import { ZBounds } from './ZBounds.mjs'
import { ZPoint } from './ZPoint.mjs'

export class ZTransform {
  constructor(values = [1, 0, 0, 1, 0, 0]) {
    this.values = values
    if (this.values.length !== 6) {
      throw new Error('invalid values')
    }
  }

  scaleBy(ratio) {
    this.values[0] *= ratio
    this.values[3] *= ratio

    return this
  }

  translateBy(dx, dy) {
    this.values[4] += dx
    this.values[5] += dy

    return this
  }

  rotateBy(theta) {
    const c = Math.cos(theta)
    const s = Math.sin(theta)

    this.transformBy([c, s, -s, c, 0, 0])

    return this
  }

  transformBy(t2) {
    const m1 = this.values
    const m2 = t2 instanceof ZTransform ? t2.values : t2

    const m00 = m1[0] * m2[0],
      m21 = m1[2] * m2[1],
      m10 = m1[1] * m2[0],
      m31 = m1[3] * m2[1],
      m02 = m1[0] * m2[2],
      m23 = m1[2] * m2[3],
      m12 = m1[1] * m2[2],
      m33 = m1[3] * m2[3],
      m04 = m1[0] * m2[4],
      m25 = m1[2] * m2[5],
      m14 = m1[1] * m2[4],
      m35 = m1[3] * m2[5]

    m1[0] = m00 + m21
    m1[1] = m10 + m31
    m1[2] = m02 + m23
    m1[3] = m12 + m33
    m1[4] = m04 + m25 + m1[4]
    m1[5] = m14 + m35 + m1[5]
    return this
  }

  applyTo(ctx) {
    const m = this.values
    ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5])
  }

  equals(t) {
    if (t instanceof ZTransform) {
      t = t.values
    }

    // eslint-disable-next-line security/detect-object-injection
    return this.values.every((v, i) => v === t[i])
  }

  transform(target) {
    const m = this.values
    if (target instanceof ZPoint) {
      return new ZPoint(
        target.x * m[0] + target.y * m[2] + m[4],
        target.x * m[1] + target.y * m[3] + m[5]
      )
    }

    if (target instanceof ZBounds) {
      const tlx = target.x * m[0] + target.y * m[2] + m[4],
        tly = target.x * m[1] + target.y * m[3] + m[5]

      const brx =
          (target.x + target.width) * m[0] +
          (target.y + target.height) * m[2] +
          m[4],
        bry =
          (target.x + target.width) * m[1] +
          (target.y + target.height) * m[3] +
          m[5]

      return new ZBounds(
        Math.min(tlx, brx),
        Math.min(tly, bry),
        Math.abs(tlx - brx),
        Math.abs(tly - bry)
      )
    }

    if (target instanceof ZTransform) {
      const transform = new ZTransform([...m])
      transform.transformBy(target)
      return transform
    }

    throw 'invalid transform target'
  }

  /** Returns the inverse matrix for this ZTransform */
  get inverse() {
    const m = this.values,
      det = m[0] * m[3] - m[1] * m[2],
      values = [
        m[3] / det,
        -m[1] / det,
        -m[2] / det,
        m[0] / det,
        (m[2] * m[5] - m[3] * m[4]) / det,
        -(m[0] * m[5] - m[1] * m[4]) / det
      ]

    return new ZTransform(values)
  }

  get scale() {
    const p = new ZPoint(0, 1)
    const tp = this.transform(p)
    tp.x -= this.values[4]
    tp.y -= this.values[5]
    return Math.sqrt(tp.x * tp.x + tp.y * tp.y)
  }

  static lerp(t1, t2, zeroToOne) {
    return new ZTransform(
      // eslint-disable-next-line security/detect-object-injection
      t1.values.map((t, i) => t + zeroToOne * (t2.values[i] - t))
    )
  }
}
