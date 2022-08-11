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

        this.hideFooter();

        this.setTitle(locale.pageTitle);

        /* Create start page objects ------------------------------*/
        // Title of start page
        this.namePageTitle = createElement('h1')
        this.namePageTitle.textContent = locale.usersAndScores;

        // Create input box for new name
        this.nameInput = createElement('input');
        this.nameInput.placeholder = locale.whatsYourName;
        this.nameInput.name = 'username';

        // Create list for existing names
        this.nameList = createElement('ul', 'name-list');

        /* Create table selection page objects --------------------*/


        /* Create quiz page objects -------------------------------*/
        



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

    showStartPage(names) {
        /* Show the start page.
         * Create a listbox with `names` to choose from or enter a new name.
         * Show highscores. */

        // Empty the page first
        this.emptyMainSection();
        
        // Create the list of names to display
        // Empty the list first
        while (this.nameList.firstChild) { 
            this.nameList.removeChild(this.nameList.firstChild)
        }

        if (names.length === 0) {
            const p = createElement('p');
            p.textContent = 'Aucun joueur enregistré! Ajoutez un joueur?';
            this.nameList.append(p);
        }
        else {
            names.forEach(user => {
                const li = createElement('li', 'names');

                const select = createElement('input', 'name-select');
                select.type = 'radio';
                select.name = 'name-select';
                select.value = user.name;
                select.id = user.name + "_id";

                const label = createElement('label', 'username');
                label.textContent = user.name;
                label.htmlFor = user.name + "_id";

                const score = createElement('span', 'userscore');
                score.textContent = user.score;

                li.append(select, label, score);
                this.nameList.append(li);
            });
        }

        this.nameList.firstChild.getElementsByTagName("input")[0].checked = true;

        // Put the page together
        this.main.append(this.namePageTitle, this.nameInput, this.nameList)
    }


}


function createElement(tag, className) {
const element = document.createElement(tag)

if (className) element.classList.add(className)

return element
}

function displayStartPage(container) {
    /* 1. Display the start page with previous high scores.
     * 2. Display "Add User" button 
     * 3. Display "Start" button
     * */
}

function enterName(default_name) {
    /* Display an edit box that allows the user to enter a name 
     * `default_name`: Most recent player from localStorage
     * Validation: Only characters [A-Za-z-] in one word are allowed
     * */
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
