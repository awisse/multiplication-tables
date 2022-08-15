/* The Controller Module
 * 1. Interprets input from the user.
 * 2. Dispatches orders to the *view*.
 * 3. Queries *model* for data.
 * */
import {SUCCEED, FAIL, PLAY, DELETE} from './constants.js';
import {Quiz} from './model.js';
import locale from './locale/default.js';

class Controller {

    constructor(model, view) {
        this.model = model;
        this.view = view;

        // Add bindings to model
        this.model.bindPlayersChanged(this.onPlayersChanged);

        // Add bindings to objects in view
        this.view.bindAddPlayer(this.handleAddPlayer);
        this.view.bindPlayDeleteButtonPressed(this.handlePlayDeletePressed);

    }

    start() {
        this.view.refreshNamesList(this.model.players);
    }

    onPlayersChanged = players => {
        this.view.refreshNamesList(players);
    }

    handleAddPlayer = name => {
        const result = this.model.addPlayer(name);
        if (result === FAIL) {
            this.view.showAlert(`Le nom "${name}" existe déjà!`);
        }
        else {
            this.model.addPlayer(name);
            this.start();
        }
    }

    handlePlayDeletePressed = (name, state) => {
        /* Either delete the player if Ctrl is pressed or
         * start quiz for the player */
        if (state === DELETE) {
            this.model.deletePlayer(name);
            this.view.showAlert(`"${name}" ${locale.deletedWord}.`);
        }
        else {
            if (state !== PLAY) {
                throw `"state" must be "${PLAY}" or "${DELETE}"`;
            }
            /* TODO: Quiz start code here */
            const combinations =  this.model.getCombinations(name);
            this.quiz = new Quiz(name, combinations);
            this.view.play(name);
        }
    }

    gameOver() {
        }

    nextQuestion = () => {
        const question = this.quiz.nextQuestion();
        if (!question) {
            /* TODO: Implement Game Over */
        }

        /* TODO: Implement display next question and handle answer */
        const proposals = this.quiz.getProposals(question);

        /* TODO: Who checks for correct answer? View? Model? Controller? */
    }
}

export { Controller }
