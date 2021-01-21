import { expect } from '@esm-bundle/chai'

import { ZActivity } from '../src/activities/ZActivity.mjs'
import { ZRoot } from '../src/ZRoot.mjs'
import { ZNode } from '../src/ZNode.mjs'

it('can be created', () => {
  const r = new ZRoot()
  expect(r).to.be.instanceOf(ZRoot)
  expect(r).to.be.instanceOf(ZNode)
})

it('exposes a scheduler', () => {
  const r = new ZRoot()
  expect(r.scheduler).not.to.be.undefined
})

it('can schedule activities', () => {
  const r = new ZRoot()
  r.schedule(new ZActivity())
})
