/* Define functions that return random values.
 */

export function getRandomBetween(min_rand, max_rand, numbers=[]) {
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
    if (min_rand == max_rand) {
        for (const i of numbers) {
            if (i == min_rand) {
                throw `Can\'t exclude only allowed value ${min_rand}`;
            }
        }
        return max_rand; // Only result possible
    }
    //
    // Compute and return number
    //
    let x;
    for (let i = min_rand; i < max_rand; i++) {
        x = Math.trunc(min_rand + (max_rand - min_rand + 1) * Math.random());
        if (! numbers.includes(x)) {
            numbers[numbers.indexOf(0)] = x
            return;
        }
    }
    throw 'No random number found';
}

