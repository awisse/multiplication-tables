/* The Model Module
 * 1. Compute list of pairs of numbers
 * 2. Update list of numbers
 * 3. Compute proposals
 * 4. Load from localStorage
 * 5. Save to localStorage
 * */
import {TESTING} from './constants.js'; 
import {MAX_TABLE_INT, SUCCEED, FAIL, PLAYERS} from './constants.js';

class Model {

    constructor() {
        this._loadPlayers();
    }

    _loadPlayers() {
        /* Retrieve names and high scores from localStorage */
        this.players = getStorageItem(PLAYERS);

        if (!this.players && TESTING) {
            this.players = testPlayers();
            this.players.sort(playerSort);
        }

        return this.players;
    }


    _savePlayers() {
        this.onPlayersChanged(this.players);
        setStorageItem(PLAYERS, this.players);
    }

    addPlayer(name) {
        /* First check whether player name exists */
        if (this._findPlayer(name) >= 0) {
            return FAIL;
        }

        const new_player = {
            name: name,
            score: 0,
            combinations: generateMultitables(),
        }
        this.players.push(new_player);
        this._savePlayers();

        return SUCCEED;
    }

    deletePlayer(name) {
        /* Find the player */
        let player_index = this._findPlayer(name);
        this.players.splice(player_index, 1);
        this._savePlayers();
    }
        
    _findPlayer(name) {

        for (let i=0; i < this.players.length; i++) {
            const player = this.players[i];
            if (player.name === name) {
                return i;
            }
        }
        return -1;
    }

    getCombinations(name) {

        const player = this._findPlayer(name);
        return player.combinations;
    }

    bindPlayersChanged(callback) {
        this.onPlayersChanged = callback
    }

    
    bindQuizAnswer(callback) {

    }

}

class Quiz {

    constructor(number, combinations) {
        /* Class for a quiz */
        this.counter = number;
        this.combinations = combinations;
        }

    nextQuestion() {
        
        const count = this.combinations.length;

        this.counter -= 1;
        if (this.counter === 0) {
            /* End of quiz */
            return null
        }

        selected = Math.floor(count * Math.random());
        pair = combinations.at(selected);

        problem = {question: pair,
                   answer: pair[0] * pair[1]}

        return problem;
    }

    getProposals(problem) {
        /* TODO: Build and return proposals for problem */
    }


}

function testPlayers() {
    /* A list of player data for testing */
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

function setStorageItem(name, item) {
    /* Save the object `item` to localStorage under the `name`. */
    if (localStorage) {
        localStorage.setItem(name, JSON.stringify(item));
    }
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
    Quiz,
    /* Export for testing only */
    testPlayers,
    playerSort,

}
