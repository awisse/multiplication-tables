import askMultiToReview from './page/askMultiToReview.js';
import game from './page/game.js';
import ui from './ui/ui.js';
import Scorekeeper from './ui/scorekeeper.js';
import locale from './locale/default.js';

function getElement(id) {
	return document.getElementById(id);
}

function main() {
	const gameBoard = getElement('gameboard');
	const footer    = getElement('footer');

	getElement('mainTitle').innerHTML = document.title = locale.pageTitle;

	ui.hide(footer);

	askMultiToReview.show("", gameBoard, multitable => {

		ui.show(footer);

		const scorekeeper = new Scorekeeper(
			getElement('bar'),
			getElement('points'),
			{
				totalQuestions : multitable.length,
				points4lose    : -50,
				points4win     : 100
			}
		);

		game.start(gameBoard, multitable, {
			onQuestionShown() {
				scorekeeper.startTimer();
			},
			onUserChoose(isCorrectChoice) {
				scorekeeper.stopTimer();
				isCorrectChoice ? scorekeeper.addPointsForWin() : scorekeeper.addPointsForLose();

			},
			async onFinish() {
				scorekeeper.stopTimer();
				await ui.showNotice(locale.endMessage.replace(/%d/, `${scorekeeper.getPoints()}`));
				window.location.reload();
			}
		});

	});

}

main();
