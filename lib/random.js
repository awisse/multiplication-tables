/* Define functions that return random values.
*/
export default function getRandomBetween (minRand, maxRand, numbers = []) {
  /* Insert a uniform random integer between `minRand` and `maxRand`
   * inclusively into `numbers` at the first zero value position.
   * Don't insert a number that is already in `numbers`.
   * `minRand` and `maxRand` must be positive nonzero numbers.
   */
  // Validate parameters
  if (minRand > maxRand) {
    console.log(`minRand = ${minRand}   maxRand = ${maxRand}`)
    throw Error("maxRand must be greater or equal than minRand")
  }

  if ((minRand <= 0) || (maxRand <= 0)) {
    console.log(`minRand = ${minRand}   maxRand = ${maxRand}`)
    throw Error('"minRand" and "maxRand" must be strictly positive')
  }

  // Only one return value possible
  if (minRand === maxRand) {
    if (numbers.includes(minRand)) {
      throw Error(`Can't exclude only allowed value ${minRand}`)
    }
    return minRand // Only result possible
  }

  /* Compute and return number
   * 1. Determine list of unused numbers.
   * 2. If the list is empty, throw exception.
   * 3. Choose from unused numbers. */
  const available = []
  for (let i = minRand; i < maxRand; i++) {
    if (numbers.includes(i)) continue
    available.push(i)
  }

  if (available === []) {
    throw Error("No random number available")
  }

  const ix = Math.trunc(available.length * Math.random())
  return available[ix]
}
