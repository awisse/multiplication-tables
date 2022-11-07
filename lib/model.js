/* The Model Module
 * 1. Compute list of pairs of numbers
 * 2. Update list of numbers
 * 3. Compute proposals
 * 4. Load from localStorage
 * 5. Save to localStorage
 * */
/* global FileReader, Blob, localStorage */
import {
  TESTING, MAX_DELETE_SCORE, MAX_TABLE_INT, MAX_PROPOSALS,
  TIMEOUT, PLAYERS_CHANGED_EV, SUCCEED, FAIL, LANGUAGE, PLAYERS, BACKUP,
  CORRECT_POINTS
} from "./constants.js"
import { parsePlayerJSON } from "./parser.js"
import getRandomBetween from "./random.js"

class Player {
  /* A class that contains all information about a player */
  #name
  #results

  constructor (name, results = [], combinations = undefined) {
    /* `name` is the minimal parameter.
     * `results` and `combinations` can be known from stored results.
     */
    this.#name = name
    const result = { date: Date.now(), score: 0, note: 0.0 }
    this.#results = results.length > 0 ? results : [result]
    this.combinations = combinations || generateMultitables()
  }

  get name () {
    return this.#name
  }

  get results () {
    return this.#results
  }

  get hsData () {
    /* Return all parameters related to the high score: score, percentage
     * and index */
    function hscore (score, percentage, ix) {
      hscore.score = score
      hscore.note = percentage
      hscore.ix = ix
    }
    hscore(0, 0.0)
    function cmpHS (result, ix) {
      if (result.score > hscore.score) {
        hscore(result.score, result.note, ix)
      }
    }
    this.results.forEach(cmpHS)
    return hscore
  }

  get highScore () {
    /* Return highscore for the player, together with the index and
     * the percentage. */
    return this.hsData.score
  }

  get highScoreIX () {
    /* Return the first index where the highScore has been reached */
    return this.hsData.ix
  }

  get serialize () {
    /* Return serializable version of the Player class */
    return {
      name: this.name,
      results: this.results,
      combinations: this.combinations
    }
  }
}

class Players {
  #players

  constructor () {
    this.#loadPlayers(PLAYERS)
    this.handlers = []
  }

  get length () {
    return this.#players.length
  }

  get serialize () {
    /* Return a JSON version of `this.#players` */
    const storagePlayers = this.#players.map(player => player.serialize)
    const jsonPlayers = JSON.stringify(storagePlayers, null, 2)
    return jsonPlayers
  }

