/* The Controller Module
 * 1. Interprets input from the user.
 * 2. Dispatches orders to the *view*.
 * 3. Queries *model* for data.
 * */
'use strict';
import {FAIL, PLAY, DELETE, MAX_COMBINATIONS} from './constants.js';
import {ANSWER_DELAY} from './constants.js';
import {Quiz} from './model.js';
import locale from './locale/default.js';

class Controller {

  constructor(players, view) {
    this.players = players;
    this.view = view;

    // Add bindings to players
    this.players.bindPlayersChanged(this.onPlayersChanged);

    // Add bindings to objects in view
    this.view.bindAddPlayer(this.handleAddPlayer);
    this.view.bindPlayDeleteButtonPressed(this.handlePlayDeletePressed);
    this.view.bindDeleteAllPlayers(this.handleDeleteAllPlayers);
    this.view.bindHandleAnswer(this.handleAnswer);
    this.view.bindRestart(this.play);

  }

  start() {
    this.view.refreshNamesList(this.players.players);
  }

  onPlayersChanged = players => {
    this.view.refreshNamesList(players);
  }

  handleAddPlayer = name => {
    const result = this.players.addPlayer(name);
    if (result === FAIL) {
      this.view.showAlert(`Le nom "${name}" existe déjà!`);
    }
    else {
      this.players.addPlayer(name);
      this.start();
    }
  }

  handlePlayDeletePressed = (name, state) => {
    /* Either delete the player if Ctrl is pressed or
     * start quiz for the player */
    if (state === DELETE) {
      if (this.players.deletePlayer(name)) {
        this.view.showAlert(`"${name}" ${locale.deletedWord}.`);
      }
    }
    else {
      if (state !== PLAY) {
        throw `"state" must be "${PLAY}" or "${DELETE}"`;
      }
      this.play(name);
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

  handleDeleteAllPlayers = () => {
    this.view.showAlert("All players will be deleted");
    this.players.deleteAllPlayers();
  }

  handleFail = () => {
    /* Two cases: 
     * 1. Player took too long.
     * 2. Player chose wrong answer */
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
  }

  handleAnswer = event => {
    /* The user clicked on one of the multiple choice answers */
    const clicked = event.target;
    if (this.quiz.checkAnswer(parseInt(clicked.value, 10))) {
      this.view.displaySuccess(clicked);
      const timeout = setTimeout(this.newProblem, ANSWER_DELAY);
    } else {
      this.handleFail();
    }
    /* Uncomment to save new combinations after each answer. */
    // this.players.updateCombinations(this.quiz.name, this.quiz.combinations);
  }
}

export { Controller }
