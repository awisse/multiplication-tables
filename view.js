/* The View Module
 * 1. Displaying data and controls to the user
 * 2. Playing sounds 
 */
'use strict';
import locale from './locale/default.js';
import {PLAY, DELETE, TESTING} from './constants.js';
import {sounds} from './resources.js';

class View {

  constructor(title) {

    this.title = getElement('#mainTitle');
    this.main = getElement('#gameboard');
    this.footer = getElement('#footer');

    /* Game title on top */
    this.setTitle(locale.pageTitle);

    /* Description header of game pages */
    this.pageHeader = createElement('h1', 'page-title');
    this.pageHeader.id = 'page-header';

    this._setupNamesPage();

  }

  _setupNamesPage() {
    //
    // No footer on start page
    this.hideFooter();

    this._emptyMainSection();

    /* Create start page objects ------------------------------*/
    // Title of names page
    this.pageHeader.textContent = locale.usersAndScores;

    // Create input box for new name with submit button
    // The Form
    this.nameForm = createElement('form');
    this.nameForm.id = 'name-form';
    // The Edit Box
    this.nameInput = createElement('input');
    this.nameInput.placeholder = locale.whatsYourName;
    this.nameInput.name = 'usernameInput';
    this.nameInput.maxlength = 20;
    this.nameInput.minlength = 1;
    // The Button
    this.submitNameButton = createElement('button', 'submit-user');
    this.submitNameButton.textContent = locale.addUser; 
    this.submitNameButton.name = 'usernameSubmit';

    this.nameForm.append(this.nameInput, this.submitNameButton);

    // Create list for existing names
    this.nameList = createElement('ul', 'names');
    this.nameList.id = 'name-list';

    // Toggle between "Play" and "Delete" for the button
    document.addEventListener('keydown', handleMainKeyDown.bind(this));
    document.addEventListener('keyup', handleMainKeyUp.bind(this));

    // Put the page together
    this.main.append(this.pageHeader, this.nameForm, this.nameList)

    /* End start page */

  }

  _setupQuizPage(name) {

    // Empty main page
    this._emptyMainSection();

    // Define Section that displays the question
    this.quizProblemDisplay = createElement('div', 'quiz-question');

    // The question 
    this.pageHeader.textContent = `${name}, ${locale.howMuchIs}`;
    this.pageHeader.append(this.quizProblemDisplay, "?");

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
    const scoreLabel = createElement('span');
    scoreLabel.textContent = locale.userScore;
    this.scoreValue = createElement('span', 'quizscore');
    this.scoreValue.textContent = "0";
    scoreBox.append(scoreLabel, this.scoreValue);

    this.footer.append(progressBox, scoreBox);
    
    // Show footer, progressbar and score
    this.showFooter();
  }

  showGameOverPage(name, score, percentage) {
    /* Display the elements of the page "Game Over", displayed after the last
     * quiz question has expired or been answered. */
    // Empty the page.
    this._emptyMainSection();
    this.hideFooter();

    this.pageHeader.textContent = `${name}, ${locale.gameOverHeader}`;

    const resultsBlock = createElement('ul', 'names');
    const scoreBlock = createElement('li', 'names');
    const pctBlock = createElement('li', 'names');
    resultsBlock.append(scoreBlock, pctBlock);

    function addRow(label, value) {
      const row = createElement('li', 'names');
      const desc = createElement('label');
      const number = createElement('span', 'userscore');
      row.append(desc, number);
      desc.textContent = label;
      number.textContent = value;
      resultsBlock.append(row);
    }

    addRow(locale.userScore, `${score}`)
    const pct = Math.round(percentage * 100.0);
    addRow(locale.userPercentage, `${pct}`)

    const restartButton = createElement('button');
    restartButton.textContent = locale.restartButton;

    this.main.append(resultsBlock, restartButton);

    function restart(event) {
      this.handleRestart(name);
    }

    restartButton.addEventListener('click', restart.bind(this));
  }

  _resetNameInput() {
    this.nameInput.value = ""
  }

  _emptyMainSection() {
    for (const element of Array.from(this.main.children)) {
      // Always keep header.
      if (element.id !== 'page-header') {
        this.main.removeChild(element)
      } 
    } 
  }

  bindAddPlayer(handler) {
    this.nameForm.addEventListener('submit', event => {
      event.preventDefault();

      if (this.nameInput.value) {
        handler(this.nameInput.value);
        this._resetNameInput();
      }
    }); 
  }

  bindPlayDeleteButtonPressed(handler) {
    function playDeleteHandler(event) { 
      event.preventDefault();
      handler(event.target.parentNode.id, this.playOrDelete);
    }

    this.nameList.addEventListener('click', playDeleteHandler.bind(this));
  }

  bindDeleteAllPlayers(handler) {
    this.deleteAllPlayers = handler;
  }

  bindHandleAnswer(handler) {
    this.handleAnswer = handler;
  }

  bindRestart(handler) {
    this.handleRestart = handler;
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
    /* Show the start page.
     * Create a listbox with `names` to choose from or enter a new name.
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
        li.id = player.name;

        const label = createElement('label');
        label.textContent = player.name;
        label.htmlFor = player.name + "_id";

        const score = createElement('span', 'userscore');
        score.textContent = player.highScore;

        const playButton = createElement('button', 'play');
        playButton.textContent = locale.playButtonText;
        playButton.id = player.name + "_id";

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
      choice.addEventListener('click', this.handleAnswer);
      this.proposalSection.append(choice);
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

  showAlert(message) {
    /* TODO: More sophisticated dialogs in the future */
    window.alert(message);
  }


}

function getElement(selector) {
  const element = document.querySelector(selector);

  return element;
}

function createElement(tag, className) {
  /* Crete a new HTML element on the page */
  const element = document.createElement(tag)
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
  if (TESTING && event.ctrlKey && (event.key == "d")) {
    this.deleteAllPlayers();
  }
  if (event.shiftKey && (event.code === "AltLeft")) {
    togglePlayDelete.bind(this)(DELETE);
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

  if (state === PLAY) {
    playButtonText = locale.playButtonText;
  }
  else {
    if (state === DELETE) {
      playButtonText = locale.deleteButtonText;
    } 
    else {
      throw `Parameter "${state}" not in ("${PLAY}", "${DELETE}")`
    }
  }

  for (const player of this.nameList.children) {
    player.lastElementChild.textContent = playButtonText;
  }

  this.playOrDelete = state;
}

function displayTableSelection(container, preselected) {
  /* Display an array of checkboxes with the preselected values already
   * checked.
   * Display the "Start" button 
   */
}

function loadQuizPage(container) {
  /* Load the quiz page */
}

function highlightCorrectAnswer(answer, usercorrect) {
  /* Increase size of correct answer and dim others 
   * `answer`: correct answer.
   * `usercorrect`: If true, increase size of correct answer by 20%.
   * */
}

function displayQuestion(container, numbers, proposals) {
  /* Display the question and the multiple choice proposals
   * `numbers`: Pair of numbers to multiply 
   * `proposals`: Array of possible solutions 
   * */
}

function updateProgressBar(value) {
  /* Set the progress bar to the new value */
}

function loadResultPage(container, result) {
  /* Load the result page and display the result. 
   * Also display "Restart" button */


}

export { View }
