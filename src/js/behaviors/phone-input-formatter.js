import { displayPhone } from 'js/utils/phone';

import InputWatcherBehavior from './input-watcher';

export default InputWatcherBehavior.extend({
  ui: {
    input: '.js-phone-formatter',
  },

  onWatchChange(value) {
    const inputEl = this.ui.input[0];
    const caretPosition = inputEl.selectionStart;
    const formattedText = displayPhone(value);

    if (value === formattedText) return;

    const newCaretPosition = this.getCaretPosition(value, formattedText, caretPosition);

    inputEl.value = formattedText;
    inputEl.setSelectionRange(newCaretPosition, newCaretPosition);
  },

  getCaretPosition(inputText, formattedText, caretPos) {
    if (caretPos === undefined) return formattedText.length;

    const newCaretPos = this._getCaretPosFromDiff.apply(this, arguments);

    if (!newCaretPos) return this._getCaretPosFromTraversal.apply(this, arguments);

    return newCaretPos;
  },

  /*
     * When asYouType applies its formatting, it may add multiple special characters and spaces to the number
     * Traverse through the string to find the text that matches the original location of the caret
     */
  _getCaretPosFromTraversal(inputText, formattedText, caretPos) {
    let i = 0;
    let j = 0;

    // Traverses string from the beginning to the current caret position
    for (i; i < caretPos; i++) {
      // If the current character in the formatted text does not match the original text character
      // increment forward
      while (inputText[i] !== formattedText[j] && j < formattedText.length) {
        j++;
      }

      j++;
    }

    return j;
  },

  /*
     * asYouType removes all formatting from a number when there are too many digits
     * In this case, the inputText would be formatted with special characters while the formatted text will not
     */
  _getCaretPosFromDiff(inputText, formattedText, caretPos) {
    // Finds all special phone number characters (parentheses, spaces and dashes)
    const rgx = /[(,),\s, -]/g;

    if (inputText.match(rgx) && !formattedText.match(rgx)) {
      const sbstrng = inputText.substr(0, caretPos);
      const sbstrngLength = sbstrng.length;
      const strippedLength = sbstrng.replace(rgx, '').length;
      // Diff the stripped string length with the original string and subtract it from the caret position
      // To move the caret to the correct location
      const newCaretPos = caretPos - (sbstrngLength - strippedLength);

      return newCaretPos;
    }
  },
});
