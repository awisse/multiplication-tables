/* The View Module
 * 1. Displaying data and controls to the user
 * 2. Playing sounds 
*/
import locale from './locale/default.js'

class View {

    constructor(title) {

        this.title = this.getElement('#mainTitle');
        this.main = this.getElement('#gameboard');
        this.footer = this.getElement('#footer');


        this.setTitle(locale.pageTitle);

        this._setupNamesPage();
        
        /* Create table selection page objects --------------------*/


        /* Create quiz page objects -------------------------------*/
        



    }

    _setupNamesPage() {
        //
        // No footer on start page
        this.hideFooter();
        /* Create start page objects ------------------------------*/
        // Title of names page
        this.pageHeader = createElement('h1');
        this.pageHeader.id = 'page-header';
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
        this.nameList = createElement('ul', 'name-list');

        // Put the page together
        this.main.append(this.pageHeader, this.nameForm, this.nameList)

        /* End start page */

    }

    _setupQuizPage() {
        
        // Empty main page
        this._emptyMainPage();
        
        // The question before the first question
        this.pageHeader.textContent = "Setting up page ...";

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

    _emptyMainPage() {
        /* Remove all page content excepte the header */
        for (const element of this.main) {
            // Keep header for all pages.
            if (element.id !== 'page-header') {} 
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

    bindDeletePlayer(handler) {
        /* TODO */ 
    }


    getElement(selector) {
        const element = document.querySelector(selector);

        return element;
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
    
    emptyMainSection() {
        /* Empty the main section of all elements. */
        while (this.main.firstChild) {
            this.main.removeChild(this.main.firstChild);
        }
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

    }

    showAlert(message) {
        window.alert(message);
    }


}

function createElement(tag, className) {
    /* Crete a new HTML element on the page */
    const element = document.createElement(tag)
    if (className) element.classList.add(className)

    return element
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
