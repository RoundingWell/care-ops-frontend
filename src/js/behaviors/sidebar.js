import $ from 'jquery';
import Radio from 'backbone.radio';
import { Behavior } from 'marionette';

import keyCodes from 'js/utils/formatting/key-codes';

import KeyListenerBehavior from './key-listener';

const { ESCAPE_KEY } = keyCodes;

export default Behavior.extend({
  behaviors: [
    {
      behaviorClass: KeyListenerBehavior,
      keyEvents: {
        'escape': [ESCAPE_KEY],
      },
    },
  ],

  onEscape() {
    const isPicklistOpen = $('.picklist, .datepicker, .date-filter').length;

    if (!isPicklistOpen) Radio.request('sidebar', 'close');
  },
});
