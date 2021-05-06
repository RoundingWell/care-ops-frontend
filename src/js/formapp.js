/* global Formio */
import 'formiojs/dist/formio.form.min';
import 'formiojs/dist/formio.form.css';
import '@fortawesome/fontawesome-pro/scss/fontawesome.scss';
import '@fortawesome/fontawesome-pro/scss/v4-shims.scss';
import '@fortawesome/fontawesome-pro/scss/solid.scss';
import 'sass/formapp/bootstrap.min.css';

import 'sass/formapp.scss';

import $ from 'jquery';
import { clone, map } from 'underscore';
import Backbone from 'backbone';

import PreloadRegion from 'js/regions/preload_region';

import 'sass/formapp/comment.scss';
import 'sass/formapp/form.scss';
import 'sass/formapp/formio-overrides.scss';
import 'sass/formapp/print.scss';

let router;

function scrollTop() {
  window.scrollTo({ top: 0 });
}

function renderForm({ definition, submission }) {
  Formio.createForm(document.getElementById('root'), definition)
    .then(form => {
      form.nosubmit = true;

      // NOTE: submission funny biz is due to: https://github.com/formio/formio.js/issues/3684
      form.submission = clone(submission);
      form.submission = clone(submission);

      router.on({
        'form:errors'(errors) {
          // NOTE: maps errors due to https://github.com/formio/formio.js/issues/3970
          form.showErrors(map(errors, error => {
            return { message: error };
          }), true);
        },
        'form:submit'() {
          form.submit();
        },
      });

      form.on('prevPage', scrollTop);
      form.on('nextPage', scrollTop);

      form.on('error', () => {
        router.request('ready:form');
      });

      form.on('submit', response => {
        if (!form.checkValidity(response.data, true, response.data)) {
          form.emit('error');
          return;
        }

        router.request('submit:form', { response });
      });

      router.request('ready:form');
    });
}

function renderPreview({ definition }) {
  Formio.createForm(document.getElementById('root'), definition);
}

function renderResponse({ definition, submission }) {
  Formio.createForm(document.getElementById('root'), definition, {
    readOnly: true,
    renderMode: 'form',
  }).then(form => {
    form.submission = submission;

    form.on('prevPage', scrollTop);
    form.on('nextPage', scrollTop);
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
  request(message, args = {}) {
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
