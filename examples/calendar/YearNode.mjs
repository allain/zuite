import { ZText, ZNode } from '../zuite.min.mjs'

import { MonthNode } from './MonthNode.mjs'

export class YearNode extends ZNode {
  constructor (year) {
    super({
      focusable: true,
      bounds: [0, 0, MonthNode.monthWidth + 50, 570 + 70],
      fillStyle: '#eeeeee'
    })

    this.addChild(new ZText('' + year).scaleBy(2).translateBy(5, 5))

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const monthX = 10 + (monthIndex % 4) * 160
      const monthY = 10 + ((monthIndex - (monthIndex % 4)) / 4) * 200

      this.addChild(
        new MonthNode(year, monthIndex)
          .scaleBy(0.25)
          .translateBy(monthX, monthY + 50)
      )
    }
  }
}
