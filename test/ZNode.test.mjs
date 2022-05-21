import { expect } from '@esm-bundle/chai'
import { ZRoot } from '../src/ZRoot.mjs'
import { ZPoint } from '../src/utils/ZPoint.mjs'
import { ZTransform } from '../src/utils/ZTransform.mjs'
import { ZBounds } from '../src/utils/ZBounds.mjs'
import { ZNode } from '../src/ZNode.mjs'

function mock(...mockMethods) {
  const dummy = { calls: new Map() }

  for (const methodName of mockMethods) {
    dummy.calls.set(methodName, [])
    dummy[methodName] = (function (methodName) {
      return function (...args) {
        this.calls.get(methodName).push(args)
      }
    })(methodName)
  }

  return dummy
}

it('can be created', () => {
  const n = new ZNode()
  expect(n).to.be.instanceOf(ZNode)
})

it('can be created with empty options', () => {
  const n = new ZNode({})
  expect(n).to.be.instanceOf(ZNode)
})

it('bounds empty by default', () => {
  const n = new ZNode()
  expect(n.bounds.equals(new ZBounds())).to.be.true
})

it('children empty array by default', () => {
  const n = new ZNode()
  expect(n.children instanceof Array, 'children array').to.be.true
  expect(n.children.length, 'no children').to.equal(0)
})

it('fillStyle is null by default', () => {
  const n = new ZNode()
  expect(n.fillStyle, 'fillStyle').to.equal(null)
})

it('not transformed by default', () => {
  const n = new ZNode()
  expect(n.transform.equals(new ZTransform()), 'transform is identity').to.be
    .true
})

it('paint is invalid by default', () => {
  const n = new ZNode()
  expect(n.invalidPaint, 'invalid').to.be.true
})

it('fills rect when bounds and fillStyle are good', () => {
  const n = new ZNode({
    bounds: new ZBounds(0, 0, 20, 20),
    fillStyle: 'rgb(255,0,0)'
  })

  let fillRectArgs
  const mockCtx = {
    fillRect(...args) {
      fillRectArgs = args
    }
  }
  n.paint(mockCtx)

  expect(mockCtx.fillStyle).to.equal('rgb(255,0,0)')
  expect(fillRectArgs, 'rectangle filled').to.deep.equal([0, 0, 20, 20])
})

it('supports specifying bounds using an array', () => {
  const n = new ZNode({
    bounds: [1, 2, 3, 4]
  })

  expect(n.bounds.x).to.equal(1)
  expect(n.bounds.y).to.equal(2)
  expect(n.bounds.width).to.equal(3)
  expect(n.bounds.height).to.equal(4)
})

it('fillPaint ignores invisible nodes', () => {
  const n = new ZNode()
  n.visible = false

  n.fullPaint({
    save() {
      throw new Error('should not be called')
    }
  })
})

it('fillPaint saves and restores context', () => {
  const n = new ZNode()

  let saveCalls = 0
  let restoreCalls = 0
  n.fullPaint({
    save() {
      saveCalls++
    },
    restore() {
      restoreCalls++
    },
    transform() {},
    perform() {},
    applyTo() {}
  })

  expect(saveCalls).to.equal(1)
  expect(restoreCalls).to.equal(1)
})

it('painting sequence is correct', () => {
  const calls = []
  const n = new ZNode()
  n.paintAfterChildren = function () {
    calls.push('paintAfterChildren')
  }
  n.paint = function () {
    calls.push('paint')
  }

  const child = new ZNode()
  child.paint = () => {
    calls.push('childPaint')
  }

  n.addChild(child)

  const mockCtx = mock('save', 'restore', 'transform')
  n.fullPaint(mockCtx)

  expect(calls).to.deep.equal(['paint', 'childPaint', 'paintAfterChildren'])
})

it('scales transform when scaling node', () => {
  const n = new ZNode()
  n.scaleBy(5)
  expect(n.transform.equals([5, 0, 0, 5, 0, 0])).to.be.true
})

it('translates transform when translating node', () => {
  const n = new ZNode()
  n.translateBy(1, 2)
  expect(n.transform.equals([1, 0, 0, 1, 1, 2])).to.be.true
})

it('translating node changes transform', () => {
  const n = new ZNode()
  n.rotateBy(Math.PI / 4)
  expect(!n.transform.equals([1, 0, 0, 1, 0, 0])).to.be.true
})

it('adding child hooks tree up correctly', () => {
  const n = new ZNode()
  const c = new ZNode()
  n.addChild(c)

  expect(n.children.length).to.equal(1)
  expect(n).to.be.equal(c.parent)
})

it('getting root returns topmostZRoot node', () => {
  const n = new ZRoot()
  const n2 = new ZNode()
  const n3 = new ZNode()
  n.addChild(n2)
  n2.addChild(n3)

  expect(n3.root, 'root should be topmost node').to.equal(n)
})

it("getting root returns null when noZRoot in node's tree", () => {
  const n = new ZNode()
  const n2 = new ZNode()
  const n3 = new ZNode()
  n.addChild(n2)
  n2.addChild(n3)

  expect(n3.root).to.be.null
})

it('get full bounds returns empty when empty node and no children', () => {
  const n = new ZNode()
  expect(n.fullBounds.empty, 'bounds empty').to.be.true
})

it("get full bounds returns node's bounds when no children", () => {
  const n = new ZNode({ bounds: new ZBounds(0, 0, 20, 20) })
  expect(n.fullBounds.equals(n.bounds)).to.be.true
})

