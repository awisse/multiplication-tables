/* The View Module
 * 1. Displaying data and controls to the user
 * 2. Playing sounds 
 */
'use strict';
import locale from './locale/default.js';
import {ADD_PLAYER_EV, PLAY_DELETE_EV, DELETE_ALL_EV, ANSWER_EV, RESTART_EV} 
  from './constants.js';
import {PLAY, DELETE, TESTING} from './constants.js';
import {PLOT_WIDTH, PLOT_HEIGHT} from './constants.js';
import {sounds} from './resources.js';
import {Plot2d} from './graph.js';

class View {

  constructor(title) {

    this.title = getElement('#mainTitle');
    this.main = getElement('#gameboard');
    this.footer = getElement('#footer');

    /* Description header of game pages */
    this.pageHeader = createElement('h1', 'page-title');
    this.pageHeader.id = 'page-header';

    this.handlers = {};
    this._setupNamesPage();

  }

  addHandler(name, handler) {
    this.handlers[name] = handler;
  }

  _setupNamesPage() {
    //
    // No footer on start page
    this.hideFooter();

    /* Game title on top */
    this.setTitle(locale.pageTitle);

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

    // Toggle between "Play" and "Delete" for the button
    document.addEventListener('keydown', handleMainKeyDown.bind(this));
    document.addEventListener('keyup', handleMainKeyUp.bind(this));

    // Put the page together
    this.main.append(this.nameForm, this.nameList)

    /* End start page */

  }

  _setupQuizPage(name) {

    /* Game title on top */
    this.setTitle(locale.pageTitle);

    // Empty main page
    this._emptyMainSection();

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
    this.showFooter();
  }

  showGameOverPage(name, score, percentage, results) {
    /* Display the elements of the page "Game Over", displayed after the last
     * quiz question has expired or been answered. */
    // Empty the page.
    this._emptyMainSection();
    this.hideFooter();

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
      this.handler[RESTART_EV](name);
    }

    restartButton.addEventListener('click', restart.bind(this));
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

  hideFooter() {
    this.footer.classList.add('hidden');
  }

  showFooter() {
    this.footer.classList.remove('hidden');
  }

  refreshNamesList(names) {
    /* reate a listbox with `names` to choose from or enter a new name.
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

  displaySuccess(button) {
    /* Show display of correct answer: Increase size of button. */
    sounds.pass.play();
    button.disabled = true;
    button.classList.add("is-clicked", "is-correct");
  }

  displayFailedAnswerCorrectly(correctAnswer) {
    /* Highlight correct answer after wrong answer given by player */
    sounds.fail.play();
    for (const button of Array.from(this.proposalSection.children)) {
      button.disabled = true;
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

  showAlert(message) {
    /* TODO: More sophisticated dialogs in the future */
    window.alert(message);
  }
}

function getElement(selector) {
  let element = document.querySelector(selector);
  return element;
}

function createElement(tag, className) {
  /* Crete a new HTML element on the page */
  let element = document.createElement(tag)
  if (className) element.classList.add(className)

  return element
}

function handleMainKeyUp(event) {
  /* "Play" button shows "Play".
   * Click deletes player. */
  if (event.code === "AltLeft") {
    togglePlayDelete.bind(this)(PLAY);
  }
}

function handleMainKeyDown(event) {
  /* "Play" button shows "Delete".
   * Click starts quiz for chosen player. */

  /* Delete all players, for testing purposes only */
  if (TESTING && event.ctrlKey && (event.key === "d")) {
    this.handlers[DELETE_ALL_EV]();
  }
  if (event.shiftKey && (event.code === "AltLeft")) {
    togglePlayDelete.bind(this)(DELETE);
  }
  if (event.metaKey && (event.key === "s")) {
    // Save players to file
    event.stopPropagation();
    this.handlers[SAVE_EV]();
  }
  if (event.metaKey && (event.key === "l")) {
    // Load players from file
    this.handlers[LOAD_EV]();
  }
}

function togglePlayDelete(state) {
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

export { View }
