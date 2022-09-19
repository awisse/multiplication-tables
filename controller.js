/* The Controller Module
 * 1. Interprets input from the user.
 * 2. Dispatches orders to the *view*.
 * 3. Queries *model* for data.
 * */
'use strict';
import {TESTING} from './constants.js';
import {FAIL, PLAY, DELETE, MAX_COMBINATIONS} from './constants.js';
import {ADD_PLAYER_EV, PLAY_DELETE_EV, DELETE_ALL_EV, ANSWER_EV, 
  RESTART_EV, SAVE_EV, KEY_DOWN_EV, KEY_UP_EV, LOAD_EV, 
  PLAYERS_CHANGED_EV, LOAD_ERROR_EV} from './constants.js';
import {ANSWER_DELAY} from './constants.js';
import {Quiz} from './model.js';
import locale from './locale/default.js';

class Controller {

  constructor(players, view) {
    this.players = players;
    this.view = view;

    // Add bindings to players
    this.players.addHandler(PLAYERS_CHANGED_EV, this.onPlayersChanged);
    this.players.addHandler(LOAD_ERROR_EV, this.handleLoadError);

    // Add bindings to events in view
    this.view.addHandler(ADD_PLAYER_EV, this.handleAddPlayer);
    this.view.addHandler(ANSWER_EV, this.handleAnswer);
    this.view.addHandler(KEY_DOWN_EV, this.handleKeyDown.bind(this));
    this.view.addHandler(KEY_UP_EV, this.handleKeyUp.bind(this));
    this.view.addHandler(LOAD_EV, this.loadPlayers);
    this.view.addHandler(PLAY_DELETE_EV, this.handlePlayDeletePressed);
    this.view.addHandler(RESTART_EV, this.play);
    this.view.addHandler(SAVE_EV, this.savePlayers);

    this.view.setupListeners();

  }

  start() {
    this.view.setupNamesPage();
    this.view.refreshNamesList(this.players.players);
  }

  onPlayersChanged = () => {
    this.players.savePlayers();
    this.view.refreshNamesList(this.players.players);
  }

  handleAddPlayer = name => {
    const result = this.players.addPlayer(name);
    if (result === FAIL) {
      this.view.showAlert(`Le nom "${name}" existe déjà!`);
    } else {
      this.players.addPlayer(name);
      this.start();
    }
  }

  handlePlayDeletePressed = (name, state) => {
    /* Either delete the player if Ctrl is pressed or
     * start quiz for the player */
    switch (state) {
      case PLAY:
        this.play(name);
        break;
      case DELETE: 
        if (this.players.deletePlayer(name)) {
          this.view.showAlert(`"${name}" ${locale.deletedWord}.`);
        } else {
          this.view.showAlert(`"${name}" ${locale.cantDelete}`);
        }
        break;
      default: 
        throw `"state" must be "${PLAY}" or "${DELETE}"`; 
    }
  }

  play = (name) => {
    /* Quiz start code here */
    const combinations =  this.players.getCombinations(name);
    this.quiz = new Quiz(name, MAX_COMBINATIONS, combinations);
    this.quiz.bindTimeout(this.handleFail.bind(this));
    this.quiz.bindGameOver(this.gameOver);
    this.view.play(name);
    this.newProblem();
  }

  deleteAllPlayers = () => {
    this.view.showAlert("All players will be deleted");
    this.players.deleteAllPlayers();
    this.onPlayersChanged();
  }

  handleFail = () => {
    /* Two cases: 
     * 1. Player took too long.
     * 2. Player chose wrong answer */
    this.view.disableProposalButtons(); // Prevent clicking after timeout
    this.view.displayFailedAnswerCorrectly(this.quiz.problem.solution);
    const timeout = setTimeout(this.newProblem, ANSWER_DELAY);
  }

  newProblem = () => {
    this.view.updateProgress(this.quiz.currentScore, this.quiz.pctCompleted);
    if (this.quiz.nextQuestion()) {
      this.view.displayProblem(this.quiz.problem);
    }
  }

  gameOver = (name, score, percentage) => {
    /* Display final score, save results and update player score */
    this.players.updateResults(name, score, percentage);
    this.players.savePlayers();
    this.view.showGameOverPage(name, score, percentage,
                               this.players.getScoreArray(name));
    /* Display a star at first high score if more than 1 score */
    let player = this.players.findPlayer(name);
    if (player.results.length > 1) {
      let ix = player.highScoreIX;
      this.view.showStarAt(ix);
    }
  }

  handleAnswer = event => {
    /* The user clicked on one of the multiple choice answers */
    const clicked = event.target;
    this.view.disableProposalButtons(); // Prevent clicking multiple times
    if (this.quiz.checkAnswer(parseInt(clicked.value, 10))) {
      this.view.displaySuccess(clicked);
      const timeout = setTimeout(this.newProblem, ANSWER_DELAY);
    } else {
      this.handleFail();
    }
    /* Uncomment to save new combinations after each answer. */
    // this.players.updateCombinations(this.quiz.name, this.quiz.combinations);
  }

  savePlayers = anchor => {
    /* Save all player data through anchor to a file */
    this.players.savePlayersAs(anchor);
  }

  loadPlayers = files => {
    /* Load player data from a file replacing current player data */
    let file = files[0];
    try {
      this.players.importPlayers(file);
    } catch (error) {
      this.handleLoadError(msg);
    }
  }

  handleLoadError = msg => {
    /* An error happened during the loading of a players JSON */
    message = `${locale.error_while_charging} : {msg}`;
    this.view.showAlert(message);
  }

  handleKeyUp(event) {
    /* "Play" button shows "Play". */
    if (event.code === "AltLeft") {
      this.view.togglePlayDelete(PLAY);
    }
  }

  handleKeyDown(event) {
    /* "Play" button shows "Delete".
     * Click starts quiz for chosen player. */

    /* Delete all players, for testing purposes only */
    if (TESTING && event.ctrlKey && (event.key === "d")) {
      deleteAllPlayers();
      return;
    }
    if (event.altKey && (event.key === "Shift")) {
      this.view.togglePlayDelete(DELETE);
      return;
    }
    if (event.ctrlKey && event.metaKey && (event.key === "s")) {
      this.view.toggleHideShowAnchorLoad();
    }
  }
}


export {Controller} 
