/* A module that contains parsing and error checking of 
 * a specific JSON file format. */

/* ERROR codes */
import locale from './locale/default.js';
const NO_ERROR = locale.no_error;
const PARSE_ERROR = locale.parse_error;
const NO_ARRAY = locale.no_array_error;
const NO_OBJECT = locale.no_object_error;
const NO_STRING = locale.no_string_error;
const NO_NUMBER = locale.no_number_error;
const MISSING_KEY = locale.missing_key_error;

function parsePlayerJSON(json, convertPlayer) {
  /* Validate the JSON string `json` and return an object in the format
   * Players.players. `convertPlayer` is a function that converts an object
   * with keys "name", "results", "combinations" into a `model.Player` instance 
   * */
  let jsonPlayers;
  try {
    jsonPlayers = JSON.parse(json);
  } catch (error) {
    console.log(error);
    throw PARSE_ERROR;
  }
  
  if (!(jsonPlayers instanceof Array)) throw NO_ARRAY;

  /* Check correct structure of jsonPlayers */
  jsonPlayers.forEach(checkPlayer);

  let players = jsonPlayers.map(convertPlayer);

  return players;
}

function checkPlayer(p) {
  /* Check correct structure of `p` */
  if (!(typeof p === 'object')) throw p + NO_OBJECT;
  for (let key of ["name", "results", "combinations"]) {
    if (!(p.hasOwnProperty(key))) throw key + MISSING_KEY; }
  if (!(typeof p.name === 'string')) throw p + NO_STRING;
  if (!(p.results instanceof Array)) throw p + NO_ARRAY;
  if (!(p.combinations instanceof Array)) throw p + NO_ARRAY;
  for (let result of p.results) {
    if (!(typeof result === 'object')) throw p + NO_OBJECT;
    for (let key of ["date", "score", "note"]) {
      if (!(result.hasOwnProperty(key))) throw key + MISSING_KEY;}
    if (!(typeof result.date === 'number')) throw p + NO_NUMBER;
    if (!(typeof result.score === 'number')) throw p + NO_NUMBER;
    if (!(typeof result.note === 'number')) throw p + NO_NUMBER;
  }
  for (let c of p.combinations) {
    if (!(c instanceof Array)) throw p + NO_ARRAY;
    if (!((typeof c[0] === 'number') && (typeof c[1] === 'number'))) {
      throw p + NO_NUMBER;
    }
  }
}

export {parsePlayerJSON}
