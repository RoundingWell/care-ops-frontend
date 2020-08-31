import _ from 'underscore';

import App from 'js/base/app';

import { AlertView, AlertsView } from 'js/views/globals/alert-box/alert-box_views';

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
    'show:apiError': 'showApiError',
  },
  showAlert(options) {
    const alertView = new AlertView(options);

    _.delay(function() {
      alertView.dismiss();
    }, ALERT_TIMEOUT);

    let alertsView = this.getView();

    if (!alertsView) {
      alertsView = this.showView(new AlertsView());
    }

    return alertsView.addChildView(alertView);
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
  showApiError(responseJSON) {
    const errors = responseJSON.errors;

    /* istanbul ignore if */
    if (!errors.length) return;

    _.each(errors, error => this.showAlert({ text: error.detail, type: 'error' }));
  },
});
