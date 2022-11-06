/* A module that contains parsing and error checking of
 * a specific JSON file format. */

/* ERROR codes from the locale object */
const NO_ARRAY = "noArrayError"
const NO_OBJECT = "noObjectError"
const NO_STRING = "noStringError"
const NO_NUMBER = "noNumberError"
const MISSING_KEY = "missingKeyError"
const INVALID_JSON = "parseError"

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
    throw Error("Parser Error",
      { cause: { msg: INVALID_JSON, value: error.message } })
  }

  if (!(jsonPlayers instanceof Array)) {
    throw Error("Parser Error", { cause: { msg: NO_ARRAY } })
  }

  /* Check correct structure of jsonPlayers */
  jsonPlayers.forEach(checkPlayer)

  const players = jsonPlayers.map(convertPlayer)

  return players
}

function checkPlayer (p) {
  /* Check correct structure of `p` */
  if (!(typeof p === "object")) {
    throw Error("Parser Error", { cause: { msg: NO_OBJECT, value: p } })
  }
  for (const key of ["name", "results", "combinations"]) {
    if (!(Object.prototype.hasOwnProperty.call(p, key))) {
      throw Error("Parser Error", { cause: { msg: MISSING_KEY, value: key } })
    }
  }
  if (!(typeof p.name === "string")) {
    throw Error("Parser Error", { cause: { msg: NO_STRING, value: p.name } })
  }
  if (!(p.results instanceof Array)) {
    throw Error("Parser Error",
      { cause: { msg: NO_ARRAY, value: p.results } })
  }
  if (!(p.combinations instanceof Array)) {
    throw Error("Parser Error",
      { cause: { msg: NO_ARRAY, value: p.combinations } })
  }
  for (const result of p.results) {
    if (!(typeof result === "object")) {
      throw Error("Parser Error",
        { cause: { msg: NO_OBJECT, value: result } })
    }
    for (const key of ["date", "score", "note"]) {
      if (!(Object.prototype.hasOwnProperty.call(result, key))) {
        throw Error("Parser Error",
          { cause: { msg: MISSING_KEY, value: key } })
      }
    }
    if (!(typeof result.date === "number")) {
      throw Error("Parser Error",
        { cause: { msg: NO_NUMBER, value: result.date } })
    }
    if (!(typeof result.score === "number")) {
      throw Error("Parser Error",
        { cause: { msg: NO_NUMBER, value: result.score } })
    }
    if (!(typeof result.note === "number")) {
      throw Error("Parser Error",
        { cause: { msg: NO_NUMBER, value: result.note } })
    }
  }
  for (const c of p.combinations) {
    if (!(c instanceof Array)) {
      throw Error("Parser Error", { cause: { msg: NO_ARRAY, value: c } })
    }
    if (!((typeof c[0] === "number") && (typeof c[1] === "number"))) {
      throw Error("Parser Error", { cause: { msg: NO_NUMBER, value: c } })
    }
  }
}

export { parsePlayerJSON }
