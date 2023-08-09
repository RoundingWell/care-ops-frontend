import $ from 'jquery';
import 'js/base/setup';
import Backbone from 'backbone';
import 'js/base/fontawesome';
import 'js/entities-service/forms';

import RouterApp from 'js/base/routerapp';

import VerifyApp from 'js/outreach/apps/verify_app';
import FormApp from 'js/outreach/apps/form_app';
import OptInApp from 'js/outreach/apps/opt-in_app';

import {
  DialogView,
  ErrorView,
} from 'js/outreach/views/dialog_views';

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
    'outreach': {
      action: 'show',
      route: 'outreach/:id',
      root: true,
    },
    'outreach:opt:in': {
      action: 'showOptIn',
      route: 'outreach/opt-in',
      root: true,
    },
    'error': {
      route: '500',
      root: true,
      action: 'show500',
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
  show500() {
    const dialogView = new DialogView();
    this.showView(dialogView);

    this.showChildView('content', new ErrorView());
  },
});

function startOutreachApp() {
  // Modify viewport for mobile devices at full width
  $('meta[name=viewport]').attr('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0');
  new OutreachApp({ region: { el: document.getElementById('root') } });
  Backbone.history.start({ pushState: true });
}

export {
  startOutreachApp,
};
