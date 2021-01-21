import { expect } from '@esm-bundle/chai'
import { ZBounds } from '../src/utils/ZBounds.mjs'
import { ZCamera } from '../src/ZCamera.mjs'
import { ZCanvas } from '../src/ZCanvas.mjs'
import { ZNode } from '../src/ZNode.mjs'
import { ZLayer } from '../src/ZLayer.mjs'

it('Camera has no layers attached by default', function () {
  const camera = new ZCamera()
  expect(camera.layers).to.have.length(0, 'no layers')
})

it('Adding a layer twice ignores second addition', function () {
  const camera = new ZCamera()
  const layer = new ZLayer()
  camera.addLayer(layer)
  camera.addLayer(layer)
  expect(camera.layers).to.have.length(1)
})

it('Adding layer wires it to this camera', function () {
  const camera = new ZCamera()
  const layer = new ZLayer()
  camera.addLayer(layer)
  expect(layer.cameras).to.have.length(1, 'layer has 1 registered camera')
})

it("Camera bounds should match canvas's", function () {
  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 400

  const pCanvas = new ZCanvas(canvas)

  const cameraBounds = pCanvas.camera.bounds
  expect(cameraBounds.x).to.equal(0)
  expect(cameraBounds.y).to.equal(0)
  expect(cameraBounds.width).to.equal(canvas.width)
  expect(cameraBounds.height).to.equal(canvas.height)
})

it('can be asked about nodes at a particular point', () => {
  const camera = new ZCamera()

  let nodes = camera.getPickedNodes(0, 0)
  expect(nodes).to.deep.equal([])

  const node = new ZNode({
    bounds: new ZBounds({ x: 0, y: 0, width: 100, height: 100 })
  })

  camera.addChild(node)
  nodes = camera.getPickedNodes(0, 0)
  expect(nodes).to.deep.equal([node])

  camera.removeChild(node)

  const layer = new ZLayer()
  camera.addLayer(layer)
  layer.addChild(node)

  nodes = camera.getPickedNodes(0, 0)
  expect(nodes).to.deep.equal([node])
})

it('can transform view', () => {
  const camera = new ZCamera()
  const layer = new ZLayer()
  camera.addLayer(layer)
  const node = new ZNode({
    bounds: new ZBounds({ x: 0, y: 0, width: 10, height: 10 })
  })
  layer.addChild(node)
})
