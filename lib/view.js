/* The View Module
 * 1. Displaying data and controls to the user
 * 2. Playing sounds
 */
import locale from "../locale/default.js"
import {
  ADD_PLAYER_EV, PLAY_DELETE_EV, ANSWER_EV, RESTART_EV, SAVE_EV,
  KEY_DOWN_EV, KEY_UP_EV, LOAD_EV, PLAY, DELETE, MOVE_STAR_DELAY,
  PLOT_WIDTH, PLOT_HEIGHT, STAR_SIZE, BIG_STAR_SIZE, IMG_PATH,
  STAR_PNG, HPCT_PNG, PLAYERS_JSON, NAMES_PAGE, QUIZ_PAGE, RESULT_PAGE
} from "./constants.js"
import { WarnDialog, ConfirmDialog } from "./dialogs.js"
import { createElement, sounds } from "./utilities.js"
import { Plot2d, CIRCLE_RADIUS } from "./graph.js"

const HIDDEN = 0
const SAVE = 1
const LOAD = 2

class View {
  constructor (title) {
    /* Set page components for use in the class */
    this.page = getElement("div.page")
    this.title = getElement("#mainTitle")
    this.main = getElement("#gameboard")
    this.footer = getElement("#footer")

    /* Description header of game pages */
    this.pageHeader = createElement("h1", "page-title")
    this.pageHeader.id = "page-header"

    this.#addSaveButton()
    this.#addLoadButton()

    /* Preload the sounds in order to avoid delays later */
    this.sounds = sounds()

    /* Handlers to communicate with the Controller */
    this.handlers = {}

    this.saveLoadState = HIDDEN // State of Save/Import buttons
    this.currentPage = undefined // Page currently displayed
    this.star = undefined // Variable that holds the star image
    this.hundredPct = undefined // Variable that holds the 100% image
  }

  addHandler (name, handler) {
    this.handlers[name] = handler
  }

  /** ************ Setup Section ************ **/
  setupListeners () {
    document.addEventListener("keydown", this.handlers[KEY_DOWN_EV])
    document.addEventListener("keyup", this.handlers[KEY_UP_EV])

    function saveClicked (event) {
      this.handlers[SAVE_EV](this.saveButton)
    }

    this.saveButton.addEventListener("mousedown", pressed)
    this.saveButton.addEventListener("mouseup", notPressed)
    this.saveButton.addEventListener("mouseleave", notPressed)
    this.saveButton.addEventListener("click", saveClicked.bind(this))

    function loadEvent (event) {
      this.handlers[LOAD_EV](this.loadInput.files)
    }

    this.loadLabel.addEventListener("mousedown", pressed)
    this.loadLabel.addEventListener("mouseup", notPressed)
    this.loadLabel.addEventListener("mouseleave", notPressed)
    this.loadInput.addEventListener("change", loadEvent.bind(this))
  }

  #addSaveButton () {
    // Add Save Players button
    this.saveButton = createElement("a", "save-load")
    this.saveButton.download = PLAYERS_JSON
    this.saveButton.innerText = locale.savePlayers
    this.saveButton.id = "save-button"
    hide(this.saveButton)

