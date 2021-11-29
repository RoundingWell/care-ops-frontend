/* global Formio, FormioUtils */
import 'formiojs/dist/formio.form.min';
import 'formiojs/dist/formio.form.css';
import '@fortawesome/fontawesome-pro/scss/fontawesome.scss';
import '@fortawesome/fontawesome-pro/scss/v4-shims.scss';
import '@fortawesome/fontawesome-pro/scss/solid.scss';
import 'sass/formapp/bootstrap.min.css';

import 'sass/formapp-core.scss';

import $ from 'jquery';
import { extend, map, reduce } from 'underscore';
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

const NestedComponent = Formio.Components.components.nested;

class Snippet extends NestedComponent {
  constructor(...args) {
    super(...args);
    this.noField = true;
  }
  static schema(...extendArgs) {
    return NestedComponent.schema({
      label: 'Snippet',
      key: 'snippet',
      type: 'snippet',
      components: [],
      input: false,
      persistent: false,
      snippet: null,
    }, ...extendArgs);
  }
}

Formio.use({
  components: {
    snippet: Snippet,
  },
});


function renderForm({ definition, formData, prefill, reducers, contextScripts }) {
  Formio.createForm(document.getElementById('root'), definition)
    .then(form => {
      form.options.evalContext = reduce(contextScripts, (memo, script) => {
        return extend({}, memo, FormioUtils.evaluate(script, form.evalContext(memo)));
      }, form.options.evalContext);

      const submission = reduce(reducers, (memo, reducer) => {
        return FormioUtils.evaluate(reducer, form.evalContext({ formData, prefill: memo }));
      }, prefill || {});

      form.nosubmit = true;

      // NOTE: submission funny biz is due to: https://github.com/formio/formio.js/issues/3684
      form.submission = { data: submission };
      form.submission = { data: submission };

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
