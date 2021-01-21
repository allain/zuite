import { ZNode, ZBounds, ZText } from '../zuite.min.mjs'
import { DayNode } from './DayNode.mjs'
import { generateTasks } from './generate-tasks.mjs'

const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

const monthWidth = 600

export class MonthNode extends ZNode {
  constructor (year, month) {
    super({
      focusable: true,
      bounds: new ZBounds(0, 0, monthWidth, 570),
      fillStyle: '#cccccc'
    })

    const columnWidth = monthWidth / 7
    // Add the Month Name
    this.addChild(new ZText(monthNames[+month]).scaleBy(2).translateBy(5, 5))

    // Add the Weekday names
    this.addChild(
      ...dayNames.map((d, i) =>
        new ZText(d).translateBy(i * columnWidth, 50).scaleBy(0.7)
      )
    )

    const daysInMonth = new Date(year, month + 1, 0).getDate()

    let columnNumber = new Date(year, month, 1).getDay()
    let currentY = 70

    for (let currentDay = 0; currentDay < daysInMonth; currentDay++) {
      this.addChild(
        new DayNode(currentDay + 1, generateTasks(), {
          bounds: new ZBounds(0, 0, columnWidth * 5, 500)
        })
          .translateBy(columnNumber++ * columnWidth, currentY)
          .scaleBy(0.2)
      )

      columnNumber %= 7

      if (columnNumber === 0) {
        currentY += 100
      }
    }

    this.bounds = this.fullBounds
  }
}

ZNode.monthWidth = monthWidth
