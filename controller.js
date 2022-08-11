/* The Controller Module
 * 1. Interprets input from the user.
 * 2. Dispatches orders to the *view*.
 * 3. Queries *model* for data.
 * */
class Controller {

    constructor(model, view) {
        this.model = model
        this.view = view

    }


    start() {
        this.view.showStartPage(this.model.getPlayersAndScores());
    }
}

export { Controller }