  get players () {
    /* Return a copy of the players */
    const players = Object.create(this.#players)
    return players
  }

  set players (players) {
    /* Make a backup of existing players in localStorage and
     * set new players */
    const backup = this.serialize
    setStorageItem(BACKUP, backup)
    this.#players = players
    this.handlers[PLAYERS_CHANGED_EV]()
  }

  #loadPlayers (key) {
    /* Retrieve names and high scores from localStorage */
    try {
      this.#players = loadPlayers(key)
    } catch (error) {
      /* This shouldn't happen as localStorage players is JSON
       * produced by `JSON.stringify()` */
      const msg = `model.#loadPlayers: ${error}`
      window.alert(msg)
      this.#players = []
    }

    if ((this.#players.length === 0) && TESTING) {
      this.#players = testPlayers()
      this.#players.sort(playerSort)
    }
  }

  addHandler (ev, callback) {
    this.handlers[ev] = callback
  }

  addPlayer (name) {
    /* First check whether player name exists */
    if (this.#playerIndex(name) >= 0) {
      return FAIL
    }

    this.#players.push(new Player(name))
    this.handlers[PLAYERS_CHANGED_EV]()

    return SUCCEED
  }

  deletePlayer (name) {
    const playerIndex = this.#playerIndex(name)
    if (playerIndex < 0) { return false } // Player doesn't exist
    /* Do not allow deletion of a player with a score > MAX_DELETE_SCORE */
    if (this.#players[playerIndex].highScore > MAX_DELETE_SCORE) {
      return false
    }
    this.#players.splice(playerIndex, 1)
    this.handlers[PLAYERS_CHANGED_EV]()
    return true
  }

  deleteAllPlayers () {
    /* Delete all players. Irreversible. */
    while (this.#players.pop());
    this.handlers[PLAYERS_CHANGED_EV]()
  }

  findPlayer (name) {
    const ix = this.#playerIndex(name)
    if (ix < 0) throw Error(`findPlayer(): "${name}" not found`)
    return this.#players[ix]
  }

  #playerIndex (name) {
    return this.#players.findIndex(p => (p.name === name))
  }

  getCombinations (name) {
    const player = this.findPlayer(name)
    return player.combinations
  }

  updateResults (name, score, percentage) {
    /* Append result to player with name `name` */
    const result = { date: Date.now(), score, note: percentage }
    this.findPlayer(name).results.push(result)
  }

  getScoreArray (name) {
    /* Get historical scores for player `name` as an array for plotting. */
    const playerResults = this.findPlayer(name).results
    const resultCount = playerResults.length
    const results = Array(resultCount)

    for (let i = 0; i < resultCount; i++) {
      results[i] = [playerResults[i].date, playerResults[i].score]
    }

    return results
  }

  savePlayers () {
    /* Maybe used one day to save combinations after each answer. */
    setStorageItem(PLAYERS, this.serialize)
  }

  savePlayersAs (anchor) {
    const playersBLOB = new Blob([this.serialize],
      { type: "application/json" })
    if (anchor.href) {
      URL.revokeObjectURL(anchor.href)
    }
    anchor.href = URL.createObjectURL(playersBLOB)
  }

  importPlayers (file, errorHandler) {
    const reader = new FileReader()
    function loadData (e) {
      const storedPlayers = reader.result
      try {
        this.players = parsePlayerJSON(storedPlayers, storageToPlayer)
      } catch (error) {
        /* An error happened during the loading of a players JSON */
        errorHandler(error)
      }
    }

    reader.addEventListener("load", loadData.bind(this))
    reader.readAsText(file)
  }
}

class Quiz {
  /* Class for managing the quiz questions and result counting */
  constructor (name, sampleCount, combinations) {
    this.sampleCount = this.counter = sampleCount
    this.combinations = combinations
    this.name = name

    this.score = 0
    this.correctAnswers = 0
    this.timeout = undefined
    this.timer = new Timer()
    this.currentProblem = undefined
  }

  get problem () {
    return this.currentProblem
  }

  get currentScore () {
    return this.score
  }

  get pctCompleted () {
    return 1.0 - this.counter / this.sampleCount
  }

  checkAnswer (answer) {
    /* Checks the answer and updates the score
     * `CORRECT_POINTS` for correct answer plus percentage of `TIMEOUT` delay
     * not used times `CORRECT_POINTS`
     */
    // Take timestamp first, even if potentially unused.
    const speed = 1.0 - this.timer.elapsed / TIMEOUT

    const isCorrect = (answer === this.currentProblem.solution)
    if (isCorrect) {
      this.correctAnswers++
      this.score += CORRECT_POINTS
      this.score += Math.round(CORRECT_POINTS * speed)
      this.removeCombination()
    } else {
      this.addCombination()
    }
    return isCorrect
  }

  bindTimeout (callback) {
    /* Function called after timeout */
    this.timeoutAction = callback
  }

  bindGameOver (callback) {
    /* Function called after the last question */
    this.handleGameOver = callback
  }

  cancelTimeout () {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
  }

  nextQuestion () {
    this.cancelTimeout()

    if (this.counter === 0) {
      // End of quiz
      const pct = this.correctAnswers / this.sampleCount
      this.handleGameOver(this.name, this.score, pct)
      return false
    }

    // Select the pair of numbers from this.combinations
    const selected = getRandomIndex(this.combinations)
    const pair = this.combinations.at(selected)

    this.currentProblem = {
      pair,
      solution: pair[0] * pair[1],
      proposals: buildProposals(pair)
    }

    this.timeout = setTimeout(this.timeoutAction, TIMEOUT)

    this.timer.reset()
    this.counter--

    return true
  }

  addCombination () {
    /* Add problem to array of combinations (usually after missed answer) */
    const ix = getRandomIndex(this.combinations)
    this.combinations.splice(ix, 0, this.currentProblem.pair)
  }

  removeCombination () {
    /* Remove problem from array of combinations, if at least one remains */
    const currentPair = this.currentProblem.pair

    function eq (pair) {
      return (pair[0] === currentPair[0] && pair[1] === currentPair[1])
    }

    // Find the index of the pair of numbers in the combinations
    const first = this.combinations.findIndex(eq)
    // Check whether there is another identical pair in the combinations
    const second = this.combinations.slice(first + 1).findIndex(eq)
    if (second >= 0) {
      this.combinations.splice(first, 1)
    }
  }
}

class Timer {
  /* Implement a simple stopwatch of milliseconds */
  constructor () {
    this.reset()
  }

