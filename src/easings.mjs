const pow = Math.pow
const sqrt = Math.sqrt
const sin = Math.sin
const cos = Math.cos
const PI = Math.PI
const c1 = 1.70158
const c2 = c1 * 1.525
const c3 = c1 + 1
const c4 = (2 * PI) / 3
const c5 = (2 * PI) / 4.5

export const linear = (x) => x

export const inQuad = (x) => x * x
export const outQuad = (x) => 1 - (1 - x) * (1 - x)
export const inOutQuad = (x) =>
  x < 0.5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2

export const inCubic = (x) => x * x * x
export const outCubic = (x) => 1 - pow(1 - x, 3)
export const inOutCubic = (x) =>
  x < 0.5 ? 4 * x * x * x : 1 - pow(-2 * x + 2, 3) / 2

export const inQuart = (x) => x * x * x * x
export const outQuart = (x) => 1 - pow(1 - x, 4)
export const inOutQuart = (x) =>
  x < 0.5 ? 8 * x * x * x * x : 1 - pow(-2 * x + 2, 4) / 2

export const inQuint = (x) => x * x * x * x * x
export const outQuint = (x) => 1 - pow(1 - x, 5)
export const inOutQuint = (x) =>
  x < 0.5 ? 16 * x * x * x * x * x : 1 - pow(-2 * x + 2, 5) / 2

export const inSine = (x) => 1 - cos((x * PI) / 2)
export const outSine = (x) => sin((x * PI) / 2)
export const inOutSine = (x) => -(cos(PI * x) - 1) / 2

export const inExpo = (x) => (x === 0 ? 0 : pow(2, 10 * x - 10))
export const outExpo = (x) => (x === 1 ? 1 : 1 - pow(2, -10 * x))
export const inOutExpo = (x) =>
  x === 0
    ? 0
    : x === 1
    ? 1
    : x < 0.5
    ? pow(2, 20 * x - 10) / 2
    : (2 - pow(2, -20 * x + 10)) / 2

export const inCirc = (x) => 1 - sqrt(1 - pow(x, 2))
export const outCirc = (x) => sqrt(1 - pow(x - 1, 2))
export const inOutCirc = (x) =>
  x < 0.5
    ? (1 - sqrt(1 - pow(2 * x, 2))) / 2
    : (sqrt(1 - pow(-2 * x + 2, 2)) + 1) / 2

export const inBack = (x) => c3 * x * x * x - c1 * x * x
export const outBack = (x) => 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2)
export const inOutBack = (x) =>
  x < 0.5
    ? (pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
    : (pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2

export const inElastic = (x) =>
  x === 0 ? 0 : x === 1 ? 1 : -pow(2, 10 * x - 10) * sin((x * 10 - 10.75) * c4)
export const outElastic = (x) =>
  x === 0 ? 0 : x === 1 ? 1 : pow(2, -10 * x) * sin((x * 10 - 0.75) * c4) + 1
export const inOutElastic = (x) =>
  x === 0
    ? 0
    : x === 1
    ? 1
    : x < 0.5
    ? -(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2
    : (pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5)) / 2 + 1

export const inBounce = (x) => 1 - bounceOut(1 - x)
export const outBounce = (x) =>
  x < 0.5 ? (1 - bounceOut(1 - 2 * x)) / 2 : (1 + bounceOut(2 * x - 1)) / 2
export const inOutBounce = (x) =>
  x < 0.5 ? (1 - bounceOut(1 - 2 * x)) / 2 : (1 + bounceOut(2 * x - 1)) / 2

function bounceOut(x) {
  const n1 = 7.5625
  const d1 = 2.75

  if (x < 1 / d1) {
    return n1 * x * x
  } else if (x < 2 / d1) {
    return n1 * (x -= 1.5 / d1) * x + 0.75
  } else if (x < 2.5 / d1) {
    return n1 * (x -= 2.25 / d1) * x + 0.9375
  } else {
    return n1 * (x -= 2.625 / d1) * x + 0.984375
  }
}
