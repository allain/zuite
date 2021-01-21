import { expect } from '@esm-bundle/chai'
import { ZText } from '../src/nodes/ZText.mjs'

function mockFn (handler = () => {}) {
  const fn = (...args) => {
    fn.calls.push(args)
    const result = handler(...args)
    fn.results.push(result)
    return result
  }
  fn.calls = []
  fn.results = []

  return fn
}

it('can be created without args', () => {
  const t = new ZText()
  expect(t).to.be.instanceOf(ZText)
})

it('can be created with string', () => {
  const t = new ZText('Test')
  expect(t).to.be.instanceOf(ZText)
})

it('renders normal text when scale is good', () => {
  const t = new ZText('Test')
  const ctx = {
    fillText: mockFn(() => {})
  }

  t.paint(ctx, 1)

  expect(ctx.fillText.calls).to.have.length(1)
})

it('renders lines when scale is too small', () => {
  const t = new ZText('Test')
  const ctx = {
    fillText: mockFn(() => {}),

    beginPath: mockFn(),
    moveTo: mockFn(() => {}),
    lineTo: mockFn(() => {}),
    stroke: mockFn(() => {})
  }

  t.paint(ctx, 0.11)

  expect(ctx.fillText.calls).to.have.length(0)
  expect(ctx.stroke.calls).to.have.length(1)
})

it('wraps if txt is too long', () => {
  const t = new ZText(
    Array(1)
      .fill('M')
      .join(' ')
  )
  expect(t.fullBounds.height).to.equal(20)

  const t2 = new ZText(
    Array(50)
      .fill('M')
      .join(' ')
  )
  expect(t2.fullBounds.height).to.equal(40)
})

// TODO
it.skip('merges lines when the scale is too small', () => {
  const t = new ZText(
    Array(500)
      .fill('Hello')
      .join(' ')
  )
  const ctx = {
    fillText: mockFn(() => {}),

    beginPath: mockFn(),
    moveTo: mockFn(() => {}),
    lineTo: mockFn(() => {}),
    stroke: mockFn(() => {})
  }

  t.paint(ctx, 0.11)

  expect(ctx.fillText.calls).to.have.length(0)
  expect(ctx.lineTo.calls).to.have.length(3)
  expect(ctx.stroke.calls).to.have.length(1)
})
