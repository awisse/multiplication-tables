/* The View Module
 * 1. Displaying data and controls to the user
 * 2. Playing sounds 
 */
import locale from './locale/default.js';
import {PLAY, DELETE} from './constants.js';

class View {

  constructor(title) {

    this.title = getElement('#mainTitle');
    this.main = getElement('#gameboard');
    this.footer = getElement('#footer');

    /* Game title on top */
    this.setTitle(locale.pageTitle);

    /* Description header of game pages */
    this.pageHeader = createElement('h1');
    this.pageHeader.id = 'page-header';

    this._setupNamesPage();

    /* Create table selection page objects --------------------*/


    /* Create quiz page objects -------------------------------*/


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
    this.nameInput = createElement('input', 'username');
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

    // The question before the first question
    this.pageHeader.textContent = `Setting up quiz page for "${name}" ...`;

  }

  _resetNameInput() {
    this.nameInput.value = ""
  }

  _loadStartPage() {
    /* Display the start page */
    // Set the header
    this.pageHeader.textContent = locale.usersAndScores;

    // Remove other content from main page.
    this._emptyMainPage()

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

  setTitle(title) {
    this.title.textContent = title;
  }

  hideFooter() {
    this.footer.classList.add('hidden')
  }

  showFooter() {
    this.footer.classList.remove('hidden')
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
      names.forEach(user => {
        const li = createElement('li', 'names');
        li.id = user.name;

        const label = createElement('label', 'username');
        label.textContent = user.name;
        label.htmlFor = user.name + "_id";

        const score = createElement('span', 'userscore');
        score.textContent = user.score;

        const playButton = createElement('button', 'play');
        playButton.textContent = locale.playButtonText;
        playButton.id = user.name + "_id";

        li.append(label, score, playButton);
        this.nameList.append(li);
      });
    }
    this.playOrDelete = PLAY;
  }

  displayQuestion(problem) {
    /* Display the problem to the user with answer interface */
  }

  play(name, combinations) {
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
