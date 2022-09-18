/* The View Module
 * 1. Displaying data and controls to the user
 * 2. Playing sounds 
 */
'use strict';
import locale from './locale/default.js';
import {ADD_PLAYER_EV, PLAY_DELETE_EV, ANSWER_EV, RESTART_EV,
  SAVE_EV, KEY_DOWN_EV, KEY_UP_EV, LOAD_EV} from './constants.js';
import {PLAY, DELETE, TESTING} from './constants.js';
import {NAMES_PAGE, QUIZ_PAGE, RESULT_PAGE} from './constants.js';
import {PLOT_WIDTH, PLOT_HEIGHT} from './constants.js';
import {PLAYERS_JSON} from './constants.js';
import {sounds} from './resources.js';
import {Plot2d} from './graph.js';

const HIDDEN = 0;
const SAVE = 1;
const LOAD = 2;

class View {

  constructor(title) {

    this.page = getElement('div.page');
    this.title = getElement('#mainTitle');
    this.main = getElement('#gameboard');
    this.footer = getElement('#footer');

    /* Description header of game pages */
    this.pageHeader = createElement('h1', 'page-title');
    this.pageHeader.id = 'page-header';

    this.handlers = {};

    this._addSaveButton();
    this._addLoadButton();

    this.saveLoadState = HIDDEN;
    this.gameState = undefined;

  }

  addHandler(name, handler) {
    this.handlers[name] = handler;
  }

  setupListeners() {
    // Toggle between "Play" and "Delete" for the button
    document.addEventListener('keydown', this.handlers[KEY_DOWN_EV]);
    document.addEventListener('keyup', this.handlers[KEY_UP_EV]);
    
    function saveClicked(event) {
      this.handlers[SAVE_EV](this.saveButton);
    }

    this.saveButton.addEventListener('mousedown', pressed);
    this.saveButton.addEventListener('mouseup', notPressed);
    this.saveButton.addEventListener('mouseleave', notPressed);
    this.saveButton.addEventListener('click', saveClicked.bind(this));

    function loadEvent(event) {
      this.handlers[LOAD_EV](this.loadInput.files)
    }

    this.loadLabel.addEventListener('mousedown', pressed);
    this.loadLabel.addEventListener('mouseup', notPressed);
    this.loadLabel.addEventListener('mouseleave', notPressed);
    this.loadInput.addEventListener('change', loadEvent.bind(this));

  }

  _addSaveButton () {

    // Add Save Players button
    this.saveButton = createElement('a', 'save-load');
    this.saveButton.download = PLAYERS_JSON;
    this.saveButton.innerText = locale.savePlayers;
    this.saveButton.id = 'save-button';
    hide(this.saveButton);

    this.page.append(this.saveButton);

  }

  _addLoadButton() {

    // Add Load Button: An input element
    // The Container
    this.loadButton = document.createElement('div', 'save-load');
    this.loadButton.id = 'load-button';
    // The Label
    this.loadLabel = createElement('label', 'save-load');
    this.loadLabel.innerText = locale.loadPlayers
    this.loadLabel.id = 'load-label';
    this.loadLabel.htmlFor = 'load-input';
    // The Input
    this.loadInput = document.createElement('input')
    this.loadInput.type = 'file';
    this.loadInput.id = 'load-input';
    this.loadInput.name = 'load-input';
    this.loadInput.accept = 'text/.json';
    hide(this.loadButton);

    this.loadButton.append(this.loadInput, this.loadLabel);

    this.page.append(this.loadButton);
  }

  toggleHideShowAnchorLoad() {

    /* Do nothing on pages other than the NAMES_PAGE */
    if (this.gameState !== NAMES_PAGE) return;

    this.saveLoadState = (this.saveLoadState + 1) % 3;
    unhide(this.saveButton);
    unhide(this.loadButton);
    switch (this.saveLoadState) {
      case HIDDEN:
        hide(this.saveButton);
      case SAVE:
        hide(this.loadButton);
        break;
      case LOAD:
        hide(this.saveButton);
        break;
      default:
        throw 'Must be "HIDDEN", "SAVE" or "LOAD"';
    }
  }

