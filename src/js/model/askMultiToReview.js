import {shuffle} from '../model/array.js';
import storage from '../model/storage.js';
import ui from '../view/ui.js';
import locale from '../locale/default.js';
import {MAX_TABLE_INT} from '../constants.js';

function buildTemplate(range, selected) {
	let labels = "";

	for (let i = range[0]; i <= range[1]; i++) {
		let checked = "";
		if (!selected) {
			checked = "checked";
		} else {
			checked = selected.indexOf(i) !== -1 ? "checked" : "";
		}
		labels += `<label class="checkbox"><input type="checkbox" value="${i}" ${checked}><div>${i}</div></label>`;
	}
	return `
<div class="input">
	<p>${locale.whichMultiTable}</p>
	${labels}
	<br>
	<button type="button" id="sendChoice">${locale.letsStart}</button>
</div>
`;
}


function getChoice(container) {
	let checks = [];
	container.querySelectorAll('input[type="checkbox"]').forEach(input => {
		if (input.checked)
			checks.push(+input.value);
	});
	return checks;
}

function generateMultitables(tabs) {

	const allCombinations = [];
	for (let i = 0; i < tabs.length; i++) {
		for (let j = 2; j <= MAX_TABLE_INT; j++) {
			allCombinations.push([tabs[i], j]);
            // Ask question in both directions
            if (tabs[i] != j) {
                allCombinations.push([j, tabs[i]])
            }
		}
	}
	shuffle(allCombinations);
	return allCombinations;

}

export default {
	show(name, container, cbk) {
		container.innerHTML = buildTemplate([2, MAX_TABLE_INT], 
            storage.fetch('multiPreferred'));
		container.querySelector('#sendChoice').addEventListener('click', function () {
			let multitables = getChoice(container);
			if (multitables.length === 0) {
				ui.showNotice(locale.noticeSelectAtLeastOne);
				return;
			}
			storage.store('multiPreferred', multitables);
			cbk(generateMultitables(multitables));
		});
	}
}
