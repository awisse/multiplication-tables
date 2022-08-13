import {Controller} from './controller.js'
import {Model} from './model.js'
import {View} from './view.js'

function main() {

    const model = new Model();
    const view = new View();
    const controller = new Controller(model, view);

    controller.start();
}

main()
