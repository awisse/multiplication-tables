/* Graph library
 * One type of graph: line graph connecting values.
 */
import { getTickSize } from "./calculations.js"

const TICKPX = 4 // How many pixels per tick (at least)
const TICKLEN = 3 // Length of a tickmark
const CIRCLE_RADIUS = 2 // Pixels

class Tick {
  constructor (value, position) {
    this.value = value
    this.position = position
  }

  copy () {
    /* Return a copy of the Tick */
    return new Tick(this.value, this.position)
  }

  step (valueStep, positionStep) {
    /* Return a shifted copy of this Tick */
    return new Tick(this.value + valueStep, this.position + positionStep)
  }
}

class Plot2d {
  /* Class to create and modify a <canvas> object as a
   * 2d graph.
   * `values`: pairs of numbers (x, y) for x-axis and y-axis.
   */
  yTickCount = 5 // Number of ticks on the y-axis
  pixelsPerTick = 5 // Minimal number of pixels per tick (for x-axis)
  labelSpace = 30 // Number of pixels to save for labels on axes.
  topMargin = 45 // Space reserved for title

  #canvas
  #ctx
  #values
  #titleText = ""

  constructor (values, id, hsize = 400, vsize = 300) {
    this.data = values

    this.#canvas = document.createElement("canvas")
    this.#canvas.width = hsize.toString()
    this.#canvas.height = vsize.toString()
    this.#canvas.id = id
    this.#ctx = this.#canvas.getContext("2d")

    this.hsize = hsize
    this.vsize = vsize

    this.yPxAvailable = this.vsize - this.labelSpace - this.topMargin
    this.xPxAvailable = this.hsize - 2 * this.labelSpace
    this.yMinPos = this.topMargin + this.yPxAvailable
    this.xMinPos = this.labelSpace
  }

  get canvas () {
    return this.#canvas
  }

  get rect () {
    return this.#canvas.getBoundingClientRect()
  }

  get id () {
    return this.#canvas.id
  }

  get title () {
    return this.#titleText
  }

  set id (identifier) {
    this.#canvas.id = identifier
  }

  set title (description) {
    this.#titleText = description
  }

  set data (values) {
    this.#values = values
    this.numValues = values.length
  }

  erase () {
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height)
  }

  #getYTicks () {
    /* Compute y-ticks from values. */

    // Calculation values
    const values = this.#values.map(p => p[1])
    const max = Math.max(...values)
    const min = Math.min(...values)

    const tickSize = getTickSize(min, max)

    // Start with an integer multiple of tickSize
    const minYTick = Math.floor(min / tickSize) * tickSize
    const maxYTick = Math.ceil(max / tickSize) * tickSize

    const numTicks = Math.max((maxYTick - minYTick) / tickSize + 1, 2)
    const tickPx = Math.floor(this.yPxAvailable / numTicks)

    this.yticks = [new Tick(minYTick, this.yMinPos)]

    /* Guarantee at least two ticks (provided min < max). */
    for (let i = 1; i < numTicks; i++) {
      this.yticks.push(this.yticks.at(-1).step(tickSize, -tickPx))
    }
  }

  #getXTicks () {
    /* x-ticks.
     * Ticks should be at least TICKPX pixels apart.
     * One tick after the last value */
    const maxTicks = Math.floor(this.xPxAvailable / TICKPX) - 1
    const numTicks = Math.min(this.numValues, maxTicks)
    const tickPx = Math.max(Math.floor(this.xPxAvailable / this.numValues),
      TICKPX)

    this.xticks = new Array(numTicks)

    // Special case : `numTicks === 1`.
    if (numTicks === 1) {
      this.xticks[0] = new Tick(this.#values[0][0], this.xMinPos +
        this.xPxAvailable / 2)
      return
    }

    const offset = Math.max(0, this.numValues - maxTicks)

    for (let i = 0; i < numTicks; i++) {
      this.xticks[i] = new Tick(this.#values[i + offset][0],
        this.xMinPos + i * tickPx)
    }
  }

  #plotXAxis () {
    this.#ctx.beginPath()
    /* Plot the x-axis */
    this.#ctx.moveTo(this.xMinPos + 0.5, this.yMinPos)
    this.#ctx.lineTo(this.xMinPos + this.xPxAvailable + 0.5, this.yMinPos)
    this.#plotXTicks()

    this.#ctx.stroke()
  }

  #plotYAxis () {
    this.#ctx.beginPath()
    /* Plot the y-axis */
    this.#ctx.moveTo(this.xMinPos, this.yMinPos - 0.5)
    this.#ctx.lineTo(this.xMinPos, this.yMinPos - this.yPxAvailable - 0.5)
    this.#plotYTicks()

    this.#ctx.stroke()
  }

  #plotXTicks () {
    this.#getXTicks()
    for (const tick of this.xticks) {
      this.#ctx.moveTo(tick.position, this.yMinPos)
      this.#ctx.lineTo(tick.position, this.yMinPos + TICKLEN)
    }
  }

  #plotYTicks () {
    this.#getYTicks()

    this.#ctx.textAlign = "right"
    this.#ctx.textBaseline = "middle"
    this.#ctx.font = "10px sans-serif"
    for (const tick of this.yticks) {
      this.#ctx.moveTo(this.xMinPos, tick.position)
      this.#ctx.lineTo(this.xMinPos - TICKLEN, tick.position)
      // Draw the label
      this.#ctx.fillText(tick.value.toString(), this.xMinPos - TICKLEN - 2,
        tick.position)
    }
  }

  #calcY (ix) {
    /* Compute y-position of value at index ix */
    const yRange = this.yticks.at(-1).value - this.yticks.at(0).value
    const yPixels = this.yticks.at(-1).position - this.yticks.at(0).position
    const yValue = this.#values[ix][1] - this.yticks[0].value

    // Cross multiplication
    const y = this.yMinPos + yValue / yRange * yPixels

    return Math.round(y)
  }

  #drawTitle () {
    const titleX = this.hsize / 2
    const titleY = this.labelSpace / 2

    if (this.#titleText) {
      this.#ctx.textAlign = "center"
      this.#ctx.font = "20px sans-serif"
      this.#ctx.textBaseline = "hanging"
      this.#ctx.fillText(this.#titleText, titleX, titleY)
    }
  }

  #drawGraph () {
    this.#ctx.beginPath()
    let xPosition = this.xticks[0].position
    let yPosition = this.#calcY(0) // y-position of the value
    this.#circleAt(xPosition, yPosition)
    this.#ctx.moveTo(xPosition, yPosition)

    this.#ctx.save()
    this.#ctx.strokeStyle = "red"

    for (let i = 1; i < this.xticks.length; i++) {
      xPosition = this.xticks[i].position
      yPosition = this.#calcY(i)
      this.#ctx.lineTo(xPosition, yPosition)
      this.#circleAt(xPosition, yPosition)
      // Move to the center of the circle after drawing it
      this.#ctx.moveTo(xPosition, yPosition)
    }

    this.#ctx.stroke()
    this.#ctx.restore()
  }

  #circleAt (x, y) {
    /* Draw a small circle at position x, y (a data point) */
    this.#ctx.arc(x, y, CIRCLE_RADIUS, 0, 2 * Math.PI)
  }

  coordsAt (ix) {
    /* Return coordinates of plot point at index `ix` */
    return { x: this.xticks[ix].position, y: this.#calcY(ix) }
  }

  draw () {
    /* Draw the axes */
    this.#plotXAxis()
    this.#plotYAxis()

    this.#drawGraph()
    this.#drawTitle()
  }
}

export { Plot2d, CIRCLE_RADIUS }
