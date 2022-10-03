/* global Formio, FormioUtils */
import 'formiojs/dist/formio.form.min';
import 'formiojs/dist/formio.form.css';
import '@fortawesome/fontawesome-pro/scss/fontawesome.scss';
import '@fortawesome/fontawesome-pro/scss/v4-shims.scss';
import '@fortawesome/fontawesome-pro/scss/solid.scss';
import 'scss/formapp/bootstrap.min.css';

import 'scss/formapp-core.scss';

import { extend, map, debounce } from 'underscore';
import $ from 'jquery';
import Backbone from 'backbone';
import Handlebars from 'handlebars/runtime';
import parsePhoneNumber from 'libphonenumber-js/min';

import { versions } from './config';

import {
  getScriptContext,
  getSubmission,
  getChangeReducers,
} from 'js/formapp/utils';

import 'js/formapp/components';

import 'scss/formapp/comment.scss';
import 'scss/formapp/form.scss';
import 'scss/formapp/formio-overrides.scss';
import 'scss/formapp/print.scss';
import 'scss/formapp/pdf.scss';

import 'js/regions/preload.scss';

let router;

function scrollTop() {
  window.scrollTo({ top: 0 });
}

function getDirectory(directoryName, query) {
  return router.request('fetch:directory', { directoryName, query });
}

function getContext(contextScripts) {
  return getScriptContext(contextScripts, { getDirectory, Handlebars, TEMPLATES: {}, parsePhoneNumber });
}

let prevSubmission;

const onChange = function(form, changeReducers) {
  const data = getChangeReducers(form, changeReducers, structuredClone(form.submission.data), prevSubmission);

  form.data = data;
  form.setSubmission({ data }, { fromChangeReducers: true, fromSubmission: false });

  prevSubmission = structuredClone(form.submission.data);
};

const onChangeDebounce = debounce(onChange, 100);

const updateSubmision = debounce(function(submission) {
  router.request('update:storedSubmission', submission);
}, 2000);

async function renderForm({ definition, storedSubmission, formData, formSubmission, reducers, changeReducers, contextScripts, beforeSubmit }) {
  const evalContext = await getContext(contextScripts);

  const submission = storedSubmission || await getSubmission(formData, formSubmission, reducers, evalContext);
  prevSubmission = structuredClone(submission);

  const form = await Formio.createForm(document.getElementById('root'), definition, {
    evalContext,
    data: submission,
    onChange({ fromChangeReducers }, { instance }) {
      if (fromChangeReducers && form.initialized) return;

      // Prevents clearing submission on add/edit of editgrid
      if (instance && instance.inEditGrid) return;

      updateSubmision(form.submission.data);

      onChangeDebounce(form, changeReducers);
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
      form.setPristine(false);
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
    // Always run one last change event on submit
    onChangeDebounce.cancel();
    onChange(form, changeReducers);
    form.setPristine(false);
    if (!form.checkValidity(response.data, true, response.data)) {
      form.emit('error');
      return;
    }

    const data = FormioUtils.evaluate(beforeSubmit, form.evalContext({ formSubmission: response.data })) || {};

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

async function renderPdf({ definition, formData, formSubmission, reducers, contextScripts }) {
  const evalContext = await getContext(contextScripts);

  const submission = await getSubmission(formData, formSubmission, reducers, evalContext);

  const form = await Formio.createForm(document.getElementById('root'), definition, {
    evalContext,
    data: submission,
  });

  form.nosubmit = true;
}

const Router = Backbone.Router.extend({
  initialize() {
    window.addEventListener('message', ({ data, origin }) => {
      /* istanbul ignore next: security check */
      if (origin !== window.origin || !data || !data.message) return;

      this.trigger(data.message, data.args);
    }, false);

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
    'formapp/pdf/:formId/:patientId(/:responseId)': 'renderPdf',
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
  renderPdf(formId, patientId, responseId) {
    this.once('form:pdf', renderPdf);
    $('body').append(`<iframe class="iframe-hidden" src="/formservice/${ formId }/${ patientId }${ responseId ? `/${ responseId }` : '' }"></iframe>`);
  },
});

function startFormApp() {
  $('#root').append(`<div class="spinner"><div class="spinner-circle">${ '<div class="spinner-child"></div>'.repeat(12) }</div></div>`);
  router = new Router();
  Backbone.history.start({ pushState: true });
}

export {
  startFormApp,
};
