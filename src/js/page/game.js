import {getRandomBetween} from '../helpers/random.js';
import {shuffle} from '../helpers/array.js';
import sounds from '../ui/sounds.js';
import locale from '../locale/default.js';
import {MAX_TABLE_INT, MAX_PROPOSALS} from '../constants.js';

function buildQuestion(numbers) {

	const proposals = buildProposals(numbers);
	let choices     = "";
	proposals.forEach(proposal => {
		choices += `<span class="choice" data-number="${proposal}">${proposal}</span>`;
	});
	return `
    <div class="question">
        ${locale.howMuchIs}<br>
        <span>${numbers[0]} x ${numbers[1]}</span> ?
    </div>
    <div class="choices">${choices}</div>
`;
}

function buildProposals(numbers) {
    /* Principles for proposals:
     * 1. They must be plausible (ex: 2*2 =? 102 ??, vs 6*7 =? 54 !!)
     * 2. Single digit results: Remain single digit.
     * 3. Double digit results: Remain double digit.
     * 4. Trible digit results: Remain trible digit.
     * 5. At most 2 * largest operand above or below.
     */
	const solution  = numbers[0] * numbers[1];
    let min_rand, max_rand; 
	const proposals = new Int16Array(MAX_PROPOSALS);

    proposals[0] = solution;
    switch (Math.trunc(Math.log10(solution))) {
        case 0:
            min_rand = 2;
            max_rand = 10;
            break;
        case 1:
            min_rand = Math.max(solution - 12, 6); // 2..5 not plausible
            max_rand = Math.min(solution + 12, 108); // 9 * 12
            break;
        case 2:
            /* 9 * 12 the only > 100 with one operand < 10 */
            min_rand = Math.max(solution - 12, 100); 
            max_rand = solution + 12;
    }
    for (let i = 1; i < MAX_PROPOSALS; i++) {
        getRandomBetween(min_rand, max_rand, proposals);
    }
	shuffle(proposals);
	return proposals;
}

function askQuestion(container, numbers, callback) {
	container.innerHTML = buildQuestion(numbers);
	container.querySelectorAll('.choice').forEach(a => {
		function handlerClick(e) {
			e.preventDefault();
			e.stopPropagation();
			if (a.getAttribute('data-inactive')) {
				return;
			}
			const solution = numbers[0] * numbers[1];
			const win      = +this.getAttribute('data-number') === solution;
			if (win) {
				this.className += " is-clicked ";
				sounds.success();
			} else {
				sounds.error();
			}
			container.querySelectorAll('.choice').forEach(a => {
				a.className += " " + (+a.getAttribute('data-number') === solution ? "is-correct" : "is-wrong");
				a.setAttribute('data-inactive', '1');
			});

			callback(win);

		}

		a.addEventListener('click', handlerClick);
		a.addEventListener('touchstart', handlerClick);
	});
}

function start(
	container,
	multitables,
	{
		onQuestionShown = () => {
		},
		onUserChoose = () => {
		},
		onFinish = () => {
		}
	}
) {
	onQuestionShown();
    /* If all combinations have been asked, end the game. */
	if (multitables.length === 0) {
		onFinish();
		return;
	}

    /* Take a combination from the list. */
	const numbers = multitables.pop();
	askQuestion(container, numbers, function (win) {
        /* If wrong answer, insert the combination at the beginning
         * of the list */
		if (!win) {
			multitables.unshift(numbers);
		}
		onUserChoose(win);
		setTimeout(() => {
			start(container, multitables, {onQuestionShown, onUserChoose, onFinish});
		}, 1500)
	});
}

export default {
	start
}
