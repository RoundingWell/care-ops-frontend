/* global Formio */
import 'formiojs/dist/formio.form.min';
import 'formiojs/dist/formio.form.css';
import 'sass/formapp/bootstrap.min.css';

import $ from 'jquery';
import { clone } from 'underscore';
import Backbone from 'backbone';

import PreloadRegion from 'js/regions/preload_region';

import 'sass/formapp.scss';

let router;

function renderForm({ definition, submission }) {
  Formio.createForm(document.getElementById('root'), definition)
    .then(form => {
      form.nosubmit = true;

      // NOTE: submission funny biz is due to: https://github.com/formio/formio.js/issues/3684
      form.submission = clone(submission);
      form.submission = clone(submission);

      form.on('submit', response => {
        router.once('form:errors', errors => {
          form.showErrors(errors);
          form.emit('error');
        });
        router.request('submit:form', { response });
      });
    });
}

function renderPreview({ definition }) {
  Formio.createForm(document.getElementById('root'), definition, {
    hooks: {
      beforeSubmit(submission, next) {
        // NOTE: Not in i18n because formapp is separate
        next([{ message: 'This form is for previewing only' }]);
      },
    },
  });
}

function renderResponse({ definition, submission }) {
  Formio.createForm(document.getElementById('root'), definition, {
    readOnly: true,
    renderMode: 'form',
  }).then(form => {
    form.submission = submission;

    // TODO: This event should be removed and form components should be set to refresh on change
    form.on('change', () => {
      /* istanbul ignore next: form.io implementation detail */
      form.redraw();
    });
  });
}

const Router = Backbone.Router.extend({
  initialize() {
    window.addEventListener('message', ({ data, origin }) => {
      /* istanbul ignore next: security check */
      if (origin !== window.origin || !data || !data.message) return;

      this.trigger(data.message, data.args);
    }, false);

    this.on('print:form', () => {
      window.print();
    });
  },
  request(message, args) {
    const $d = $.Deferred();

    this.once(message, $d.resolve);
    parent.postMessage({ message, args }, window.origin);

    return $d;
  },
  routes: {
    'formapp/': 'renderForm',
    'formapp/preview': 'renderPreview',
    'formapp/:id': 'renderResponse',
  },
  renderForm() {
    this.request('fetch:form:prefill').then(renderForm);
  },
  renderPreview() {
    this.request('fetch:form').then(renderPreview);
  },
  renderResponse(responseId) {
    this.request('fetch:form:response', { responseId }).then(renderResponse);
  },
});

function startFormApp() {
  const preloadRegion = new PreloadRegion({ el: '#root' });
  preloadRegion.startPreloader();
  router = new Router();
  Backbone.history.start({ pushState: true });
}

export {
  startFormApp,
};
