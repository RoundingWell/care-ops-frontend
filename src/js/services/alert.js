import _ from 'underscore';

import App from 'js/base/app';

import { AlertView } from 'js/views/globals/alert-box/alert-box_views';

// in ms
const ALERT_TIMEOUT = 4000;

export default App.extend({
  channelName: 'alert',
  radioRequests: {
    'show': 'showAlert',
    'show:success': 'showSuccess',
    'show:info': 'showInfo',
    'show:error': 'showError',
    'show:undo': 'showUndo',
  },
  showAlert(options) {
    const alertView = new AlertView(options);

    _.delay(function() {
      alertView.dismiss();
    }, ALERT_TIMEOUT);

    return this.showView(alertView);
  },
  showSuccess(text) {
    this.showAlert({ text, type: 'success' });
  },
  showInfo(text) {
    this.showAlert({ text, type: 'info' });
  },
  showError(text) {
    this.showAlert({ text, type: 'error' });
  },
  showUndo(options) {
    options = _.extend({ hasUndo: true }, options);

    const alertView = this.showAlert(_.omit(options, 'onUndo', 'onComplete'));

    this.listenTo(alertView, {
      'undo': options.onUndo,
      'dismiss': options.onComplete,
    });
  },
});