  reset () {
    this.start = Date.now()
  }

  get elapsed () {
    /* Elapsed time in milliseconds */
    const duration = Date.now() - this.start
    return duration
  }
}

function testPlayers () {
  /* A list of player data for testing */
  const players = [
    new Player("Florence", [{ date: Date.now(), score: 756, note: 0.4 }]),
    new Player("Rémi", [{ date: Date.now(), score: 756, note: 0.45 }]),
    new Player("Maman", [{ date: Date.now(), score: 10389, note: 0.65 }])
  ]

  return players
}

function playerSort (a, b) {
  /* Sort players by highscore. Highest first.
   * Then by name. */
  if (a.highScore > b.highScore) { return -1 }
  if (a.highScore < b.highScore) { return 1 }

  if (a.highScore === b.highScore) {
    if (a.name < b.name) { return -1 }
    if (a.name > b.name) { return 1 }
    return 0
  }
}

function generateMultitables (repetitions = 3) {
  /* Generate a list with all combinations of multiplications starting
   * with multiples of 2. Each combination is repeated `repetition` times
   * in order to determine its probability of being selected.
   * If an answer is correct, one instance of the combination is removed.
   * If an answer is wrong, one instance of the combination is added. */

  const allCombinations = []
  for (let i = 2; i < MAX_TABLE_INT; i++) {
    for (let j = 2; j <= MAX_TABLE_INT; j++) {
      for (let k = 0; k < 3; k++) {
        allCombinations.push([i, j], [j, i])
      }
    }
  }
  return allCombinations
}

function shuffleArray (arr) {
  /* Source: https://www.w3docs.com/snippets/javascript/how-to-randomize-shuffle-a-javascript-array.html */
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
}

function getRandomIndex (arr) {
  const selected = Math.floor(arr.length * Math.random())
  return selected
}

function buildProposals (numbers) {
  /* Principles for proposals:
   * 1. They must be plausible (ex: 2*2 =? 102 ??, vs 6*7 =? 54 !!)
   * 2. Single digit results: Remain single digit.
   * 3. Double digit results: Remain double digit.
   * 4. Triple digit results: Remain triple digit.
   * 5. At most 2 * largest operand above or below.
   */
  const solution = numbers[0] * numbers[1]
  let minRand, maxRand
  const proposals = new Int16Array(MAX_PROPOSALS)

  proposals[0] = solution
  switch (Math.trunc(Math.log10(solution))) {
    case 0: // Single digits
      minRand = 2
      maxRand = 10
      break
    case 1: // Double digits
      minRand = Math.max(solution - 12, 6) // 2..5 not plausible
      maxRand = Math.min(solution + 12, 108) // 9 * 12
      break
    case 2: // Triple digits
      // 9 * 12 the only > 100 with one operand < 10
      minRand = Math.max(solution - 12, 100)
      maxRand = solution + 12
  }
  for (let i = 1; i < MAX_PROPOSALS; i++) {
    proposals[i] = getRandomBetween(minRand, maxRand, proposals)
  }
  shuffleArray(proposals) // Is this really necessary?
  return proposals
}

function loadPlayers (name) {
  /* Get player data from storage and convert into Player instances. */
  /* If localStorage is unavailable or doesn't contain player data,
   * start with empty list of players */
  const storedPlayers = getStorageItem(name) || "[]"
  const players = parsePlayerJSON(storedPlayers, storageToPlayer)
  return players
}

function storageToPlayer (storedPlayer) {
  /* Convert serialized version of player to instance of Player. */
  const player = new Player(storedPlayer.name, storedPlayer.results,
    storedPlayer.combinations)

  return player
}

function getStorageItem (name) {
  /* Get the item named `name` from localStorage */

  if (!localStorage) return ""
  const value = localStorage.getItem(name)
  return value
}

function setStorageItem (name, json) {
  /* Save the object `json` already in JSON format,
   * to localStorage under the `name`. */
  if (localStorage) {
    localStorage.setItem(name, json)
  }
}

function saveLanguage (lang) {
  setStorageItem(LANGUAGE, lang)
}

function loadLanguage () {
  const lang = getStorageItem(LANGUAGE)
  return lang
}

export {
  Players,
  Quiz,
  saveLanguage,
  loadLanguage
}
