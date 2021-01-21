import { expect } from '@esm-bundle/chai'

import { ZCanvas } from '../src/ZCanvas.mjs'
import { ZLayer } from '../src/ZLayer.mjs'
import { ZRoot } from '../src/ZRoot.mjs'

it('has property scene structure', () => {
  const canvas = new ZCanvas(document.createElement('canvas'))
  expect(canvas.camera).not.to.be.null
  expect(canvas.camera.parent).to.be.instanceOf(ZRoot)
  expect(canvas.camera.layers).to.have.length(1)
  expect(canvas.camera.layers[0].parent).not.to.be.null
  expect(canvas.root).to.equal(canvas.root)
})

it('returns layer as picked node', () => {
  const canvas = new ZCanvas(document.createElement('canvas'))

  const pickedNodes = canvas.getPickedNodes(0, 0)
  expect(pickedNodes).to.have.length(1)
  expect(pickedNodes[0]).to.be.instanceOf(ZLayer)
})
