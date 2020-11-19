/* global Formio */
import 'formiojs/dist/formio.form.min';
import 'formiojs/dist/formio.form.css';
import 'sass/formapp/bootstrap.min.css';

import $ from 'jquery';
import { extend } from 'underscore';
import { v4 as uuid } from 'uuid';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

import PreloadRegion from 'js/regions/preload_region';

import 'sass/formapp.scss';

// Expose libraries for the console
window.Radio = Radio;


function fetchFields(formId, patientId) {
  return $.ajax(`/api/forms/${ formId }/fields?filter[patient]=${ patientId }`);
}

function fetchForm(formId) {
  return $.ajax(`/api/forms/${ formId }/definition`);
}

function fetchResponse(responseId) {
  return $.ajax(`/api/form-responses/${ responseId }/response`);
}

function postResponse(data) {
  return $.ajax({ url: '/api/form-responses', method: 'POST', data });
}

function toRelation(id, type) {
  return { data: { id, type } };
}

function getResponseData({ formId, patientId, actionId, response }) {
  const data = {
    id: uuid(),
    type: 'form-responses',
    attributes: { response },
    relationships: {
      action: toRelation(actionId, 'patient-actions'),
      form: toRelation(formId, 'forms'),
      patient: toRelation(patientId, 'patients'),
    },
  };

  return JSON.stringify({ data });
}

function renderForm({ formDef, fields, formId, patientId, actionId, recentResponse = {} }) {
  Formio.createForm(document.getElementById('root'), formDef)
    .then(form => {
      form.nosubmit = true;
      form.submission = { data: extend({}, recentResponse.data, fields.data.attributes) };

      form.on('submit', response => {
        postResponse(getResponseData({ formId, patientId, actionId, response }))
          .then(res => {
            form.emit('submitDone', res);
          }).fail(
            /* istanbul ignore next: Don't need to test error handler */
            errors => {
              form.emit('error', errors);
            });
      });

      form.on('submitDone', ({ data }) => {
        Radio.request('forms', 'navigateResponse', formId, data.id);
      });
    });
}

function renderPreview({ formDef }) {
  Formio.createForm(document.getElementById('root'), formDef, {
    hooks: {
      beforeSubmit(submission, next) {
        // NOTE: Not in i18n because formapp is separate
        next([{ message: 'This form is for previewing only' }]);
      },
    },
  });
}

function renderResponse({ formDef, response }) {
  Formio.createForm(document.getElementById('root'), formDef, {
    readOnly: true,
    renderMode: 'form',
  }).then(form => {
    form.submission = response;
    form.on('change', () => {
      /* istanbul ignore next: form.io implementation detail */
      form.redraw();
    });
  });
}

const Router = Backbone.Router.extend({
  initialize() {
    /* istanbul ignore next: This radio request is handled, lose coverage on url change */
    Radio.reply('forms', 'navigateResponse', (formId, responseId) => {
      this.navigate(`formapp/${ formId }/response/${ responseId }`, { trigger: true });
    });
  },
  routes: {
    'formapp/:formId/preview': 'renderPreview',
    'formapp/:formId/new/:patientId/:actionId': 'renderForm',
    'formapp/:formId/response/:responseId': 'renderResponse',
    'formapp/:formId/new/:patientId/:actionId/:recentResponseId': 'renderForm',
  },
  renderForm(formId, patientId, actionId, recentResponseId) {
    if (recentResponseId) {
      $.when(fetchForm(formId), fetchFields(formId, patientId), fetchResponse(recentResponseId))
        .then(([formDef], [fields], [recentResponse]) => {
          renderForm({ formDef, fields, formId, patientId, actionId, recentResponse });
        });
      return;
    }

    $.when(fetchForm(formId), fetchFields(formId, patientId))
      .then(([formDef], [fields]) => {
        renderForm({ formDef, fields, formId, patientId, actionId });
      });
  },
  renderResponse(formId, responseId) {
    $.when(fetchForm(formId), fetchResponse(responseId))
      .then(([formDef], [response]) => {
        renderResponse({ formDef, response });
      });
  },
  renderPreview(formId) {
    $.when(fetchForm(formId))
      .then(formDef => {
        renderPreview({ formDef });
      });
  },
});

function startFormApp() {
  const preloadRegion = new PreloadRegion({ el: '#root' });
  preloadRegion.startPreloader();
  new Router();
  Backbone.history.start({ pushState: true });
}

export {
  startFormApp,
};