    this.page.append(this.saveButton)
  }

  #addLoadButton () {
    // Add Import Button: An input element
    // The Container
    this.loadButton = document.createElement("div", "save-load")
    this.loadButton.id = "load-button"
    // The Label
    this.loadLabel = createElement("label", "save-load")
    this.loadLabel.innerText = locale.loadPlayers
    this.loadLabel.id = "load-label"
    this.loadLabel.htmlFor = "load-input"
    // The Input
    this.loadInput = document.createElement("input")
    this.loadInput.type = "file"
    this.loadInput.id = "load-input"
    this.loadInput.name = "load-input"
    this.loadInput.accept = "text/.json"
    hide(this.loadButton)

    this.loadButton.append(this.loadInput, this.loadLabel)

    this.page.append(this.loadButton)
  }
  /** ************ Page Definition Section ************ **/

  #emptyMainSection () {
    /* Remove all HTML elements from the main section. */
    for (const element of Array.from(this.main.children)) {
      this.main.removeChild(element)
    }
  }

  #setTitle (title) {
    /* Set the text in the title of the main section */
    this.title.textContent = title
  }

  #setupNamesPage () {
    /* Create all objects that are part of the Names page (start page)
     * The actual list of name is created in the method `refreshNamesList` */

    /* Create input box for new name with submit button */
    // The Form
    this.nameForm = createElement("form")
    this.nameForm.id = "name-form"
    // The Edit Box
    this.nameInput = createElement("input")
    this.nameInput.type = "text"
    this.nameInput.placeholder = locale.whatsYourName
    this.nameInput.name = "usernameInput"
    this.nameInput.maxlength = 20
    this.nameInput.minlength = 1
    // The Button
    this.submitNameButton = createElement("button")
    this.submitNameButton.textContent = locale.addUser
    this.submitNameButton.name = "usernameSubmit"

    this.nameForm.append(this.nameInput, this.submitNameButton)

    // Separate function definition for readability
    function handleSubmit (event) {
      event.preventDefault()
      if (this.nameInput.value) {
        this.handlers[ADD_PLAYER_EV](this.nameInput.value)
        this.nameInput.value = ""
      }
    }
    this.nameForm.addEventListener("submit", handleSubmit.bind(this))

    // Create list for existing names
    this.nameList = createElement("ul", "names")
    this.nameList.id = "name-list"
  }

  showNamesPage () {
    /* Display Names page. */

    if (!this.nameForm) this.#setupNamesPage()

    // No footer on start page
    hide(this.footer)

    // Game title on top
    this.#setTitle(locale.pageTitle)

    // Clean up page
    this.#emptyMainSection()

    /* Create start page objects */
    // Title of names page
    this.pageHeader.textContent = locale.usersAndScores
    this.main.append(this.pageHeader)

    // Put the page together
    this.main.append(this.nameForm, this.nameList)

    this.currentPage = NAMES_PAGE
  }

  #setupQuizPage () {
    /* Create all object that are part of the Quiz page */

    // Define Section that displays the question
    this.quizProblemDisplay = createElement("div", "quiz-question")

    // Define the section that shows the proposals
    this.proposalSection = createElement("div", "choices")

    // Empty the footer
    for (const element of Array.from(this.footer.children)) {
      this.footer.removeChild(element)
    }

    /* Progressbar with its label */
    this.progressBox = createElement("div", "scorebox")
    // Label
    const progressLabel = createElement("label", "quiz")
    progressLabel.htmlFor = "progress-bar"
    progressLabel.textContent = locale.progressLabel
    // Bar
    this.progress = createElement("progress", "progressbar")
    this.progress.id = "progress-bar"
    this.progress.max = "1"
    this.progress.value = "0"

    this.progressBox.append(progressLabel, this.progress)

    // Score with its label
    this.scoreBox = createElement("div", "scorebox")
    const scoreLabel = createElement("label", "quiz")
    scoreLabel.textContent = locale.userScore
    this.scoreValue = createElement("span", "quizscore")
    this.scoreValue.textContent = "0"
    this.scoreBox.append(scoreLabel, this.scoreValue)
  }

  showQuizPage (name) {
    /* Display the Quiz page. */
    if (!this.progressBox) this.#setupQuizPage()

    // Empty main page
    this.#emptyMainSection()
    hide(this.saveButton)
    hide(this.loadButton)

    // Game title on top
    this.#setTitle(locale.pageTitle)

    // The question
    this.pageHeader.textContent = `${name}, ${locale.howMuchIs}`
    this.pageHeader.append(this.quizProblemDisplay, "?")
    this.main.append(this.pageHeader)

    // The proposals
    this.main.append(this.proposalSection)

    this.footer.append(this.progressBox, this.scoreBox)

    // Show footer, progressbar and score
    unhide(this.footer)

    this.currentPage = QUIZ_PAGE
  }

  #setupGameOverPage () {
    /* Define the elements of the page "Game Over", displayed after the last
     * quiz question has expired or been answered. */
    this.resultsBlock = createElement("ul", "results")

    function addRow (list, label) {
      /* Adds a row with a label and a value HTMLElement to the `resultBlock`
       * and, returns the HTMLElement that contains the value */
      const row = createElement("li", "result")
      const desc = createElement("label")
      const numDiv = createElement("div", "relativebox")
      const number = createElement("span", "end-result")
      numDiv.append(number)
      row.append(desc, numDiv)
      desc.textContent = label
      list.append(row)
      return number
    }

    this.finalScore = addRow(this.resultsBlock, locale.userScore)
    this.finalPct = addRow(this.resultsBlock, locale.userPercentage)

    // The box for the plot of the history graph (in score points)
    this.plotbox = createElement("div")
    this.plotbox.classList.add("relativebox")

    // The plot object itself
    this.plot = new Plot2d([], "history-graph", PLOT_WIDTH, PLOT_HEIGHT)
    this.plotbox.append(this.plot.canvas)

    // The Restart Button. Restarts the game for the same player on the
    // Quiz page.
    this.restartButton = createElement("button", "restart")
    this.restartButton.textContent = locale.restartButton

    this.playerName = Symbol("name")
    function restart (event) {
      this.handlers[RESTART_EV](event.currentTarget[this.playerName])
    }
    this.restartButton.addEventListener("click", restart.bind(this))
  }

  showGameOverPage (name, score, percentage, results) {
    /* Display the Game Over Page */
    if (!this.resultsBlock) this.#setupGameOverPage()

    // Clean the page
    this.#emptyMainSection()
    this.finalPct.classList.remove("gold")
    hide(this.footer)

    // Change the title in the header
    this.#setTitle(`${name}, ${locale.gameOverHeader}`)

    const pct = Math.round(percentage * 100.0)
    if (pct === 1.0) this.finalPct.classList.add("gold")

    // Display the game score
    this.finalScore.textContent = score
    this.finalPct.textContent = pct

    // Configure and draw the plot
    this.plot.erase()
    this.plot.title = locale.plotCaption + name
    this.plot.data = results
    this.plot.draw()

    // Associate the correct name with the Restart button
    this.restartButton[this.playerName] = name

    this.main.append(this.resultsBlock)
    this.main.append(this.plotbox)
    this.main.append(this.restartButton)

    this.currentPage = RESULT_PAGE
  }
  /** ************ Animation Section ************ **/

  #loadStar () {
    /* Load the star image file and insert it into the plotbox */
    if (this.star) return

    // Load the file
    this.star = new Image()
    this.star.id = "star"
    this.star.src = IMG_PATH + STAR_PNG

    hide(this.star)
    this.plotbox.prepend(this.star)
  }

  #showStarAt (ix) {
    /* Display the star at the coordinated of the point at `ix` on the plot */

    /* Draw the star in position of the value at `ix` */
    // Compute the coordinates and apply them to the star
    const x = this.plot.coordsAt(ix).x - STAR_SIZE / 2 + CIRCLE_RADIUS
    const y = this.plot.coordsAt(ix).y - STAR_SIZE / 2 + CIRCLE_RADIUS
    this.star.style.left = `${x}px`
    this.star.style.top = `${y}px`
    this.star.style.width = `${STAR_SIZE}px`
    // Rotation animation
    this.main.classList.remove("spin")

    this.main.classList.remove("wait")

    // Show the star
    unhide(this.star)
  }

  showStarAt (ix) {
    /* Api function to display the star in the position of the coordinate `ix`
     * on the plot */
    this.main.classList.add("wait")

    if (!this.star) {
      this.#loadStar()
      /* Only for first run. `ix` will be different on later runs, when
       * `this.star` will be already loaded`. Worst case: this.#showStarAt(ix)
       * will be called twice on the first run. Doesn't matter. */
      this.star.addEventListener("load", e => this.#showStarAt(ix))
    }

    // Check whether the star has finished loading
    if (this.star.complete && this.star.naturalWidth > 0) {
      // `this.star` already loaded. We can display right away.
      this.#showStarAt(ix)
    }
  }

  moveStarTo (ix, hundredPctRunning) {
    /* Move the star from its present position to the position of the
     * index `ix`.
     * If `this.hundredPct` is displayed, wait for it to finish before
     * moving the star. From current position of star:
     * 1. Increase to full plotbox size rotating once.
     * 2. Move to final position (ix) while decreasing to final size.
     */

    /* `.bind(this)` returns a new function. In order to be able to
     * `.removeEventListener`, we have to define the new bound function */
    const thisMoveStar = moveStar.bind(this)

    if (hundredPctRunning) {
      // Wait for animation of `this.hundredPct` to finish
      this.hundredPct.addEventListener("transitionend", thisMoveStar)
    } else {
      // Wait a short moment before moving the star
      setTimeout(thisMoveStar, MOVE_STAR_DELAY)
    }

    function moveStar (e) {
      /* Move the star from the previous high score to the current high
       * score while having it grow in size first and then shrink towards the
       * final position */

      if (this.hundredPct) {
        /* Prevent event from moving star in subsequent games without
         * new high score */
        this.hundredPct.removeEventListener("transitionend", thisMoveStar)
      }

      // Start playing the cheering sound while preparing the star animation
      this.sounds.cheering.play()

      // Compute animation coordinates and star sizes
      const fromX = this.star.offsetLeft - STAR_SIZE / 2 + CIRCLE_RADIUS
      const fromY = this.star.offsetTop - STAR_SIZE / 2 + CIRCLE_RADIUS
      const toX = this.plot.coordsAt(ix).x - STAR_SIZE / 2 + CIRCLE_RADIUS
      const toY = this.plot.coordsAt(ix).y - STAR_SIZE / 2 + CIRCLE_RADIUS
      const midWidth = this.plot.hsize * BIG_STAR_SIZE
      const midX = (fromX + toX - midWidth) / 2
      const midY = (fromY + toY - midWidth) / 2

      // Second part of the animation: once the star has reached it maximal
      // size.
      function gotoFinal (event) {
        /* Event listener. In this function: this = event.currentTarget */
        this.style.left = `${toX}px`
        this.style.top = `${toY}px`
        this.style.width = `${STAR_SIZE}px`
        this.style.transform = "rotate(0)"
        this.removeEventListener("transitionend", gotoFinal)
      }

      // Apply the coordinates and the size to the star
      this.star.style.left = `${midX}px`
      this.star.style.top = `${midY}px`
      this.star.style.width = `${midWidth}px`
      this.star.style.transform = "rotate(1turn)"
      this.star.addEventListener("transitionend", gotoFinal)
    }
  }

  #load100pct () {
    /* Load the Star Image File */
    if (this.hundredPct) return

    // Load the file
    this.hundredPct = new Image()
    this.hundredPct.id = "hundredPct"
    this.hundredPct.src = IMG_PATH + HPCT_PNG

    hide(this.hundredPct)
    this.finalPct.before(this.hundredPct)

    // Wait for the file to finish loading before animating
    this.hundredPct.addEventListener("load", e => this.#show100pct())
  }

  #show100pct () {
    /* In this function, we animate the 100% image */
    this.main.classList.remove("wait")

    // Start by drawing the big 100%
    const finalWidth = this.#draw100pct()
    unhide(this.hundredPct)

    // Play the sound before the animation starts
    this.sounds.applause.play()

    // When the animation is finished, hide the 100%
    this.hundredPct.addEventListener("transitionend", disappear)

    // Need a timeout before animation directly after an `unhide`. See:
    // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions#javascript_examples
    setTimeout(reduce, 90)

    function disappear (e) {
      /* Event listener: `this` here is `e.currentTarget` */
      this.removeEventListener("transitionend", disappear)
      // nextElementSibling is `this.finalPct`.
      this.nextElementSibling.classList.add("gold")
      hide(this)
    }

    function reduce () {
      /* This function starts the animation of 100% */
      this.hundredPct.style.width = `${finalWidth}px`
      this.hundredPct.style.left = "0px"
      this.hundredPct.style.top = "0px"
    }
  }

  #draw100pct () {
    /* Draw the 100% once loaded.
     * Get the boxes of `page`, `main` and `finalPct` for calculations */
    const pageBox = this.page.getBoundingClientRect()
    const mainBox = this.main.getBoundingClientRect()
    const fPctBox = this.finalPct.getBoundingClientRect()

    // Scaling 100% to the size of the page
    const width = pageBox.width
    const height = this.hundredPct.naturalHeight /
      this.hundredPct.naturalWidth * width

    // Positioning in the center of the mainBox
    // computing vertical and horizontal offsets.
    const voffset = mainBox.height / 2 + mainBox.y - fPctBox.y - height / 2
    const hoffset = -fPctBox.x

    // Apply the dimension and position to 100%
    this.hundredPct.style.width = `${width}px`
    this.hundredPct.style.left = `${hoffset}px`
    this.hundredPct.style.top = `${voffset}px`

    return fPctBox.height / height * width
  }

  show100pct () {
    /* API function: Show 100% full screen and disappear towards
     * the number 100 in the results list */
    this.main.classList.add("wait")

    if (!this.hundredPct) this.#load100pct()

    /* If `this.hundredPct` is already loaded, we force the actions
     * execuded by the "load" event */
    if (this.hundredPct.complete && this.hundredPct.naturalWidth > 0) {
      const loadEV = new Event("load")
      this.hundredPct.dispatchEvent(loadEV)
    }
  }

  /** ************ Public Method Section ************ **/
  refreshNamesList (names) {
    /* `names` is an instance of `Players.players` in the module 'model.js'.
     * Create a list of `names` to choose from or enter a new name.
     * Show highscores. */

    /* Create the list of names to display */
    // Empty the list first
    while (this.nameList.firstChild) {
      this.nameList.removeChild(this.nameList.firstChild)
    }

    if (names.length === 0) {
      // Special case: There is no name (yet)
      const p = createElement("p")
      p.textContent = locale.noticeNoPlayer
      this.nameList.append(p)
    } else {
      // Add a row for each player
      names.forEach(player => {
        const li = createElement("li", "names")

        const namescore = createElement("div", "namescore")

        const label = createElement("label")
        label.textContent = player.name

        const score = createElement("span", "userscore")
        score.textContent = player.highScore
        namescore.append(label, score)

        const playButton = createElement("button", "play")
        playButton.textContent = locale.playButtonText
        playButton.type = "button"
        playButton.name = player.name

        const handler = (event) => {
          event.preventDefault()
          this.handlers[PLAY_DELETE_EV](event.target.name, this.playOrDelete)
        }
        playButton.addEventListener("click", handler)

        li.append(namescore, playButton)
        this.nameList.append(li)
      })
    }

    this.playOrDelete = PLAY
  }

  displayProblem (problem) {
    /* API function to display the problem to the user with answer interface */
    const [x, y] = problem.pair
    this.quizProblemDisplay.textContent = `${x} x ${y}`

    // Empty proposal section
    for (const element of Array.from(this.proposalSection.children)) {
      this.proposalSection.removeChild(element)
    }

    // Display all multiple choice proposals
    for (const proposal of problem.proposals) {
      const choice = createElement("button", "choice")
      choice.textContent = `${proposal}`
      choice.value = proposal
      choice.addEventListener("click", this.handlers[ANSWER_EV])
      this.proposalSection.append(choice)
    }
  }

  disableProposalButtons () {
    /* Disable all buttons */
    for (const button of Array.from(this.proposalSection.children)) {
      button.disabled = true
    }
  }

  displaySuccess (button) {
    /* Show display of correct answer: Increase size of button.
     * Play the success sound. */
    this.sounds.pass.play()
    button.classList.add("is-clicked", "is-correct")
  }

  highlightCorrectAnswer (correctAnswer) {
    /* Highlight correct answer after wrong answer given by player
     * Play the fail sound. */
    this.sounds.fail.play()
    for (const button of Array.from(this.proposalSection.children)) {
      if (parseInt(button.value, 10) === correctAnswer) {
        button.classList.add("is-correct")
      } else {
        button.classList.add("is-wrong")
      }
    }
  }

  updateProgress (score, percent) {
    /* Update the progressbar and the score values */
    this.progress.value = percent
    this.scoreValue.textContent = `${score}`
  }

  play (name) {
    /* Setup play page. This is a separate function to allow for other
     * actions before showing the Quiz page. */
    this.showQuizPage(name)
  }

  toggleHideShowAnchorLoad () {
    /* Toggle display of "Load" and "Import" buttons. */
    this.saveLoadState = ++this.saveLoadState % 3
    hide(this.saveButton)
    hide(this.loadButton)
    switch (this.saveLoadState) {
      case SAVE:
        unhide(this.saveButton)
        break
      case LOAD:
        unhide(this.loadButton)
        break
      case HIDDEN:
        break
      default:
        throw Error('Must be "HIDDEN", "SAVE" or "LOAD"')
    }
  }

  togglePlayDelete (state) {
    /* Depending on `state`, change text of "Play" buttons in the
     * nameList to "Delete" or "Play". */
    let playButtonText

    // Check whether nameList is displayed. Do nothing if not. This means
    // that the key combination will only work on the Names page.
    if (!document.getElementById("name-list")) return

    switch (state) {
      case PLAY:
        playButtonText = locale.playButtonText
        break
      case DELETE:
        playButtonText = locale.deleteButtonText
        break
      default:
        throw Error(`Parameter "${state}" not in ("${PLAY}", "${DELETE}")`)
    }
    // TODO: Only show `DELETE` option for players that can actually be deleted
    for (const player of this.nameList.children) {
      player.lastElementChild.textContent = playButtonText
    }

    this.playOrDelete = state
  }

  showDialog (type, message, callback) {
    /* Display different types of dialogs with corresponding sounds.
     * A user can provide a callback function that is called when
     * the user clicks on a button in the dialog. Types of dialogs:
     * 1. Warning: Displays a message with an "Ok" button.
     * 2. Confirm: Displays a message with a "Yes" and a "No" button. the
     *    callback receives "Yes" or "No" strings depending on the button
     *    pressed. */
    let dialog
    switch (type) {
      case "warning":
        this.sounds.clunk.play()
        dialog = new WarnDialog(message, this.main, callback)
        break
      case "confirm":
        this.sounds.warning.play()
        dialog = new ConfirmDialog(message, this.main, callback)
        break
      default:
        document.alert(`Unknown Dialog Type "${type}"`)
    }
    dialog.showModal()
  }
}

function getElement (selector) {
  const element = document.querySelector(selector)
  return element
}

function hide (element) {
  element.classList.add("hidden")
}

function unhide (element) {
  element.classList.remove("hidden")
}

function pressed (event) {
  event.target.classList.add("pressed")
}

function notPressed (event) {
  event.target.classList.remove("pressed")
}

export { View }
