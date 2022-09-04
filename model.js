/* The Model Module
 * 1. Compute list of pairs of numbers
 * 2. Update list of numbers
 * 3. Compute proposals
 * 4. Load from localStorage
 * 5. Save to localStorage
 * */
'use strict';
import {TESTING} from './constants.js'; 
import {MAX_TABLE_INT, MAX_PROPOSALS, CORRECT_POINTS} from './constants.js';
import {TIMEOUT}  from './constants.js';
import {SUCCEED, FAIL, PLAYERS} from './constants.js';

import getRandomBetween from './random.js';

class Player {
  /* A class that contains all information about a player */
  constructor(name, results=[], combinations=undefined) {
    /* `name` is the minimal parameter.
     * `results` and `combinations` can be known from stored results.
     */
    this.name = name;
    const result = {date: Date.now(), score: 0, note: 0.0};
    this.results = results ? results : [result];
    this.combinations = combinations ? combinations : generateMultitables();
  }

  get highScore() {
    /* Return highscore for the player */
    let hscore = 0;
    function useHigherScore(result) {
      hscore = result.score > hscore ? result.score : hscore;
    }
    this.results.forEach(useHigherScore);
    return hscore;
  }

  get serialize() {
    /* Return serialized version of this */
    return {
      name: this.name,
      results: this.results,
      combinations: this.combinations};
  }

}

class Players {

  constructor() {
    this.#_loadPlayers();
  }

  #_loadPlayers() {
    /* Retrieve names and high scores from localStorage */
    this.players = loadPlayers();
   
    if ((this.players.length === 0) && TESTING) {
      this.players = testPlayers();
      this.players.sort(playerSort);
    }
  }


  #_savePlayers() {
    this.onPlayersChanged(this.players);
    savePlayers(this.players);
  }

  addPlayer(name) {
    /* First check whether player name exists */
    if (this._findPlayer(name) >= 0) {
      return FAIL;
    }

    this.players.push(new Player(name));
    this.#_savePlayers();

    return SUCCEED;
  }

  deletePlayer(name) {
    /* Find the player */
    let player_index = this._findPlayer(name);
    /* Do not allow deletion of a player with a score */
    if (this.players[player_index].highScore > 0) {
      return false;
    }
    this.players.splice(player_index, 1);
    this.#_savePlayers();
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

  updateResults(name, score, percentage) {
    /* Append result to player with name `name`*/
    let result = {date: Date.now(), score: score, note: percentage};
    let player_ix = this._findPlayer(name);
    this.players[player_ix].results.push(result);
    this.players.sort(playerSort);
  }

  getScoreArray(name) {
    /* Get historical scores for player `name` as an array for plotting. */
    let player_ix = this._findPlayer(name);
    let playerResults = this.players[player_ix].results;
    let resultCount = playerResults.length;
    let results = Array(resultCount);

    for (let i = 0; i < resultCount; i++) {
      results[i] = [playerResults[i].date, playerResults[i].score];
    }

    return results;
  }

  savePlayers() {
    /* Maybe used one day to save combinations after each answer. */
    savePlayers(this.players);
  }


}

class Quiz {

  constructor(name, sample_count, combinations) {
    /* Class for a quiz */
    this.sampleCount = this.counter = sample_count;
    this.combinations = combinations;
    this.name = name;

    this.score = 0;
    this.correctAnswers = 0;
    this.timeout = undefined;
    this.timer = new Timer();
    this.currentProblem = undefined;
  }

  get problem() {
    return this.currentProblem;
  }

  get currentScore() {
    return this.score;
  }

  get pctCompleted () {
    return 1.0 - this.counter / this.sampleCount;
  }

  start() {
    /* Start the timer and problem handler */
  }

  checkAnswer(answer) {
    /* Checks the answer and updates the score 
     * `CORRECT_POINTS` for correct answer plus percentage of `TIMEOUT` delay
     * not used times `CORRECT_POINTS`
     */
    // Take timestamp first, even if potentially unused.
    const speed = 1.0 - this.timer.elapsed / TIMEOUT;

    const isCorrect = (answer === this.currentProblem.solution);
    if (isCorrect) {
      this.correctAnswers++;
      this.score += CORRECT_POINTS;
      this.score += Math.round(CORRECT_POINTS * speed);
      this.removeCombination();
    } else {
      this.addCombination();
    }
    return isCorrect;
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

    this.cancelTimeout();

    if (this.counter === 0) {
      /* End of quiz */
      const pct = this.correctAnswers / this.sampleCount;
      this.handleGameOver(this.name, this.score, pct);
      return false;
    }

    /* Select the pair of numbers from this.combinations */
    const selected = getRandomIndex(this.combinations);
    const pair = this.combinations.at(selected);

    this.currentProblem = {
      pair: pair, 
      solution: pair[0] * pair[1],
      proposals: buildProposals(pair)
    }

    this.timeout = setTimeout(this.timeoutAction, TIMEOUT);

    this.timer.reset();
    this.counter--;

    return true;
  }

  addCombination() {
    /* Add problem to array of combinations (usually after missed answer) */
    const ix = getRandomIndex(this.combinations);
    this.combinations.splice(ix, 0, this.currentProblem.pair);
  }

  removeCombination() {
    /* Remove problem from array of combinations, if at least one remains */
    const currentPair = this.currentProblem.pair;

    function eq(pair) {
      return (pair[0] === currentPair[0] && pair[1] === currentPair[1]);
    }

    const first = this.combinations.findIndex(eq);
    const second = this.combinations.slice(first + 1).findIndex(eq);
    if (second > 0) {
      this.combinations.splice(first, 1);
    }
  }
}

class Timer {
  /* Implement a simple stopwatch of milliseconds */
  constructor () {
    this.reset();
  }

  reset() {
    this.start = Date.now();
  }

  get elapsed() {
    /* Elapsed time in milliseconds */
    var duration = Date.now() - this.start;
    return duration;
  }
}

function testPlayers() {
  /* A list of player data for testing */
  const players = [
    new Player('Florence', [{date: Date.now(), score: 756, note: 0.4}]),
    new Player('Rémi', [{date: Date.now(), score: 756, note: 0.45}]),
    new Player('Maman', [{date: Date.now(), score: 10389, note: 0.65}])
  ];

  return players;
}

function playerSort(a, b) {
  /* Sort players by highscore. Highest first.
   * Then by name. */
  if (a.highScore > b.highScore) { return -1; }
  if (a.highScore < b.highScore) { return 1; }
  if (a.highScore === b.highScore) {
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
        allCombinations.push([i, j], [j, i]); 
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

function getRandomIndex(arr) {
  const selected = Math.floor(arr.length * Math.random());
  return selected;
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

function storageToPlayer(storedPlayer) {
  /* Convert serialized version of player to instance of Player. */
  const player = new Player(storedPlayer.name, storedPlayer.results, 
    storedPlayer.combinations);

  return player;
}

function loadPlayers() {
  /* Get player data from storage and convert into Player instances. */
  const storedPlayers = getStorageItem(PLAYERS);
  const players = storedPlayers.map(storageToPlayer);
  return players;
}

function setStorageItem(name, item) {
  /* Save the object `item` to localStorage under the `name`. */
  const jsonItem = JSON.stringify(item);
  if (localStorage) {
    localStorage.setItem(name, jsonItem);
  }
}

function savePlayers(players) {
  /* Convert classes to enumerable items and save to storage. */
  const storagePlayers = players.map(player => player.serialize);
  setStorageItem(PLAYERS, storagePlayers);
}

export { 
  Players, 
  Quiz,
  /* Export for testing only */
  testPlayers,
  playerSort,

}
