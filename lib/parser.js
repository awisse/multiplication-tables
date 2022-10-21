/* A module that contains parsing and error checking of
 * a specific JSON file format. */

/* ERROR codes */
import locale from "../locale/default.js"
const NO_ARRAY = locale.no_array_error
const NO_OBJECT = locale.no_object_error
const NO_STRING = locale.no_string_error
const NO_NUMBER = locale.no_number_error
const MISSING_KEY = locale.missing_key_error

function parsePlayerJSON (json, convertPlayer) {
  /* Validate the JSON string `json` and return an object in the format
   * Players.players. `convertPlayer` is a function that converts an object
   * with keys "name", "results", "combinations" into a `model.Player`
   * instance */
  let jsonPlayers
  try {
    jsonPlayers = JSON.parse(json)
  } catch (error) {
    console.log(error)
    throw Error(error.message)
  }

  if (!(jsonPlayers instanceof Array)) throw Error(NO_ARRAY)

  /* Check correct structure of jsonPlayers */
  jsonPlayers.forEach(checkPlayer)

  const players = jsonPlayers.map(convertPlayer)

  return players
}

function checkPlayer (p) {
  /* Check correct structure of `p` */
  if (!(typeof p === "object")) throw Error(p + NO_OBJECT)
  for (const key of ["name", "results", "combinations"]) {
    if (!(Object.prototype.hasOwnProperty.call(p, key))) {
      throw Error(MISSING_KEY + key)
    }
  }
  if (!(typeof p.name === "string")) throw Error(p.name + NO_STRING)
  if (!(p.results instanceof Array)) throw Error(p.results + NO_ARRAY)
  if (!(p.combinations instanceof Array)) {
    throw Error(p.combinations + NO_ARRAY)
  }
  for (const result of p.results) {
    if (!(typeof result === "object")) throw Error(result + NO_OBJECT)
    for (const key of ["date", "score", "note"]) {
      if (!(Object.prototype.hasOwnProperty.call(result, key))) {
        throw Error(MISSING_KEY + key)
      }
    }
    if (!(typeof result.date === "number")) {
      throw Error(result.date + NO_NUMBER)
    }
    if (!(typeof result.score === "number")) {
      throw Error(result.score + NO_NUMBER)
    }
    if (!(typeof result.note === "number")) {
      throw Error(result.note + NO_NUMBER)
    }
  }
  for (const c of p.combinations) {
    if (!(c instanceof Array)) throw Error(c + NO_ARRAY)
    if (!((typeof c[0] === "number") && (typeof c[1] === "number"))) {
      throw Error(c + NO_NUMBER)
    }
  }
}

export { parsePlayerJSON }
