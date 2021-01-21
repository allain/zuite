import { expect } from '@esm-bundle/chai'
import { ZBounds } from '../src/utils/ZBounds.mjs'
import { ZTransform } from '../src/utils/ZTransform.mjs'

it('can be created', () => {
  const n = new ZTransform()
  expect(n).to.be.instanceOf(ZTransform)
})

it('has identity as default transform', () => {
  const t = new ZTransform()
  expect(t.equals([1, 0, 0, 1, 0, 0]), 'is identity').to.be.true
})

it('can scale', () => {
  const t = new ZTransform().scaleBy(5)
  expect(t.equals([5, 0, 0, 5, 0, 0]), 'is scale 5 matrix').to.be.true
})

it.skip('can be applied to a context', () => {
  const t = new ZTransform()
  const ctx = {} // ... ?

  t.applyTo(ctx)
})

it('can compare two transforms', () => {
  const t1 = new ZTransform([1, 0, 0, 0, 2, 0])
  const t2 = new ZTransform([1, 0, 0, 0, 2, 0])
  expect(t1.equals(t2)).to.be.true
})

it('can transform a transform', () => {
  const t1 = new ZTransform([1, 0, 0, 0, 2, 0])
  const t2 = new ZTransform([1, 0, 0, 0, 2, 0])
  const t3 = t1.transform(t2)
  expect(t1.equals(t3)).to.be.false
  expect(t2.equals(t3)).to.be.false
  expect(t3.values).to.deep.equal([1, 0, 0, 0, 4, 0])
})

it('throws when transform is passed wrong param count', () => {
  expect(() => new ZTransform([1, 0, 0, 0, 2]), '5 values').to.throw(
    'invalid values'
  )
})

it('throws when passed something invalid to transform', () => {
  const t = new ZTransform()
  expect(() => t.transform('funny boy')).to.throw('invalid transform target')
})

it('rotate modifies transform correctly', () => {
  const t = new ZTransform().rotateBy(Math.PI / 2)
  t.values = t.values.map(Math.round)
  expect(t.equals([0, 1, -1, 0, 0, 0]), 'is rotate 90 degree matrix').to.be.true
})

it('translate modifies transform correctly', () => {
  var t = new ZTransform().translateBy(1, 2)
  expect(t.equals([1, 0, 0, 1, 1, 2]), 'translate translted').to.be.true
})

it('transformBy is cummulative', () => {
  var t = new ZTransform().scaleBy(2).translateBy(3, 4)
  expect(t.equals([2, 0, 0, 2, 3, 4]), 'multiple transforms were cummulative')
    .to.be.true
})

it('transformBy acceptsTransform as argument', () => {
  var t = new ZTransform()
  t.transformBy(new ZTransform().scaleBy(5))
  expect(t.equals([5, 0, 0, 5, 0, 0]), 'transformed').to.be.true
})

it('lerp interpolates correctly', () => {
  var t1 = new ZTransform().scaleBy(2)
  var t2 = new ZTransform().scaleBy(4).translateBy(2, 4)
  var t3 = ZTransform.lerp(t1, t2, 0.5)
  expect(t3.equals([3, 0, 0, 3, 1, 2])).to.be.true
})

it('transformingBounds works as expected', () => {
  const bounds = new ZBounds(1, 2, 3, 4)
  const t1 = new ZTransform().scaleBy(2).translateBy(5, 5)
  const tBounds = t1.transform(bounds)
  expect(tBounds.x).to.equal(7)
  expect(tBounds.y).to.equal(9)
  expect(tBounds.width).to.equal(6)
  expect(tBounds.height).to.equal(8)
})

it('transformingBounds by rotating can affect size', () => {
  var bounds = new ZBounds(0, 0, 20, 30)
  var t = new ZTransform().rotateBy(Math.PI / 8)
  var bounds2 = t.transform(bounds)

  expect(Math.abs(bounds2.width - 20) != 0.001, bounds2.width).to.be.true
  expect(Math.abs(bounds2.height - 30) != 0.001, bounds2.height).to.be.true
})

it('transformingBounds by translating does not affect size', () => {
  var bounds = new ZBounds(0, 0, 20, 30)
  var t = new ZTransform().translateBy(5, 5)
  var bounds2 = t.transform(bounds)

  expect(Math.abs(bounds2.width - 20) < 0.001, bounds2.width).to.be.true
  expect(Math.abs(bounds2.height - 30) < 0.001, bounds2.height).to.be.true
})

it('transformingBounds handles case when rotated too much', () => {
  var bounds = new ZBounds(0, 0, 20, 20)
  var t = new ZTransform().rotateBy(Math.PI)
  var bounds2 = t.transform(bounds)
  expect(Math.round(bounds2.x)).to.equal(-20)
  expect(Math.round(bounds2.y)).to.equal(-20)
  expect(Math.round(bounds2.width)).to.equal(20)
  expect(Math.round(bounds2.height)).to.equal(20)
})

it('Inverse ZTransform for scale is correct', () => {
  var t = new ZTransform().scaleBy(2)
  var i = t.inverse
  expect(i.equals([1 / 2, 0, 0, 1 / 2, 0, 0])).to.be.true
})

it('Inverse ZTransform for translate is correct', () => {
  var t = new ZTransform().translateBy(1, 2)
  var i = t.inverse
  expect(i.values[0]).to.equal(1)
  expect(i.values[1]).to.be.approximately(0, 0.00001)
  expect(i.values[2]).to.equal(0)
  expect(i.values[3]).to.equal(1)
  expect(i.values[4]).to.equal(-1)
  expect(i.values[5]).to.equal(-2)
})

it('Inverse ZTransform for rotate is correct', () => {
  var t = new ZTransform().rotateBy(Math.PI)
  var i = t.inverse
  expect(i.values[0]).to.equal(-1)
  expect(i.values[1]).to.be.approximately(0, 0.00001)
  expect(i.values[2]).to.be.approximately(0, 0.00001)
  expect(i.values[3]).to.equal(-1)
  expect(i.values[4]).to.equal(0)
  expect(i.values[5]).to.equal(0)
})

it('Cummulative ZTransform can be reversed correctly', () => {
  var t = new ZTransform()
    .scaleBy(5)
    .translateBy(2, 3)
    .rotateBy(Math.PI / 5)
  var inv = t.inverse
  t.transformBy(inv)

  expect(t.values.map(Math.round)).to.deep.equal([1, 0, 0, 1, 0, 0])
})

it('can be asked for scale', () => {
  const t = new ZTransform([2, 0, 0, 2, 0, 0])
  expect(t.scale).to.equal(2)
})
