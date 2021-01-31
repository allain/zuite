// yoinked from https://github.com/theelee13/node-simplify-polyline

export function simplifyPolyLine(pointList, epsilon) {
  const listLength = pointList.length
  if (listLength < 3) return pointList

  var index = 0
  var largestDistance = 0
  var firstPoint = pointList[0]
  var lastPoint = pointList[listLength - 1]
  //Begin part A
  for (var i = 1; i < listLength - 1; i++) {
    const thisDistance = distanceFromPointToLine(
      pointList[i],
      firstPoint,
      lastPoint
    )

    if (thisDistance > largestDistance) {
      largestDistance = thisDistance
      index = i
    }
  }
  //End part A
  if (largestDistance < epsilon) {
    return [firstPoint, lastPoint] //These are the only values that are necessary in this case.
  } else {
    //Begin part B
    const firstHalf = pointList.slice(0, index + 1) //we need to include index's value, it's accepted and can be tested against.
    const lastHalf = pointList.slice(index, listLength)
    const newList1 = simplifyPolyLine(firstHalf, epsilon)
    const newList2 = simplifyPolyLine(lastHalf, epsilon)
    return newList1.slice(0, newList1.length - 1).concat(newList2)
  }
}

function distanceFromPointToLine(p, a, b) {
  return Math.sqrt(distanceFromPointToLineSquared(p, a, b))
}

//This is the difficult part. Commenting as we go.
function distanceFromPointToLineSquared(p, i, j) {
  const lineLength = pointDistance(i, j) //First, we need the length of the line segment.
  if (lineLength == 0) {
    //if it's 0, the line is actually just a point., so use length of point to one of the endpoints
    return pointDistance(p, i)
  }
  const t = ((p.x - i.x) * (j.x - i.x) + (p.y - i.y) * (j.y - i.y)) / lineLength

  //t is very important. t is a number that essentially compares the individual coordinates
  //distances between the point and each point on the line.

  if (t < 0) {
    //if t is less than 0, the point is behind i, and closest to i.
    return pointDistance(p, i)
  } //if greater than 1, it's closest to j.
  if (t > 1) {
    return pointDistance(p, j)
  }
  return pointDistance(p, {
    x: i.x + t * (j.x - i.x),
    y: i.y + t * (j.y - i.y),
  })
  //this figure represents the point on the line that p is closest to.
}

//returns distance between two points. Easy geometry.
function pointDistance(i, j) {
  return sqr(i.x - j.x) + sqr(i.y - j.y)
}

//just to make the code a bit cleaner.
function sqr(x) {
  return x * x
}
