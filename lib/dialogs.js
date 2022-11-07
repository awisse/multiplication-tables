/* Define dialogs:
 * InfoDialog : To inform the user (OK button)
 * AlertDialog : To warn the user (OK button)
 * ConfirmDialog : To let the user choose (Yes and No buttons)
 */
import { createElement } from "./utilities.js"

class Dialog {
  /* Generic dialog message without button */
  constructor (message, parentElement, buttons = []) {
    this.dialog = createElement("dialog")
    this.dialog.innerText = message

    this.form = createElement("form", "dialog-form")
    this.form.method = "dialog"

    this.buttonbox = createElement("div", "buttonbox")

    this.dialog.append(this.form, this.buttonbox)
    parentElement.append(this.dialog)

    this.buttons = buttons
  }

  showModal () {
    this.dialog.showModal()
  }
}

class WarnDialog extends Dialog {
  /* Show information to the user */
  constructor (message, parentElement, callback, buttons) {
    /* `callback` is called after "OK" is clicked */
    super(message, parentElement, buttons)

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
  /* User decides yes or no. Callback is called with the value of the button
   * which was clicked. */
  constructor (message, parentElement, callback, buttons) {
    super(message, parentElement)

    function clickEvent (e) {
      const value = e.currentTarget.value
      this.dialog.close(`${value} chosen`)
      this.dialog.remove()
      if (callback) callback(value)
    }

    for (const buttonText of buttons) {
      const button = createDialogButton(buttonText)
      this.buttonbox.append(button)
      if (callback) {
        button.addEventListener("click", clickEvent.bind(this))
      }
    }
  }
}

function createDialogButton (label, value) {
  const button = createElement("button", "dialog-button")
  button.innerText = label
  button.value = value || label

  return button
}

export { WarnDialog, ConfirmDialog }
