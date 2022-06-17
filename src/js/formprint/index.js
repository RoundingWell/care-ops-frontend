import 'js/base/setup';
import 'js/i18n';

import Backbone from 'backbone';
import Radio from 'backbone.radio';
import { View, CollectionView } from 'marionette';
import hbs from 'handlebars-inline-precompile';

import 'sass/provider-core.scss';
import 'sass/app-root.scss';

import './formprint.scss';

import initPlatform from 'js/utils/platform';

import App from 'js/base/app';

import FormsService from 'js/services/forms';

import 'js/entities-service';

import BootstrapService from 'js/services/bootstrap';

import IframeFormBehavior from 'js/behaviors/iframe-form';

const RootView = CollectionView.extend({
  viewComparator: false,
  el: 'body',
  template: hbs``,
  initialize({ model }) {
    this.render();

    this.addChildView(new FormIframeView({ model }));
  },
});

const FormIframeView = View.extend({
  behaviors: [IframeFormBehavior],
  className: 'form__frame',
  template: hbs`
    <div class="app-frame__content flex-region">
      <div class="form__layout">
        <div class="form__content">
          <iframe src="/formapp/"></iframe>
        </div>
      </div>
    </div>
  `,
});

const FormPrintApp = App.extend({
  channelName: 'app',

  initialize() {
    initPlatform();
  },

  onBeforeStart({ name }) {
    new BootstrapService({ name });
  },

  beforeStart({ patientId, formId }) {
    return [
      Radio.request('bootstrap', 'fetch'),
      Radio.request('entities', 'fetch:patients:model', patientId),
      Radio.request('entities', 'forms:model', formId),
    ];
  },

  onStart(options, currentUser, [patient], form) {
    this.addChildApp('formsService', FormsService, {
      patient: patient,
      form: form,
    });

    this.setView(new RootView({ model: form }));
  },
});

const Router = Backbone.Router.extend({
  routes: {
    'print/:patientId/:formId(/:responseId)': 'startResponse',
  },
  startResponse(patientId, formId, responseId) {
    const formPrintApp = new FormPrintApp();
    formPrintApp.start({ patientId, formId, responseId });
  },
});

function startFormPrintApp() {
  new Router();
  Backbone.history.start({ pushState: true });
}

export {
  startFormPrintApp,
};

