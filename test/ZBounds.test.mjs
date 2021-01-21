import { expect } from '@esm-bundle/chai'
import { ZPoint } from '../src/utils/ZPoint.mjs'
import { ZBounds } from '../src/utils/ZBounds.mjs'

it('can be created', () => {
  const p = new ZBounds()
  expect(p).to.be.instanceOf(ZBounds)
})

it('can be created from another bounds', () => {
  const b1 = new ZBounds(1, 2, 3, 4)
  const b2 = new ZBounds(b1)
  expect(b2.equals(b2)).to.be.true
})

it('can be asked if it is empty', () => {
  const b = new ZBounds()
  expect(b.empty).to.be.true
  b.add(0, 0)
  expect(b.empty).to.be.true
})

it('bounds should be empty by default', () => {
  const b = new ZBounds()
  expect(b.width).to.equal(0)
  expect(b.height).to.equal(0)
})

it('bounds untouched by default', () => {
  const b = new ZBounds()
  expect(b.touched).to.be.false
})

it('bounds should not equal when x different', () => {
  const b1 = new ZBounds(1, 2, 3, 4)
  const b2 = new ZBounds(0, 2, 3, 4)
  expect(b1.equals(b2)).to.be.false
})

it('bounds should not equal when y different', () => {
  const b1 = new ZBounds(1, 2, 3, 4)
  const b2 = new ZBounds(1, 3, 3, 4)
  expect(b1.equals(b2)).to.be.false
})

it('bounds should not equal when width different', () => {
  const b1 = new ZBounds(1, 2, 3, 4)
  const b2 = new ZBounds(1, 2, 1, 4)
  expect(b1.equals(b2)).to.be.false
})

it('bounds should not equal when height different', () => {
  const b1 = new ZBounds(1, 2, 3, 4)
  const b2 = new ZBounds(1, 2, 3, 1)
  expect(b1.equals(b2)).to.be.false
})

it('adding point to untouched bounds makes bounds that point', () => {
  const b = new ZBounds()
  b.add(10, 20)
  expect(b.equals(new ZBounds(10, 20, 0, 0))).to.be.true
})

it('adding point to untouched bounds makes them touched', () => {
  const b = new ZBounds()
  expect(b.touched).to.be.false
  b.add(10, 20)
  expect(b.touched).to.be.true
})

it('adding point to untouched bounds makes bounds that point', () => {
  const b = new ZBounds()
  b.add(10, 20)
  expect(b.equals(new ZBounds(10, 20, 0, 0))).to.be.true
})

it('adding origin makes bounds as touched', () => {
  const b = new ZBounds()
  b.add(0, 0)
  expect(b.touched).to.be.true
})

it('adding point to empty touched bounds grows it', () => {
  const b = new ZBounds()
  b.add(0, 0)
  b.add(100, 100)
  expect(b.equals(new ZBounds(0, 0, 100, 100))).to.be.true
})

it('adding bounds grows to contain it', () => {
  const b = new ZBounds()
  b.add(new ZBounds(1, 2, 3, 4))
  expect(b.equals(new ZBounds(1, 2, 3, 4))).to.be.true
})

it('empty contains nothing', () => {
  const b = new ZBounds()
  expect(b.contains(0, 0)).to.be.false
  expect(b.contains(new ZPoint(1, 2))).to.be.false
})

it('must have width and height', () => {
  const b = new ZBounds()
  b.add(1, 2)
  expect(b.contains(1, 2)).to.be.false
  b.add(3, 4)
  expect(b.contains(1, 2)).to.be.true
})

it('can be tested for intersection', () => {
  const b1 = new ZBounds(0, 0, 10, 10)
  const b2 = new ZBounds(5, 0, 10, 10)
  const b3 = new ZBounds(10, 0, 10, 10)
  expect(b1.intersects(b2)).to.be.true
  expect(b1.intersects(b3)).to.be.true
  expect(b2.intersects(b1)).to.be.true
  expect(b3.intersects(b1)).to.be.true
})

it('throws if contains is given invalid args', () => {
  const b = new ZBounds()
  expect(() => b.contains(1, 2, 3)).to.throw('invalid args')
})