  setupNamesPage() {
    //
    // No footer on start page
    hide(this.footer);

    /* Game title on top */
    this.setTitle(locale.pageTitle);

    /* Clean up page */
    this._emptyMainSection();

    /* Create start page objects ------------------------------*/
    // Title of names page
    this.pageHeader.textContent = locale.usersAndScores;
    this.main.append(this.pageHeader); 

    // Create input box for new name with submit button
    // The Form
    this.nameForm = createElement('form');
    this.nameForm.id = 'name-form';
    // The Edit Box
    this.nameInput = createElement('input');
    this.nameInput.type = 'text';
    this.nameInput.placeholder = locale.whatsYourName;
    this.nameInput.name = 'usernameInput';
    this.nameInput.maxlength = 20;
    this.nameInput.minlength = 1;
    // The Button
    this.submitNameButton = createElement('button');
    this.submitNameButton.textContent = locale.addUser; 
    this.submitNameButton.name = 'usernameSubmit';

    this.nameForm.append(this.nameInput, this.submitNameButton);

    // Separate function definition for readability
    let handleSubmit = (event) => {
      event.preventDefault();
      if (this.nameInput.value) {
        this.handlers[ADD_PLAYER_EV](this.nameInput.value);
        this._resetNameInput();
      }
    }
    this.nameForm.addEventListener('submit', handleSubmit);

    // Create list for existing names
    this.nameList = createElement('ul', 'names');
    this.nameList.id = 'name-list';

    // Put the page together
    this.main.append(this.nameForm, this.nameList)

    this.gameState = NAMES_PAGE;

  }

  _setupQuizPage(name) {

    /* Game title on top */
    this.setTitle(locale.pageTitle);

    // Empty main page
    this._emptyMainSection();
    hide(this.saveButton);
    hide(this.loadButton);

    // Define Section that displays the question
    this.quizProblemDisplay = createElement('div', 'quiz-question');

    // The question 
    this.pageHeader.textContent = `${name}, ${locale.howMuchIs}`;
    this.pageHeader.append(this.quizProblemDisplay, "?");
    this.main.append(this.pageHeader);

    // Define the section that shows the proposals
    this.proposalSection = createElement('div', 'choices');
    this.main.append(this.proposalSection);

    // Empty footer
    for (const element of Array.from(this.footer.children)) {
      this.footer.removeChild(element);
    }

    // Progressbar with its label
    const progressBox = createElement('div', 'scorebox');
    // Label
    const progressLabel = createElement('label');
    progressLabel.htmlFor = 'progress-bar';
    progressLabel.textContent = locale.progressLabel;
    // Bar 
    this.progress = createElement('progress', 'progressbar');
    this.progress.id = 'progress-bar';
    this.progress.max = "1";
    this.progress.value = "0";

    progressBox.append(progressLabel, this.progress);

    // Score with its label
    const scoreBox = createElement('div', 'scorebox');
    const scoreLabel = createElement('label');
    scoreLabel.textContent = locale.userScore;
    this.scoreValue = createElement('span', 'quizscore');
    this.scoreValue.textContent = "0";
    scoreBox.append(scoreLabel, this.scoreValue);

    this.footer.append(progressBox, scoreBox);
    
    // Show footer, progressbar and score
    unhide(this.footer);

    this.gameState = QUIZ_PAGE;
  }

  showGameOverPage(name, score, percentage, results) {
    /* Display the elements of the page "Game Over", displayed after the last
     * quiz question has expired or been answered. */
    // Empty the page.
    this._emptyMainSection();
    hide(this.footer);

    this.setTitle(`${name}, ${locale.gameOverHeader}`);

    const resultsBlock = createElement('ul', 'results');

    function addRow(label, value) {
      const row = createElement('li', 'result');
      const desc = createElement('label');
      const number = createElement('span', 'end-result');
      row.append(desc, number);
      desc.textContent = label;
      number.textContent = value;
      resultsBlock.append(row);
    }

    addRow(locale.userScore, `${score}`)
    const pct = Math.round(percentage * 100.0);
    addRow(locale.userPercentage, `${pct}`)

    const restartButton = createElement('button', 'restart');
    restartButton.textContent = locale.restartButton;

    this.main.append(resultsBlock, restartButton);

    /* The canvas for the history graph (in points) */
    this.plot = new Plot2d(results, "history-graph", PLOT_WIDTH, PLOT_HEIGHT);
    this.main.append(this.plot.canvas);
    this.plot.title = locale.plotCaption + name;
    this.plot.plot();


    function restart(event) {
      this.handlers[RESTART_EV](name);
    }

    restartButton.addEventListener('click', restart.bind(this));

    this.gameState = RESULT_PAGE;
  }

  showStarAt(ix) {
    this.plot.drawStarAt(ix);
  }

  _resetNameInput() {
    this.nameInput.value = ""
  }

  _emptyMainSection() {
    /* Remove all elements from the main section. */
    for (const element of Array.from(this.main.children)) {
        this.main.removeChild(element)
    } 
  }

