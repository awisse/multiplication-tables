/* Graph library
 * One type of graph: line graph connecting values.
 */
import {getTickSize} from './lib/calculations.js';

const TICKPX = 4; // How many pixels per tick (at least)
const TICKLEN = 3; // Length of a tickmark
const LABELSIZE = 10; // Fontsize of labels

class Tick {
  constructor(value, position) {
    this.value = value;
    this.position = position;
  }
  copy() {
    /* Return a copy of the Tick */
    return new Tick(this.value, this.position);
  }

  step(valueStep, positionStep) {
    /* Return a shifted copy of this Tick */
    return new Tick(this.value + valueStep, this.position + positionStep);
  }
}

class Plot2d {
  /* Class to create and modify a <canvas> object as a 
   * 2d graph. 
   * `values`: pairs of numbers (x, y) for x-axis and y-axis.
   *
   */
  yTickCount = 5; // Number of ticks on the y-axis
  pixelsPerTick = 5; // Minimal number of pixels per tick (for x-axis)
  labelSpace = 30; // Number of pixels to save for labels on axes.

  #canvas;
  #titleText = "";

  constructor(values, id, hsize=400, vsize=300) {
    this.values = values;
    this.numValues = values.length;

    this.#canvas = document.createElement("canvas");
    this.#canvas.width = hsize.toString();
    this.#canvas.height = vsize.toString();
    this.#canvas.id = id;
    this.ctx = this.#canvas.getContext("2d");

    this.hsize = hsize;
    this.vsize = vsize;

    this.yPxAvailable = this.vsize - 2 * this.labelSpace; 
    this.xPxAvailable = this.hsize - 2 * this.labelSpace;
    this.yMinPos = this.labelSpace + this.yPxAvailable;
    this.xMinPos = this.labelSpace;

  }

  get canvas() {
    return this.#canvas;
  }

  set className(name) {
    this.#canvas.classList.add(name);
  }

  set id(identifier) {
    this.#canvas.id = identifier;
  }

  set title(description) {
    this.#titleText = description;
  }

  #getYTicks() {
    /* Compute y-ticks from values. */

    // Calculation values
    let values = this.values.map(p => p[1]);
    let max = Math.max(...values);
    let min = Math.min(...values);
    let tickSize = getTickSize(min, max);
    let numTicks = Math.ceil((max - min) / tickSize);
    let tickPx = Math.floor(this.yPxAvailable / numTicks);

    // Start with an integer multiple of tickSize
    let minYTick = Math.floor(min / tickSize) * tickSize;
    this.yticks = [new Tick(minYTick, this.yMinPos)];

    /* Guarantee at least two ticks (provided min < max).
     * Last tick above max value */
    while (this.yticks.at(-1).value <= max) {
      this.yticks.push(this.yticks.at(-1).step(tickSize, -tickPx));
    }

  }

  #getXTicks() {
    /* x-ticks. 
     * Ticks should be at least TICKPX pixels apart.
     * One tick after the last value */
    let maxTicks = Math.floor(this.xPxAvailable / TICKPX) - 1;
    let numTicks = Math.min(this.numValues, maxTicks);
    let tickPx = Math.max(Math.floor(this.xPxAvailable / this.numValues),
                          TICKPX);

    this.xticks = new Array(numTicks);
    let offset = Math.max(0, this.numValues - maxTicks);

    for (let i = 0; i < numTicks; i++) {
      this.xticks[i] = new Tick(this.values[i][0], 
                                this.xMinPos + i * tickPx);
    }

  }

  #plotXAxis() {
    /* Plot the x-axis */
    this.ctx.moveTo(this.xMinPos, this.yMinPos);
    this.ctx.lineTo(this.xMinPos + this.xPxAvailable, this.yMinPos);
    this.#plotXTicks();
  }

  #plotYAxis() {
    /* Plot the y-axis */
    this.ctx.moveTo(this.xMinPos, this.yMinPos);
    this.ctx.lineTo(this.xMinPos, this.yMinPos - this.yPxAvailable);
    this.#plotYTicks();
  }

  #plotXTicks() {
    this.#getXTicks();
    for (let tick of this.xticks) {
      this.ctx.moveTo(tick.position, this.yMinPos);
      this.ctx.lineTo(tick.position, this.yMinPos + TICKLEN);
    }
  }

  #plotYTicks() {
    this.#getYTicks();
    
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "middle";
    this.ctx.font = "10px sans-serif";
    for (let tick of this.yticks) {
      this.ctx.moveTo(this.xMinPos, tick.position);
      this.ctx.lineTo(this.xMinPos - TICKLEN, tick.position);
      // Draw the label
      this.ctx.fillText(tick.value.toString(), this.xMinPos - TICKLEN - 2, 
                        tick.position);
    }
  }

  #calcY(ix) {
    /* Compute y-position of value at index ix */
    let yRange = this.yticks.at(-1).value - this.yticks.at(0).value;
    let yPixels = this.yticks.at(-1).position - this.yticks.at(0).position;
    let yValue = this.values[ix][1] - this.yticks[0].value;

    // Cross multiplication
    let y = this.yMinPos + yValue / yRange * yPixels;

    return Math.round(y);
  }

  #drawTitle() {
    let titleX = this.hsize / 2;
    let titleY = this.labelSpace / 2;

    if (this.#titleText) {
      this.ctx.textAlign = "center";
      this.ctx.font = "20px sans-serif";
      this.ctx.textBaseline = "hanging";
      this.ctx.fillText(this.#titleText, titleX, titleY);
    }
  }

  #drawGraph() {
    let yPosition = this.#calcY(0); // y-position of the value
    this.ctx.moveTo(this.xticks[0].position, yPosition);

    for (let i = 1; i < this.xticks.length; i++) {
      yPosition = this.#calcY(i);
      this.ctx.lineTo(this.xticks[i].position, yPosition);
    }
    
  }

  plot() {
    /* Open the drawing */
    this.ctx.beginPath();

    /* Draw the axes */
    this.#plotXAxis();
    this.#plotYAxis();

    this.#drawGraph();
    this.#drawTitle();

    /* Draw everything */
    this.ctx.stroke();
  }
}

export { Plot2d };
