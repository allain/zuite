import { expect } from '@esm-bundle/chai'

import { ZCamera } from '../src/ZCamera.mjs'
import { ZLayer } from '../src/ZLayer.mjs'

it('no cameras by default', function () {
  const layer = new ZLayer()
  expect(layer.cameras).to.have.length(0)
})

it('Adding a camera does so', function () {
  const layer = new ZLayer()
  const camera = new ZCamera()
  layer.addCamera(camera)

  expect(layer.cameras).to.have.length(1)
  expect(layer.cameras[Symbol.iterator]().next().value).to.equal(
    camera,
    'same camera'
  )
})

it('treats cameras as a Set', function () {
  const layer = new ZLayer()
  const camera = new ZCamera()
  layer.addCamera(camera)
  layer.addCamera(camera)
  expect(layer.cameras).to.have.length(1, '1 camera')
})

it('supports removing camera', function () {
  const layer = new ZLayer()
  const camera = new ZCamera()
  layer.addCamera(camera)
  layer.removeCamera(camera)
  expect(layer.cameras).to.have.length(0)
})
