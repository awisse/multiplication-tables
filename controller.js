/* The Controller Module
 * 1. Interprets input from the user.
 * 2. Dispatches orders to the *view*.
 * 3. Queries *model* for data.
 * */
import {SUCCEED, FAIL} from './constants.js';

class Controller {

    constructor(model, view) {
        this.model = model;
        this.view = view;

        // Add bindings to model
        this.model.bindPlayersChanged(this.onPlayersChanged);

        // Add bindings to objects in view
        this.view.bindAddPlayer(this.handleAddPlayer);

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

    handleDeletePlayer = name => {
        /* TODO: Work in progress */
        const result = this.model.deletePlayer(name);
    }

    handlePlayPressed = () => {
        /* TODO: The player is chosen.
         * 1. Extract the name of the player
         * 2. Load the combination for the player
         * 3. Start the quiz page */ 
    }
}

export { Controller }
