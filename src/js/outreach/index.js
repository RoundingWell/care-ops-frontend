import $ from 'jquery';
import 'js/base/setup';
import Backbone from 'backbone';
import 'js/base/fontawesome';

import 'js/outreach/entities-service/outreach';

import 'js/entities-service/forms';

import './auth.js';

import RouterApp from 'js/base/routerapp';

import VerifyApp from 'js/outreach/apps/verify_app';
import FormApp from 'js/outreach/apps/form_app';
import OptInApp from 'js/outreach/apps/opt-in_app';
import ErrorApp from 'js/outreach/apps/error_app';

import 'scss/outreach-core.scss';
import './outreach.scss';

const OutreachApp = RouterApp.extend({
  childApps: {
    verify: VerifyApp,
    form: FormApp,
    optIn: OptInApp,
  },
  routerAppName: 'PatientsApp',
  eventRoutes: {
    'outreach:id': {
      route: 'outreach/:id',
      action: 'show',
      root: true,
    },
    'outreach:opt:in': {
      route: 'outreach/opt-in',
      action: 'showOptIn',
      root: true,
    },
  },
  show(actionId) {
    this.actionId = actionId;

    this.startVerify();
  },
  startVerify() {
    const verifyApp = this.startCurrent('verify', { actionId: this.actionId });

    this.listenTo(verifyApp, 'stop', () => {
      // NOTE: Future non-authed stop if (!isAuthed) return;
      this.startForm();
    });
  },
  startForm() {
    this.startCurrent('form', { actionId: this.actionId });
  },
  showOptIn() {
    this.startCurrent('optIn');
  },
});

function startOutreachApp() {
  // Modify viewport for mobile devices at full width
  $('meta[name=viewport]').attr('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0');
  new ErrorApp({ region: { el: document.getElementById('root') } });
  new OutreachApp({ region: { el: document.getElementById('root') } });
  Backbone.history.start({ pushState: true });
}

export {
  startOutreachApp,
};
