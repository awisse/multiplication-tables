/* The View Module
 * 1. Displaying data and controls to the user
 * 2. Playing sounds 
 */
'use strict';
import locale from './locale/default.js';
import {ADD_PLAYER_EV, PLAY_DELETE_EV, ANSWER_EV, RESTART_EV,
  SAVE_EV, KEY_DOWN_EV, KEY_UP_EV, LOAD_EV} from './constants.js';
import {PLAY, DELETE, TESTING, MOVE_STAR_DELAY} from './constants.js';
import {NAMES_PAGE, QUIZ_PAGE, RESULT_PAGE} from './constants.js';
import {PLOT_WIDTH, PLOT_HEIGHT, STAR_SIZE, BIG_STAR_SIZE} 
  from './constants.js';
import {IMG_PATH, STAR_PNG, HPCT_PNG} from './constants.js';
import {PASS_SND, FAIL_SND, APPLAUSE_SND, CHEERING_SND, WARNING_SND} 
 from './constants.js';
import {PLAYERS_JSON} from './constants.js';
import {Plot2d, CIRCLE_RADIUS} from './graph.js';

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

    this.#addSaveButton();
    this.#addLoadButton();

    // Load the sounds
    this.sounds = loadSounds();

    this.saveLoadState = HIDDEN;
    this.gameState = undefined;
    this.star = undefined;
    this.hundredPct = undefined;

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

  #addSaveButton () {

    // Add Save Players button
    this.saveButton = createElement('a', 'save-load');
    this.saveButton.download = PLAYERS_JSON;
    this.saveButton.innerText = locale.savePlayers;
    this.saveButton.id = 'save-button';
    hide(this.saveButton);

    this.page.append(this.saveButton);

  }

  #addLoadButton() {

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
    hide(this.saveButton);
    hide(this.loadButton);
    switch (this.saveLoadState) {
      case SAVE:
        unhide(this.saveButton);
        break;
      case LOAD:
        unhide(this.loadButton);
        break;
      case HIDDEN:
        break;
      default:
        throw 'Must be "HIDDEN", "SAVE" or "LOAD"';
    }
  }

  #setupNamesPage() {
    /* Create all objects that are part of the Names page (start page) */

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
        this.#resetNameInput();
      }
    }
    this.nameForm.addEventListener('submit', handleSubmit);

    // Create list for existing names
    this.nameList = createElement('ul', 'names');
    this.nameList.id = 'name-list';

  }

  showNamesPage() {
    /* Display Names page */

    if (!this.nameForm) this.#setupNamesPage();

    // No footer on start page
    hide(this.footer);

    /* Game title on top */
    this.setTitle(locale.pageTitle);

    /* Clean up page */
    this.#emptyMainSection();

    /* Create start page objects ------------------------------*/
    // Title of names page
    this.pageHeader.textContent = locale.usersAndScores;
    this.main.append(this.pageHeader); 

    // Put the page together
    this.main.append(this.nameForm, this.nameList)

    this.gameState = NAMES_PAGE;

  }


  #setupQuizPage() {

    // Define Section that displays the question
    this.quizProblemDisplay = createElement('div', 'quiz-question');

    // Define the section that shows the proposals
    this.proposalSection = createElement('div', 'choices');

    // Empty footer
    for (const element of Array.from(this.footer.children)) {
      this.footer.removeChild(element);
    }

    // Progressbar with its label
    this.progressBox = createElement('div', 'scorebox');
    // Label
    const progressLabel = createElement('label', 'quiz');
    progressLabel.htmlFor = 'progress-bar';
    progressLabel.textContent = locale.progressLabel;
    // Bar 
    this.progress = createElement('progress', 'progressbar');
    this.progress.id = 'progress-bar';
    this.progress.max = "1";
    this.progress.value = "0";

    this.progressBox.append(progressLabel, this.progress);

    // Score with its label
    this.scoreBox = createElement('div', 'scorebox');
    const scoreLabel = createElement('label', 'quiz');
    scoreLabel.textContent = locale.userScore;
    this.scoreValue = createElement('span', 'quizscore');
    this.scoreValue.textContent = "0";
    this.scoreBox.append(scoreLabel, this.scoreValue);
  }

  showQuizPage(name) {
    /* Display the Quiz page. */
    if (!this.progressBox) this.#setupQuizPage();

    // Empty main page
    this.#emptyMainSection();
    hide(this.saveButton);
    hide(this.loadButton);

    /* Game title on top */
    this.setTitle(locale.pageTitle);

    // The question 
    this.pageHeader.textContent = `${name}, ${locale.howMuchIs}`;
    this.pageHeader.append(this.quizProblemDisplay, "?");
    this.main.append(this.pageHeader);

    // The proposals
    this.main.append(this.proposalSection);

    this.footer.append(this.progressBox, this.scoreBox);
    
    // Show footer, progressbar and score
    unhide(this.footer);

    this.gameState = QUIZ_PAGE;
  }

  #loadStar() {
    /* Load the Star Image File and Insert It into the plotbox */
    if (this.star) return;

    this.star = new Image();
    this.star.id = "star";
    this.star.src = IMG_PATH + STAR_PNG;

    hide(this.star);
    this.plotbox.prepend(this.star);
  }

  #load100pct() {
    /* Load the Star Image File */
    if (this.hundredPct) return;

    this.hundredPct = new Image();
    this.hundredPct.id = "hundredPct";
    this.hundredPct.src = IMG_PATH + HPCT_PNG;

    hide(this.hundredPct);
    this.finalPct.before(this.hundredPct);
    this.hundredPct.addEventListener("load", e => this.#show100pct());
  }

  #setupGameOverPage() {
    /* Display the elements of the page "Game Over", displayed after the last
     * quiz question has expired or been answered. */
    // Empty the page.
    this.resultsBlock = createElement('ul', 'results');

    function addRow(list, label) {
      /* Adds a row with a label and a value HTMLElement to the `resultBlock` 
       * and, returns the HTMLElement that contains the value */
      const row = createElement('li', 'result');
      const desc = createElement('label');
      const numDiv = createElement('div', 'relativebox');
      const number = createElement('span', 'end-result');
      numDiv.append(number);
      row.append(desc, numDiv);
      desc.textContent = label;
      list.append(row);
      return number;
    }

    this.finalScore = addRow(this.resultsBlock, locale.userScore);
    this.finalPct = addRow(this.resultsBlock, locale.userPercentage);

    /* The box for the plot of the history graph (in score points) */
    this.plotbox = createElement("div");
    this.plotbox.classList.add("relativebox");

    /* The plot object itself */
    this.plot = new Plot2d([], "history-graph", PLOT_WIDTH, PLOT_HEIGHT);
    this.plotbox.append(this.plot.canvas);

    this.restartButton = createElement('button', 'restart');
    this.restartButton.textContent = locale.restartButton;

    this.playerName = Symbol("name");
    function restart(event) {
      this.handlers[RESTART_EV](event.currentTarget[this.playerName]);
    }

    this.restartButton.addEventListener('click', restart.bind(this));

  }

  showGameOverPage(name, score, percentage, results) {
    /* Display the Game Over Page */
    if (!this.resultsBlock) this.#setupGameOverPage();

    this.#emptyMainSection();
    this.finalPct.classList.remove('gold');
    hide(this.footer);

    this.setTitle(`${name}, ${locale.gameOverHeader}`);

    const pct = Math.round(percentage * 100.0);
    if (pct === 1.0) this.finalPct.classList.add('gold');

    this.finalScore.textContent = score;
    this.finalPct.textContent = pct;
    

    /* Configure and draw the plot */
    this.plot.erase();
    this.plot.title = locale.plotCaption + name;
    this.plot.data = results;
    this.plot.draw();
    
    /* Associate the correct name with the Restart button */
    this.restartButton[this.playerName] = name;

    this.main.append(this.resultsBlock);
    this.main.append(this.plotbox);
    this.main.append(this.restartButton);

    this.gameState = RESULT_PAGE;

  }

  showStarAt(ix) {
    this.main.classList.add("wait");

    if (!this.star) {
      this.#loadStar();
      this.star.addEventListener("load", e => this.#showStarAt(ix));
      /* Check whether the star has finished loading */
    } else if (this.star.complete && this.star.naturalWidth > 0) {
      /* `this.star` already loaded. We must force the "load" event. */
      this.#showStarAt(ix);
    }
  }

  #showStarAt(ix) {
    /* Draw the star in position of the value at `ix` */
    let x = this.plot.coordsAt(ix).x - STAR_SIZE / 2 + CIRCLE_RADIUS;
    let y = this.plot.coordsAt(ix).y - STAR_SIZE / 2 + CIRCLE_RADIUS;
    this.star.style.left = `${x}px`;
    this.star.style.top = `${y}px`;
    this.star.style.width = `${STAR_SIZE}px`;
    this.main.classList.remove('spin');
    unhide(this.star);
  }

  moveStarTo(ix, hundredPctRunning) {
    /* Move the star from its present position to the position of the 
     * index `ix` */

    /* If `this.hundredPct` is displayed, wait for it to finish before moving 
     * star. */
    /* From current position of star:
     * 1. Increase to full plotbox size rotating once.
     * 2. Rotate once at full size.
     * 3. Move to final position (ix) while decreasing to final size.
     */
    /* `.bind(this)` returns a new function. In order to be able to 
     * `.removeEventListener`, we have to define the new bound function */
    const thisMoveStar = moveStar.bind(this);

    if (hundredPctRunning) {
      // Wait for animation of `this.hundredPct` to finish
      this.hundredPct.addEventListener("transitionend", thisMoveStar);
    } else {
      setTimeout(thisMoveStar, MOVE_STAR_DELAY);
    }

    function moveStar(e) {
      /* Prevent event from moving star in subsequent games without
       * new high score */
      this.hundredPct.removeEventListener("transitionend", thisMoveStar);

      this.sounds.cheering.play();
      let fromX = this.star.offsetLeft - STAR_SIZE / 2 + CIRCLE_RADIUS;
      let fromY = this.star.offsetTop - STAR_SIZE / 2 + CIRCLE_RADIUS;
      let toX = this.plot.coordsAt(ix).x - STAR_SIZE / 2 + CIRCLE_RADIUS;
      let toY = this.plot.coordsAt(ix).y - STAR_SIZE / 2 + CIRCLE_RADIUS;
      let midWidth = this.plot.hsize * BIG_STAR_SIZE;
      let midX = (fromX + toX - midWidth) / 2;
      let midY = (fromY + toY - midWidth) / 2;

      function goto_final(event) {
        /* Event listener: this = event.currentTarget */
        this.style.left = `${toX}px`;
        this.style.top = `${toY}px`;
        this.style.width = `${STAR_SIZE}px`;
        this.style.transform = "rotate(0)";
        this.removeEventListener("transitionend", goto_final);
      }

      this.star.style.left = `${midX}px`;
      this.star.style.top = `${midY}px`;
      this.star.style.width = `${midWidth}px`;
      this.star.style.transform = "rotate(1turn)";
      this.star.addEventListener("transitionend", goto_final)
    }
  }

  #draw100pct() {
    /* Draw the 100% once loaded.
     * Get the boxes of `page`, `main` and `finalPct` for calculations */
    const pageBox = this.page.getBoundingClientRect();
    const mainBox = this.main.getBoundingClientRect();
    const fPctBox = this.finalPct.getBoundingClientRect();

    // Scaling 100% to the size of the page
    const width = pageBox.width;
    const height = this.hundredPct.naturalHeight / 
      this.hundredPct.naturalWidth * width;
    
    /* Positioning in the center of the mainBox.
     * Computing vertical and horizontal offsets. */
    const voffset = mainBox.height / 2 + mainBox.y  - fPctBox.y - height / 2;
    const hoffset = -fPctBox.x;

    this.hundredPct.style.width = `${width}px`;
    this.hundredPct.style.left = `${hoffset}px`;
    this.hundredPct.style.top = `${voffset}px`;

    return fPctBox.height / height * width;
  }

  show100pct() {
    /* Show 100% full screen and disappear towards the number 100 */
    this.main.classList.add("wait");
    
    if (!this.hundredPct) this.#load100pct();

    // If `this.hundredPct` is already loaded, we must force the "load" event
    if (this.hundredPct.complete && this.hundredPct.naturalWidth > 0) {
      let loadEV = new Event("load");
      this.hundredPct.dispatchEvent(loadEV);
    }
  }

  #show100pct() {
      
    this.main.classList.remove("wait");
    const finalWidth = this.#draw100pct();
    unhide(this.hundredPct);
    this.sounds.applause.play();

    this.hundredPct.addEventListener('transitionend', disappear);
    // Need a timeout directly after an `unhide` (in #draw100pct()). See:
    // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions#javascript_examples
    setTimeout(reduce, 90);

    function disappear(e) {
      /* `this` is `this.hundredPct` */
      this.removeEventListener('transitionend', disappear);
      // nextElementSibling is `this.finalPct`.
      this.nextElementSibling.classList.add('gold');
      hide(this);
    }

    function reduce() {
      this.hundredPct.style.width = `${finalWidth}px`;
      this.hundredPct.style.left = "0px";
      this.hundredPct.style.top = "0px";
    }
  }
    
  #resetNameInput() {
    this.nameInput.value = ""
  }

  #emptyMainSection() {
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

        const namescore = createElement('div', 'namescore');

        const label = createElement('label');
        label.textContent = player.name;

        const score = createElement('span', 'userscore');
        score.textContent = player.highScore;
        namescore.append(label, score);

        const playButton = createElement('button', 'play');
        playButton.textContent = locale.playButtonText;
        playButton.type = 'button'
        playButton.name = player.name;

        let handler = (event) => { 
          event.preventDefault();
          this.handlers[PLAY_DELETE_EV](event.target.name, this.playOrDelete); 
        }
        playButton.addEventListener('click', handler)

        li.append(namescore, playButton);
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
    this.sounds.pass.play();
    button.classList.add("is-clicked", "is-correct");
  }

  highlightCorrectAnswer(correctAnswer) {
    /* Highlight correct answer after wrong answer given by player */
    this.sounds.fail.play();
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
    this.showQuizPage(name);
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
    this.sounds.warning.play();
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

function loadSounds() {
/* Sounds to play with game */
  const sounds = {
    pass: new Audio(PASS_SND), 
    fail: new Audio(FAIL_SND),
    applause: new Audio(APPLAUSE_SND),
    cheering: new Audio(CHEERING_SND),
    warning: new Audio(WARNING_SND)
  }
  return sounds;
}


export { View }
