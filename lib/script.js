'use strict';
import {Controller} from './controller.js'
import {Players} from './model.js'
import {View} from './view.js'

function main() {

  const players = new Players();
  const view = new View();
  const controller = new Controller(players, view);

  controller.start();
}

main()
