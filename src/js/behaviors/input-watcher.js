import { throttle } from 'underscore';
import { Behavior } from 'marionette';

import keyCodes from 'js/utils/formatting/key-codes';

const { ENTER_KEY } = keyCodes;

export default Behavior.extend({
  events: {
    'keydown @ui.input': 'watchKeyDown',
    'keyup @ui.input': 'watchKeyUp',
    'input @ui.input': 'watchInput',
  },

  ui: {
    input: 'input',
  },

  onDomRefresh() {
    this._currentText = this.getWatchText();
  },

  getWatchText() {
    return this.ui.input.val();
  },

  watchKeyDown(evt) {
    this.view.triggerMethod('watch:keydown', evt);
    this._evt = evt;
  },

  watchInput() {
    /* istanbul ignore next */
    if (!this._evt) return;

    /* istanbul ignore next */
    if (this._evt.isDefaultPrevented()) return;

    this.watchKeyUp(this._evt);
  },

  // Both inputInput and inputKeyUp occur for browsers that support both
  // added throttle here to match contenteditable watchKeyUp implementation
  // contenteditable doesn't have oninput for contenteditable for IE9+
  watchKeyUp: throttle(function(evt) {
    /* istanbul ignore next */
    if (!this.view.isRendered()) return;

    /* istanbul ignore next */
    if (evt.which === ENTER_KEY) {
      evt.preventDefault();
      return;
    }

    this.view.triggerMethod('watch:keyup', evt);
    this.triggerWatchChange();
  }, 1),

  triggerWatchChange() {
    const watchText = this.getWatchText();

    if (watchText === this._currentText) return;

    this._currentText = watchText;

    this.view.triggerMethod('watch:change', watchText);
  },
});
