/* A library of helpful mathematical functions */
const SAMPLES = [2, 4, 8, 20, 30, 50, 80, 110, 780, 4375, 29380];

function getTickSize(min, max) {
  /* Compute about (+-1) steps bucket delimitations between min and max. */

  if (min === max) {
    const delta = Math.abs(min / 10.0);
    min = min - delta;
    max = max + delta;
  }

  function scaleLog10(x, magnitude) {
    return x * Math.pow(10, magnitude);
  }
  
  // normalizedTicks between 1 and 5
  let tickSize;
  const tickLog = Math.log10(max - min);
  const magnitude = Math.floor(tickLog);
  const normalizedTicks = tickLog - magnitude;

  // Refine to get a round number (multiple of 1, 2, 5, 10, 20, 50, ...)
  switch (true) {
    case (normalizedTicks < 0.477): // ~3.0
      tickSize = scaleLog10(0.5, magnitude);
      break;
    case (normalizedTicks < 0.778): // ~6.0
      tickSize = scaleLog10(1.0, magnitude);
      break;
    default:
      tickSize = scaleLog10(2.0, magnitude);
  }
  return tickSize;
}

export {getTickSize};

// for (let i of SAMPLES) {
//   console.log(`Range: ${i} → ${getTickSize(0, i)}`);
// }
