/* global Formio, FormioUtils */
import 'formiojs/dist/formio.form.min';
import 'formiojs/dist/formio.form.css';
import '@fortawesome/fontawesome-pro/scss/fontawesome.scss';
import '@fortawesome/fontawesome-pro/scss/v4-shims.scss';
import '@fortawesome/fontawesome-pro/scss/solid.scss';
import 'sass/formapp/bootstrap.min.css';

import 'sass/formapp-core.scss';

import { extend, map, reduce } from 'underscore';
import Backbone from 'backbone';

import { versions } from './config';

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

function getDirectory(directoryName, query) {
  return router.request('fetch:directory', { directoryName, query });
}


// Note: Allows for setting the submission at form instantiation
// https://github.com/formio/formio.js/pull/4580
const webformInit = Formio.Displays.displays.webform.prototype.init;

Formio.Displays.displays.webform.prototype.init = function() {
  if (this.options.data) {
    const data = extend({}, this.options.data);
    this._submission = { data };
    this._data = data;
  }
  webformInit.call(this);
};

function getScriptContext(contextScripts) {
  return Formio.createForm(document.createElement('div'), {}).then(form => {
    const context = reduce(contextScripts, (memo, script) => {
      return extend({}, memo, FormioUtils.evaluate(script, form.evalContext(memo)));
    }, { getDirectory });

    form.destroy();

    return context;
  });
}

function getSubmission(formData, formSubmission, reducers, evalContext) {
  return Formio.createForm(document.createElement('div'), {}, { evalContext }).then(form => {
    const submission = reduce(reducers, (memo, reducer) => {
      return FormioUtils.evaluate(reducer, form.evalContext({ formSubmission: memo, formData }));
    }, formSubmission);

    form.destroy();

    return submission;
  });
}

async function renderForm({ definition, formData, formSubmission, reducers, contextScripts }) {
  const evalContext = await getScriptContext(contextScripts);

  const submission = await getSubmission(formData, formSubmission, reducers, evalContext);

  const form = await Formio.createForm(document.getElementById('root'), definition, { evalContext, data: submission });

  form.nosubmit = true;

  router.on({
    'form:errors'(errors) {
      // NOTE: maps errors due to https://github.com/formio/formio.js/issues/3970
      form.showErrors(map(errors, error => {
        return { message: error };
      }), true);
    },
    'form:submit'() {
      if (!form.checkValidity(form.submission.data, true, form.submission.data)) {
        form.emit('error');
        return;
      }

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
}

async function renderPreview({ definition, contextScripts }) {
  const evalContext = await getScriptContext(contextScripts);

  extend(evalContext, { isPreview: true });

  Formio.createForm(document.getElementById('root'), definition, { evalContext });
}

async function renderResponse({ definition, formSubmission, contextScripts }) {
  const evalContext = await getScriptContext(contextScripts);

  extend(evalContext, { isResponse: true });

  Formio.createForm(document.getElementById('root'), definition, {
    readOnly: true,
    renderMode: 'form',
    evalContext,
    data: formSubmission,
  }).then(form => {
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

    this.request('version', versions.frontend);
  },
  request(message, args = {}) {
    const request = new Promise(resolve => {
      this.once(message, resolve);
      parent.postMessage({ message, args }, window.origin);
    });

    return request;
  },
  routes: {
    'formapp/': 'renderForm',
    'formapp/preview': 'renderPreview',
    'formapp/:id': 'renderResponse',
  },
  renderForm() {
    this.request('fetch:form:data').then(renderForm);
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
