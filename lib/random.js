/* Define functions that return random values.
*/
function range(a, b, step=1) {
  /* Return an array with numbers between a (included) and b (excluded)
   * with `step` difference between them. */
  if (!(typeof a === "number") || !(typeof b === "number") ||
      !(typeof step === "number")) {
    throw "Arguments must be numbers";
  }

  var array = [];
  for (i = a; i < b; i += step) {
    array.push(i);
  }
  return array;
}
      

export default function getRandomBetween(min_rand, max_rand, numbers=[]) {
  /* Insert a uniform random integer between `min_rand` and `max_rand` 
   * inclusively into `numbers` at the first zero value position.  
   * Don't insert a number that is already in `numbers`.
   * `min_rand` and `max_rand` must be positive nonzero numbers.
   */
  // Validate parameters
  if (min_rand > max_rand) {
    console.log(`min_rand = ${min_rand}   max_rand = ${max_rand}`)
    throw 'max_rand must be greater or equal than min_rand';
  }

  if ((min_rand <= 0) || (max_rand <= 0)) {
    console.log(`min_rand = ${min_rand}   max_rand = ${max_rand}`)
    throw '`min_rand` and `max_rand` must be strictly positive';
  }

  // Only one return value possible
  if (min_rand == max_rand) {
    if (numbers.includes(min_rand)) {
      throw `Can\'t exclude only allowed value ${min_rand}`; 
    }
    return min_rand; // Only result possible
  }

  /* Compute and return number
   * 1. Determine list of unused numbers.
   * 2. If the list is empty, throw exception.
   * 3. Choose from unused numbers. */
  const available = [];
  for (let i = min_rand; i < max_rand; i++) {
    if (numbers.includes(i)) continue;
    available.push(i);
  }
  
  if (available === []) {
    throw 'No random number available';
  }

  const ix = Math.trunc(available.length * Math.random());
  return available[ix];
}