it('get full bounds contains children even when way outside', () => {
  const n = new ZNode({ bounds: new ZBounds(0, 0, 10, 10) })
  const child = new ZNode({
    bounds: new ZBounds(0, 0, 10, 10)
  }).translateBy(90, 90)
  n.addChild(child)

  const fullBounds = n.fullBounds
  expect(fullBounds.x).to.equal(0)
  expect(fullBounds.y).to.equal(0)
  expect(fullBounds.width).to.equal(100)
  expect(fullBounds.height).to.equal(100)
})

it('global full bounds is full bounds when no parent', () => {
  const n = new ZNode({
    bounds: new ZBounds(0, 0, 20, 20)
  })

  expect(n.globalFullBounds).to.deep.equal(n.fullBounds)
})

it('global full bounds is correct for simple case', () => {
  const n1 = new ZNode()
  const n2 = new ZNode({ bounds: new ZBounds(0, 0, 20, 20) })
  n1.addChild(n2)
  n2.scaleBy(0.5)

  expect(n2.globalFullBounds.equals(new ZBounds(0, 0, 10, 10))).to.be.true
})

it('global full bounds is correct when cummulative rotation is identity', () => {
  const n1 = new ZNode()
  const n2 = new ZNode()
  const n3 = new ZNode({ bounds: new ZBounds(0, 0, 20, 20) })
  n1.addChild(n2)
  n2.addChild(n3)
  n2.rotateBy(Math.PI / 4)
  n3.rotateBy(-Math.PI / 4)

  const fb = n3.globalFullBounds
  expect(fb.x).to.equal(0)
  expect(fb.y).to.equal(0)
  expect(Math.abs(fb.width - 20) < 0.01).to.be.true
  expect(Math.abs(fb.height - 20) < 0.01).to.be.true
})

it('can dispatch event', () => {
  const n = new ZNode()
  const consumed = n.dispatchEvent({
    event: { type: 'test' },
    pickedNodes: []
  })
  expect(consumed).to.be.undefined
})

it('can dispatch event', () => {
  const n = new ZNode()
  const nPicked = new ZNode()
  return new Promise((resolve, reject) => {
    try {
      n.addListener({
        test({ event, pickedNodes }) {
          expect(event.type).to.equal('test')
          expect(pickedNodes).to.deep.equal([nPicked])
          resolve()
        }
      })

      const consumed = n.dispatchEvent('test', {
        event: { type: 'test' },
        pickedNodes: [nPicked]
      })
      expect(consumed).to.be.undefined
    } catch (err) {
      reject(err)
    }
  })
})

it.skip('Node add listener adds it', () => {
  const n = new ZNode()
  const l = {}
  n.addListener(l)
  expect([...n.listeners]).to.deep.equal([l])
})

it.skip('Adding a listener twice adds it once', () => {
  const n = new ZNode()
  const l = {}
  n.addListener(l)
  n.addListener(l)
  expect(n.listeners.size).to.equal(1)
})

it('can remove children', () => {
  const p = new ZNode()
  const c = new ZNode()
  p.addChild(c)
  p.removeChild(c)
  expect(p.children).to.be.empty
})

it('can assign transform', () => {
  const n = new ZNode()
  n.setTransform(new ZTransform([2, 0, 0, 2, 0, 0]))
  expect(n.transform.equals(new ZTransform([2, 0, 0, 2, 0, 0]))).to.be.true
})

it.skip('invalidates parent bounds when setting transform', () => {
  const p = new ZNode()
  const n = new ZNode()
  p.addChild(n)

  expect(p.fullBounds).not.to.be.null
  n.setTransform(new ZTransform([2, 0, 0, 2, 0, 0]))
  expect(p.fullBounds).to.be.null
})

it('lays out children if layoutChildren method present', () => {
  let called = false
  class LayoutNode extends ZNode {
    layoutChildren() {
      called = true
    }
  }
  const layoutNode = new LayoutNode()
  layoutNode.fullBounds
  expect(called).to.be.true
})

it('supports querying for global transform', () => {
  const p = new ZNode()
  p.scaleBy(2, 2)
  const c = new ZNode()
  c.translateBy(5, 5)
  p.addChild(c)
  expect(c.globalTransform).to.deep.equal(new ZTransform([1, 0, 0, 1, 5, 5]))
})

it('returns transform scale if asked', () => {
  const n = new ZNode()
  n.transform.scaleBy(2, 2)
  expect(n.scale).to.equal(2)
})

it('supports moving to front', () => {
  const p = new ZNode()
  const c1 = new ZNode()
  const c2 = new ZNode()
  p.addChild(c1)
  p.addChild(c2)
  c2.moveToFront()
  expect(p.children[0]).to.equal(c2)
})

it('supports moving to back', () => {
  const p = new ZNode()
  const c1 = new ZNode()
  const c2 = new ZNode()
  p.addChild(c1)
  p.addChild(c2)
  c1.moveToBack()
  expect(p.children[1]).to.equal(c1)
})

it('supports local to parent transform', () => {
  const p = new ZNode()
  const c = new ZNode()
  c.transform.scaleBy(2, 2)
  p.addChild(c)

  expect(c.localToParent(new ZPoint(0, 0))).to.deep.equal(new ZPoint(0, 0))
  expect(c.localToParent(new ZPoint(1, 1))).to.deep.equal(new ZPoint(2, 2))
})

it('supports parent to local transform', () => {
  const p = new ZNode()
  const c = new ZNode()
  c.transform.scaleBy(2, 2)
  p.addChild(c)

  expect(c.parentToLocal(new ZPoint(0, 0))).to.deep.equal(new ZPoint(0, 0))
  expect(c.parentToLocal(new ZPoint(2, 2))).to.deep.equal(new ZPoint(1, 1))
})
