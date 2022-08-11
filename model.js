/* The Model Module
 * 1. Compute list of pairs of numbers
 * 2. Update list of numbers
 * 3. Compute proposals
 * 4. Load from localStorage
 * 5. Save to localStorage
 * */
import {TESTING, MAX_TABLE_INT} from './constants.js'

class Model {

    constructor() {
    }


    getPlayersAndScores() {
        /* Retrieve names and high scores from localStorage */
        var players;
        if (TESTING) {
            players = testPlayers()
        } else {
            players = getStorageItem(PLAYERS)
        }

        players.sort(playerSort)

        return players
    }

}

function testPlayers() {
    /* Une liste de noms et scores pour tester */
    // return [];
    let players = [ {name: 'Maman', 
                     score: 10754,
                     combinations: generateMultitables()},
                    {name: 'Florence',
                     score: 756,
                     combinations: generateMultitables()}, 
                    {name: 'Rémi',
                     score: 756,
                     combinations: generateMultitables()}];
    return players;
}

function playerSort(a, b) {
    /* Sort players by score. Highest first.
     * Then by name. */
    if (a.score > b.score) { return -1; }
    if (a.score < b.score) { return 1; }
    if (a.score === b.score) {
        if (a.name < b.name) { return -1; }
        if (a.name > b.name) { return 1; }
        return 0;
    }
}

function generateMultitables(repetitions=3) {
    /* Generate a list with all combinations of multiplications starting
     * with multiples of 2. Each combination is repeated `repetition` times
     * in order to determine its probability of being selected. 
     * If an answer is correct, one instance of the combination is removed.
     * If an answer is wrong, one instance of the combination is added. */

	const allCombinations = [];
	for (let i = 2; i < MAX_TABLE_INT; i++) {
		for (let j = 2; j <= MAX_TABLE_INT; j++) {
            for (let k=0; k<3; k++) {
                allCombinations.push([i, j]);
                // Ask question in both directions
                if (i != j) {
                    allCombinations.push([j, i])
                }
            }
		}
	}
	return allCombinations;
}


function getStorageItem(name) {
    /* Get the item named `name` from localStorage */

    if (!localStorage)
        return null;
    let value = localStorage.getItem(name);
    return value ? JSON.parse(value) : null;
}

function setStorageItem(name) {
    
    if (localStorage) {
        localStorage.setItem(name, JSON.stringify(value));
    }
}
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

export { 
    Model, 
    /* Export for testing only */
    testPlayers,
    playerSort,

}