  setTitle(title) {
    this.title.textContent = title;
  }

  refreshNamesList(names) {
    /* `names` is an instance of `Players.players` in the module 'model.js'.
     * Create a list of `names` to choose from or enter a new name.
     * Show highscores. */

    // Create the list of names to display
    // Empty the list first
    while (this.nameList.firstChild) { 
      this.nameList.removeChild(this.nameList.firstChild)
    }

    if (names.length === 0) {
      const p = createElement('p');
      p.textContent = locale.noticeNoPlayer;
      this.nameList.append(p);
    }
    else {
      names.forEach(player => {
        const li = createElement('li', 'names');

        const label = createElement('label');
        label.textContent = player.name;

        const score = createElement('span', 'userscore');
        score.textContent = player.highScore;

        const playButton = createElement('button', 'play');
        playButton.textContent = locale.playButtonText;
        playButton.type = 'button'
        playButton.name = player.name;

        let handler = (event) => { 
          event.preventDefault();
          this.handlers[PLAY_DELETE_EV](event.target.name, this.playOrDelete); 
        }
        playButton.addEventListener('click', handler)

        li.append(label, score, playButton);
        this.nameList.append(li);
      });
    }
    /* After refreshing the list, the state is PLAY */
    this.playOrDelete = PLAY;
  }

  displayProblem(problem) {
    /* Display the problem to the user with answer interface */
    const [x, y] = problem.pair;
    this.quizProblemDisplay.textContent = `${x} x ${y}`;

    /* Empty proposal section */
    for (const element of Array.from(this.proposalSection.children)) {
      this.proposalSection.removeChild(element);
    }

    for (const proposal of problem.proposals) {
      const choice = createElement("button", "choice");
      choice.textContent = `${proposal}`;
      choice.value = proposal;
      choice.addEventListener('click', this.handlers[ANSWER_EV]);
      this.proposalSection.append(choice);
    }

  }
  
  disableProposalButtons() {
    for (const button of Array.from(this.proposalSection.children)) {
      button.disabled = true;
    } 
  }

  displaySuccess(button) {
    /* Show display of correct answer: Increase size of button. */
    sounds.pass.play();
    button.classList.add("is-clicked", "is-correct");
  }

  displayFailedAnswerCorrectly(correctAnswer) {
    /* Highlight correct answer after wrong answer given by player */
    sounds.fail.play();
    for (const button of Array.from(this.proposalSection.children)) {
      if (parseInt(button.value, 10) === correctAnswer) {
        button.classList.add("is-correct");
      } else {
        button.classList.add("is-wrong");
      }
    }
  }
    
  updateProgress(score, percent) {
    /* Update the progressbar and the score values */
    this.progress.value = percent;
    this.scoreValue.textContent = `${score}`;
  }

  play(name) {
    /* Setup play page */
    this._setupQuizPage(name);
  }

  togglePlayDelete(state) {
    /* Depending on `state`, change text of "Play" buttons in the 
     * nameList. */
    let playButtonText; 

    /* Check whether nameList is displayed */
    if (!document.getElementById('name-list')) {
      return; 
    }

    switch (state) {
      case PLAY:
        playButtonText = locale.playButtonText;
        break;
      case DELETE: 
        playButtonText = locale.deleteButtonText;
        break;
      default:
        throw `Parameter "${state}" not in ("${PLAY}", "${DELETE}")`
    }
    // TODO: Only show `DELETE` option for players that can actually be deleted
    for (const player of this.nameList.children) {
      player.lastElementChild.textContent = playButtonText;
    }

    this.playOrDelete = state;
  }

  showAlert(message) {
    /* TODO: More sophisticated dialogs in the future */
    showDialog(message);
  }
}

function getElement(selector) {
  let element = document.querySelector(selector);
  return element;
}

function createElement(tag, className) {
  /* Crete a new HTML element on the page */
  let element = document.createElement(tag);
  if (className) element.classList.add(className);

  return element;
}


function showDialog(message) {
  let dialog = createElement('dialog');
  dialog.innerText = message;
  let form = createElement('form', 'dialog-form');
  form.method = "dialog";
  let button = createElement('button', 'dialog-button');
  button.innerText = "OK";
  form.append(button);
  dialog.append(form);
  document.getElementById("gameboard").append(dialog);
  dialog.showModal();
}

function hide(element) {
  element.classList.add('hidden');
}

function unhide(element) {
  element.classList.remove('hidden')
}

function pressed(event) {
  event.target.classList.add('pressed');
}

function notPressed(event) {
  event.target.classList.remove('pressed');
}

export { View }
