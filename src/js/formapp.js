/* global Formio, FormioUtils */
import 'formiojs/dist/formio.form.min';
import 'formiojs/dist/formio.form.css';
import '@fortawesome/fontawesome-pro/scss/fontawesome.scss';
import '@fortawesome/fontawesome-pro/scss/v4-shims.scss';
import '@fortawesome/fontawesome-pro/scss/solid.scss';
import 'sass/formapp/bootstrap.min.css';

import 'sass/formapp-core.scss';

import { extend, map, debounce } from 'underscore';
import Backbone from 'backbone';

import { versions } from './config';

import {
  getScriptContext,
  getSubmission,
  getChangeReducers,
} from 'js/formapp/utils';

import 'js/formapp/components';

import PreloadRegion from 'js/regions/preload_region';

import 'sass/formapp/comment.scss';
import 'sass/formapp/form.scss';
import 'sass/formapp/formio-overrides.scss';
import 'sass/formapp/print.scss';

let router;

function scrollTop() {
  window.scrollTo({ top: 0 });
}

function getDirectory(directoryName, query) {
  return router.request('fetch:directory', { directoryName, query });
}

function getContext(contextScripts) {
  return getScriptContext(contextScripts, { getDirectory });
}

let prevSubmission;
let isChanging = false;

const onChange = debounce(function(form, changeReducers) {
  isChanging = true;

  const data = getChangeReducers(form, changeReducers, structuredClone(form.submission.data), prevSubmission);

  form.setSubmission({ data });

  prevSubmission = structuredClone(form.submission.data);

  isChanging = false;
}, 300);

async function renderForm({ definition, formData, formSubmission, reducers, changeReducers, contextScripts, beforeSubmit }) {
  const evalContext = await getContext(contextScripts);

  const submission = await getSubmission(formData, formSubmission, reducers, evalContext);
  prevSubmission = structuredClone(submission);

  const form = await Formio.createForm(document.getElementById('root'), definition, {
    evalContext,
    data: submission,
    onChange() {
      if (!changeReducers.length) {
        form.setSubmission({ data: form.submission.data });
        return;
      }

      if (isChanging) return;

      onChange(form, changeReducers);
    },
  });

  form.nosubmit = true;

  router.off('form:submit');
  router.off('form:errors');

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
    const data = FormioUtils.evaluate(beforeSubmit, form.evalContext({ formSubmission: response.data }));
    router.request('submit:form', { response: extend({}, response, { data }) });
  });

  router.request('ready:form');
}

async function renderPreview({ definition, contextScripts }) {
  const evalContext = await getContext(contextScripts);

  extend(evalContext, { isPreview: true });

  Formio.createForm(document.getElementById('root'), definition, { evalContext });
}

async function renderResponse({ definition, formSubmission, contextScripts }) {
  const evalContext = await getContext(contextScripts);

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
