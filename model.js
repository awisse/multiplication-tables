/* The Model Module
 * 1. Compute list of pairs of numbers
 * 2. Update list of numbers
 * 3. Compute proposals
 * 4. Load from localStorage
 * 5. Save to localStorage
 * */
'use strict';
import {TESTING} from './constants.js'; 
import {MAX_TABLE_INT, MAX_PROPOSALS} from './constants.js';
import {TIMEOUT}  from './constants.js';
import {SUCCEED, FAIL, PLAYERS} from './constants.js';

import getRandomBetween from './random.js';

class Model {

  constructor() {
    this._loadPlayers();
  }

  _loadPlayers() {
    /* Retrieve names and high scores from localStorage */
    this.players = getStorageItem(PLAYERS);

    if ((this.players.length === 0) && TESTING) {
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
      note: 0.0,
      combinations: generateMultitables(),
    }
    this.players.push(new_player);
    this._savePlayers();

    return SUCCEED;
  }

  deletePlayer(name) {
    /* Find the player */
    let player_index = this._findPlayer(name);
    /* Do not allow deletion of a player with a score */
    if (this.players[player_index].score > 0) {
      return false;
    }
    this.players.splice(player_index, 1);
    this._savePlayers();
    return true;
  }

  deleteAllPlayers() {
    /* Delete all players. Irreversible. */
    while (this.players.pop());
    this._savePlayers();
  }

  _findPlayer(name) {

    var player;
    for (let i=0; i < this.players.length; i++) {
      player = this.players[i];
      if (player.name === name) {
        return i;
      }
    }
    return -1;
  }

  getCombinations(name) {

    const player_ix = this._findPlayer(name);
    const player = this.players[player_ix];
    return player.combinations;
  }

  bindPlayersChanged(callback) {
    this.onPlayersChanged = callback
  }

}

class Quiz {

  constructor(name, sample_count, combinations) {
    /* Class for a quiz */
    this.sample_count = this.counter = sample_count;
    this.combinations = combinations;

    this.score = 0;
    this.timeout = undefined;
    this.timer = new Timer();
    this.currentProblem = undefined;
  }

  get problem() {
    return this.currentProblem
  }

  start() {
    /* Start the timer and problem handler */
  }

  gameOver() {
    /* */
  }

  checkAnswer(answer) {
    return (answer === this.currentProblem.solution);
  }

  bindTimeout(callback) {
    /* Function called after timeout*/
    this.timeoutAction = callback;
  }

  bindGameOver(callback) {
    this.handleGameOver = callback;
  }

  cancelTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  nextQuestion() {

    this.counter -= 1;
    if (this.counter === 0) {
      /* End of quiz */
      this.handleGameOver(this.score, 0.0);
    }

    this.cancelTimeout();

    /* Select the pair of numbers from this.combinations */
    const count = this.combinations.length;
    const selected = Math.floor(count * Math.random());
    const pair = this.combinations.at(selected);

    this.currentProblem = {
      pair: pair, 
      solution: pair[0] * pair[1],
      proposals: buildProposals(pair)
    }

    this.timeout = setTimeout(this.timeoutAction, TIMEOUT);

    this.timer.reset();
  }
}

class Timer {
  /* Implement a simple stopwatch of milliseconds */
  constructor () {
    this.time = new Date();
    this.reset();
  }

  reset() {
    this.start = this.time.getTime();
  }

  elapsed() {
    var duration = this.time.getTime() - this.start();
    return duration;
  }
}



function testPlayers() {
  /* A list of player data for testing */
  let players = [ {name: 'Maman', 
    score: 10754, note: 0.91,
    combinations: generateMultitables()},
    {name: 'Florence',
      score: 756, note: 0.86,
      combinations: generateMultitables()}, 
    {name: 'Rémi',
      score: 756, note: 0.86,
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

function shuffleArray(arr) {
  /* Source: https://www.w3docs.com/snippets/javascript/how-to-randomize-shuffle-a-javascript-array.html */
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function buildProposals(numbers) {
  /* Principles for proposals:
   * 1. They must be plausible (ex: 2*2 =? 102 ??, vs 6*7 =? 54 !!)
   * 2. Single digit results: Remain single digit.
   * 3. Double digit results: Remain double digit.
   * 4. Trible digit results: Remain trible digit.
   * 5. At most 2 * largest operand above or below.
   */
  const solution  = numbers[0] * numbers[1];
  let min_rand, max_rand; 
  const proposals = new Int16Array(MAX_PROPOSALS);

  proposals[0] = solution;
  switch (Math.trunc(Math.log10(solution))) {
    case 0:
      min_rand = 2;
      max_rand = 10;
      break;
    case 1:
      min_rand = Math.max(solution - 12, 6); // 2..5 not plausible
      max_rand = Math.min(solution + 12, 108); // 9 * 12
      break;
    case 2:
      /* 9 * 12 the only > 100 with one operand < 10 */
      min_rand = Math.max(solution - 12, 100); 
      max_rand = solution + 12;
  }
  for (let i = 1; i < MAX_PROPOSALS; i++) {
    proposals[i] = getRandomBetween(min_rand, max_rand, proposals);
  }
  shuffleArray(proposals);
  return proposals;
}

function getStorageItem(name) {
  /* Get the item named `name` from localStorage */

  if (!localStorage)
    return [];
  let value = localStorage.getItem(name);
  return value ? JSON.parse(value) : [];
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
