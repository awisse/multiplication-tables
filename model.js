/* The Model Module
 * 1. Compute list of pairs of numbers
 * 2. Update list of numbers
 * 3. Compute proposals
 * 4. Load from localStorage
 * 5. Save to localStorage
 * */
function computePairs(selectedTables) {
    /* Compute all pairs of numbers for the selected tables */
}

function insertPair(pair) {
    /* Add pair of numbers to the list in a random position */
}

function removePair(pair) {
    /* Remove pair of numbers from the list, provided at least one
     * pair is left after removal.
     * */
}

function selectRandomPair() {
    /* Select a random pair from the list */
}

function checkAnswer(pair, user_selection) {
    /* Check whether the user provided the correct answer */
    return (pair[0] * pair[1] === user_selection)
}
