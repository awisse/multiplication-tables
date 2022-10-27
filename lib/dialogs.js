/* Define dialogs:
 * InfoDialog : To inform the user (OK button)
 * AlertDialog : To warn the user (OK button)
 * ConfirmDialog : To let the user choose (Yes and No buttons)
 */
import { createElement } from "./utilities.js"

class Dialog {
  /* Generic dialog message without button */
  constructor (message, parentElement) {
    this.dialog = createElement("dialog")
    this.dialog.innerText = message

    this.form = createElement("form", "dialog-form")
    this.form.method = "dialog"

    this.buttonbox = createElement("div", "buttonbox")

    this.dialog.append(this.form, this.buttonbox)
    parentElement.append(this.dialog)
  }

  showModal () {
    this.dialog.showModal()
  }
}

class WarnDialog extends Dialog {
  /* Show information to the user */
  constructor (message, parentElement, callback) {
    /* `callback` is called after "OK" is clicked */
    super(message, parentElement)

    function okEvent (e) {
      this.dialog.close("OK Chosen")
      this.dialog.remove()
      if (callback) callback()
    }
    this.okButton = createDialogButton("OK")
    this.okButton.addEventListener("click", okEvent.bind(this))

    this.buttonbox.append(this.okButton)
  }
}

class ConfirmDialog extends Dialog {
  /* User decides yes or no. Callback is called with "Yes" or "No" depending
   * which button was clicked. */
  constructor (message, parentElement, callback) {
    super(message, parentElement)

    function clickEvent (e) {
      const value = e.currentTarget.value
      this.dialog.close(`${value} chosen`)
      this.dialog.remove()
      if (callback) callback(value)
    }

    this.yesButton = createDialogButton("Yes")
    this.noButton = createDialogButton("No")

    if (callback) {
      this.yesButton.addEventListener("click", clickEvent.bind(this))
      this.noButton.addEventListener("click", clickEvent.bind(this))
    }

    this.buttonbox.append(this.noButton, this.yesButton)
  }
}

function createDialogButton (label, value) {
  const button = createElement("button", "dialog-button")
  button.innerText = label
  button.value = value || label

  return button
}

export { WarnDialog, ConfirmDialog }
