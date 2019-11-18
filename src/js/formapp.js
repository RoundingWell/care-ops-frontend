/* global Formio */
import 'formiojs/dist/formio.form.min';
import 'formiojs/dist/formio.form.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import $ from 'jquery';
import uuid from 'uuid/v4';

import 'sass/formapp.scss';

function loadForm(formId) {
  return $.ajax(`/api/forms/${ formId }/definition`);
}

function loadResponse(responseId) {
  return $.ajax(`/api/form-responses/${ responseId }/response`);
}

function getResponseData({ formId, actionId, patientId, responseId, response }) {
  return JSON.stringify({
    data: {
      id: responseId,
      type: 'form-responses',
      attributes: { response },
      relationships: {
        action: { data: { id: actionId, type: 'patient-actions' } },
        form: { data: { id: formId, type: 'forms' } },
        patient: { data: { id: patientId, type: 'patients' } },
      },
    },
  });
}

function renderForm({ formId, actionId, patientId }) {
  loadForm(formId).then(formDef => {
    Formio.createForm(document.getElementById('root'), formDef)
      .then(form => {
        form.nosubmit = true;

        form.on('submit', response => {
          const responseId = uuid();

          $.ajax({
            url: `/api/form-responses/${ responseId }`,
            method: 'PUT',
            data: getResponseData({ formId, actionId, patientId, responseId, response }),
          }).then(res => {
            form.emit('submitDone', res);
          }).fail(errors => {
            form.emit('error', errors);
          });
        });

        form.on('submitDone', () => {
          location.reload(true);
        });
      });
  });
}

function renderResponse({ formId, responseId }) {
  $.when(loadForm(formId), loadResponse(responseId))
    .then(([formDef], [response]) => {
      Formio.createForm(document.getElementById('root'), formDef, {
        readOnly: true,
      }).then(form => {
        form.submission = response;
      });
    });
}

function routeForm(path) {
  // Regex for /formapp/{formId}/a/{actionId}
  const params = path.match(/^\/formapp\/(?:([^\/]+?))(\/a\/(?:([^\/]+?)))?$/);

  const formId = params[1];
  const actionId = params[3];

  $.ajax(`/api/actions/${ actionId }`).then(({ data }) => {
    const patientId = data.relationships.patient.data.id;
    const responses = data.relationships['form-responses'].data;

    if (responses && responses[0]) {
      renderResponse({
        formId,
        responseId: responses[0].id,
      });
      return;
    }

    renderForm({
      formId,
      actionId,
      patientId,
    });
  });
}

export {
  routeForm,
};
