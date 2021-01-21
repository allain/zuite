import { ZNode } from './ZNode.mjs'

export class ZLayer extends ZNode {
  constructor (...args) {
    super(...args)

    this.cameras = []
  }

  addCamera (camera) {
    if (this.cameras.includes(camera)) return

    this.cameras.push(camera)
  }

  removeCamera (camera) {
    camera.removeLayer(this)
    this.cameras = this.cameras.filter(c => c !== camera)
  }
}
