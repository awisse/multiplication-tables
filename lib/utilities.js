/* Often reused functions and elements */
import {
  PASS_SND, FAIL_SND, APPLAUSE_SND, CHEERING_SND, WARNING_SND, PAN_SND
} from "./constants.js"

function createElement (tag, className) {
  /* Crete a new HTML element on the page */
  const element = document.createElement(tag)
  if (className) element.classList.add(className)

  return element
}

function sounds () {
/* Sounds to play with game */
  const startLoad = Date.now()

  sounds.pass = new Audio(PASS_SND)
  sounds.fail = new Audio(FAIL_SND)
  sounds.applause = new Audio(APPLAUSE_SND)
  sounds.cheering = new Audio(CHEERING_SND)
  sounds.warning = new Audio(WARNING_SND)
  sounds.clunk = new Audio(PAN_SND)

  /* Log the time it takes for the sounds to load */
  sounds.pass.addEventListener("canplaythrough", elapsed)
  sounds.fail.addEventListener("canplaythrough", elapsed)
  sounds.applause.addEventListener("canplaythrough", elapsed)
  sounds.cheering.addEventListener("canplaythrough", elapsed)
  sounds.warning.addEventListener("canplaythrough", elapsed)
  sounds.clunk.addEventListener("canplaythrough", elapsed)

  function elapsed (e) {
    const endLoad = Date.now()
    const audioFile = e.srcElement.src.split("/").at(-1)
    e.currentTarget.removeEventListener("canplaythrough", elapsed)
    console.log(`${audioFile} loaded after "${endLoad - startLoad}ms"`)
  }
  return sounds
}

export { sounds, createElement }
