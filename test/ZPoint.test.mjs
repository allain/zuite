import { expect } from '@esm-bundle/chai'
import { ZPoint } from '../src/utils/ZPoint.mjs'

it('can be created', () => {
  const p = new ZPoint()
  expect(p).to.be.instanceOf(ZPoint)
})

it('can be created from x, y', () => {
  const p = new ZPoint(1, 2)
  expect(p.x).to.equal(1)
  expect(p.y).to.equal(2)
})
