/* The Controller Module
 * 1. Interprets input from the user.
 * 2. Dispatches orders to the *view*.
 * 3. Queries *model* for data.
 * */
import {
  TESTING, FAIL, PLAY, DELETE, MAX_COMBINATIONS, ADD_PLAYER_EV,
  PLAY_DELETE_EV, ANSWER_EV, RESTART_EV, SAVE_EV,
  KEY_DOWN_EV, KEY_UP_EV, LOAD_EV, PLAYERS_CHANGED_EV, ANSWER_DELAY,
  MIN_STAR_PCT, NAMES_PAGE
} from "./constants.js"
import { Quiz } from "./model.js"
import locale from "../locale/default.js"

class Controller {
  constructor (players, view) {
    this.players = players
    this.view = view

    // Add bindings to events in players
    this.players.addHandler(PLAYERS_CHANGED_EV,
      this.#onPlayersChanged.bind(this))

    // Add bindings to events in view
    this.view.addHandler(ADD_PLAYER_EV, this.#handleAddPlayer.bind(this))
    this.view.addHandler(ANSWER_EV, this.#handleAnswer.bind(this))
    this.view.addHandler(KEY_DOWN_EV, this.#handleKeyDown.bind(this))
    this.view.addHandler(KEY_UP_EV, this.#handleKeyUp.bind(this))
    this.view.addHandler(LOAD_EV, this.#importPlayers.bind(this))
    this.view.addHandler(SAVE_EV, this.#savePlayers.bind(this))
    this.view.addHandler(PLAY_DELETE_EV,
      this.#handlePlayDeletePressed.bind(this))
    this.view.addHandler(RESTART_EV, this.#play.bind(this))

    this.view.setupListeners()
  }

  start () {
    /* Launch the start page. The game starts here. */
    this.view.showNamesPage()
    this.view.refreshNamesList(this.players.players)
  }

  #onPlayersChanged () {
    /* Player has been added or deleted, players have been imported */
    this.players.savePlayers()
    this.view.refreshNamesList(this.players.players)
  }

  #handleAddPlayer (name) {
    /* User entered a new name and clicked on "ADD" or the Enter button */
    const result = this.players.addPlayer(name)
    if (result === FAIL) {
      this.view.showDialog("warning", `${locale.nameExists} : "${name}"`)
    } else {
      this.players.addPlayer(name)
      this.start()
    }
  }

  #handleAnswer (event) {
    /* The user clicked on one of the multiple choice answers */
    const clicked = event.target
    this.view.disableProposalButtons() // Prevent clicking multiple times
    if (this.quiz.checkAnswer(parseInt(clicked.value, 10))) {
      this.view.displaySuccess(clicked)
      setTimeout(this.#newProblem.bind(this), ANSWER_DELAY)
    } else {
      this.#handleFail()
    }
    /* Uncomment to save new combinations after each answer. */
    // this.players.updateCombinations(this.quiz.name, this.quiz.combinations)
  }

  #handleKeyDown (event) {
    /* Delete all players, for testing purposes */
    if (TESTING && event.ctrlKey && (event.key === "d") &&
      this.view.currentPage === NAMES_PAGE) {
      this.#deleteAllPlayers()
      return
    }

    /* Go to the results page with a fake result. For testing the
     * results page */
    if (TESTING && event.ctrlKey && event.metaKey && (event.key === "g")) {
      const player = this.players.players.at(-1)
      const name = player.name
      const result = player.results.at(-1)
      const score = result.score + 1
      const percentage = result.note + 0.01
      this.#gameOver(name, score, percentage)
    }

    /* Change Play buttons to Delete buttons on the names page */
    if (event.altKey && (event.key === "Shift")) {
      this.view.togglePlayDelete(DELETE)
      return
    }

    /* Circle through the Import/Save/<No button> buttons on the names page */
    if (event.ctrlKey && event.metaKey && (event.key === "s") &&
      this.view.currentPage === NAMES_PAGE) {
      this.view.toggleHideShowAnchorLoad()
    }
  }

  #handleKeyUp (event) {
    /* "Play" button shows "Play". */
    if (event.code === "AltLeft") {
      this.view.togglePlayDelete(PLAY)
    }
  }

  #importPlayers (files) {
    /* Import player data from a file replacing current player data */
    const file = files[0]
    this.players.importPlayers(file, this.#handleImportError.bind(this))
  }

  #handleImportError (error) {
    /* The import file has problems */
    const errorMsg = error.cause || error.message
    const message = `${locale.error_during_import} : ${errorMsg}`
    this.view.showDialog("warning", message)
  }

  #savePlayers (anchor) {
    /* Save all player data through `anchor` to a JSON file */
    this.players.savePlayersAs(anchor)
  }

  #handlePlayDeletePressed (name, state) {
    /* Either delete the player if <Alt>-<Shift> is pressed or
     * start quiz for the player */
    switch (state) {
      case PLAY:
        this.#play(name)
        break
      case DELETE:
        if (this.players.deletePlayer(name)) {
          this.view.showDialog("warning", `"${name}" ${locale.deletedWord}.`)
        } else {
          this.view.showDialog("warning", `"${name}" ${locale.cantDelete}`)
        }
        break
      default:
        throw Error(`"state" must be "${PLAY}" or "${DELETE}"`)
    }
  }

  #play (name) {
    /* Get the combinations for the player, prepare the Quiz page
     * and launch the Quiz. */
    const combinations = this.players.getCombinations(name)
    this.quiz = new Quiz(name, MAX_COMBINATIONS, combinations)
    this.quiz.bindTimeout(this.#handleFail.bind(this))
    this.quiz.bindGameOver(this.#gameOver.bind(this))
    this.view.play(name)
    this.#newProblem()
  }

  #deleteAllPlayers () {
    /* Delete all players if the user confirms his intention to do so */
    if (this.players.length === 0) return // No player to delete
    function deleteAll (answer) {
      if (answer === "Yes") {
        this.players.deleteAllPlayers()
        this.#onPlayersChanged()
        this.view.showDialog("warning", "All players have been deleted")
      }
    }
    this.view.showDialog("confirm",
      "Are you sure you want to delete all players?", deleteAll.bind(this))
  }

  #handleFail () {
    /* Two cases:
     * 1. Player took too long.
     * 2. Player chose wrong answer */
    this.view.disableProposalButtons() // Prevent clicking after timeout
    this.view.highlightCorrectAnswer(this.quiz.problem.solution)
    // Wait for a moment before displaying the next problem
    setTimeout(this.#newProblem.bind(this), ANSWER_DELAY)
  }

  #newProblem () {
    /* Update the progress bar and display the next problem */
    this.view.updateProgress(this.quiz.currentScore, this.quiz.pctCompleted)
    if (this.quiz.nextQuestion()) {
      this.view.displayProblem(this.quiz.problem)
    }
  }

  #gameOver (name, score, percentage) {
    /* Display final score, save results and update player score */
    // Get information about the scores of the player `name`
    const player = this.players.findPlayer(name)
    const prevHS = player.hsData

    // Update the list of the player scores and save the results and
    // combinations.
    this.players.updateResults(name, score, percentage)
    this.players.savePlayers()

    // Display the results and the historical plot of the player's scores
    const scores = this.players.getScoreArray(name)
    this.view.showGameOverPage(name, score, percentage, scores)

    /* Display a star at score if first result.
     * Don't display a star if percentage < `MIN_STAR_PCT` (60%).
     * If more than 1 score, display a star at previous high score. */
    const currentHS = player.hsData
    if (prevHS.note >= MIN_STAR_PCT) {
      this.view.showStarAt(prevHS.ix)
    } else if (currentHS.note >= MIN_STAR_PCT) {
      this.view.showStarAt(currentHS.ix)
    }

    /* Display and animate 100% if the player has answered all questions
     * correctly. */
    if (percentage === 1.0) this.view.show100pct()

    /* If new high score, move star to new high score if
     * 1. A star was displayed before (at least one result with pct >
     *    `MIN_STAR_PCT`).
     * 2. The percentage of the current high score is >= `MIN_STAR_PCT`
     * 3. The current high score is the new high score
     */
    if (prevHS.note >= MIN_STAR_PCT && currentHS.note >= MIN_STAR_PCT &&
      currentHS.score > prevHS.score) {
      this.view.moveStarTo(currentHS.ix, percentage === 1.0)
    }
  }
}

export { Controller }
