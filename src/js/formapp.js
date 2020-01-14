/* global Formio */
import 'formiojs/dist/formio.form.min';
import 'formiojs/dist/formio.form.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import $ from 'jquery';
import uuid from 'uuid/v4';
import Radio from 'backbone.radio';

import 'sass/formapp.scss';

// Expose libraries for the console
window.Radio = Radio;

function loadForm(formId) {
  return $.ajax(`/api/forms/${ formId }/definition`);
}

function loadResponse(responseId) {
  return $.ajax(`/api/form-responses/${ responseId }/response`);
}

function loadFields(formId, patientId) {
  return $.ajax(`/api/forms/${ formId }/fields?filter[patient]=${ patientId }`);
}

function getResponseData({ formId, actionId, patientId, response }) {
  return JSON.stringify({
    data: {
      id: uuid(),
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
  $.when(loadForm(formId), loadFields(formId, patientId))
    .then(([formDef], [fields]) => {
      Formio.createForm(document.getElementById('root'), formDef)
        .then(form => {
          form.nosubmit = true;
          form.submission = { data: fields.data.attributes };
          form.redraw();

          form.on('submit', response => {
            $.ajax({
              url: '/api/form-responses',
              method: 'POST',
              data: getResponseData({ formId, actionId, patientId, response }),
            }).then(res => {
              form.emit('submitDone', res);
            }).fail(errors => {
              /* istanbul ignore next: Don't need to test error handler */
              form.emit('error', errors);
            });
          });

          form.on('submitDone', () => {
            Radio.request('forms', 'reload');
          });
        });
    });
}

Radio.reply('forms', 'reload', () => {
  /* istanbul ignore next: This radio request is handeled, can't stub window.location.reload */
  window.location.reload(true);
});

function renderResponse({ formId, responseId }) {
  $.when(loadForm(formId), loadResponse(responseId))
    .then(([formDef], [response]) => {
      Formio.Templates.current.select = {
        form: Formio.Templates.current.select.form,
        html: `
        <div ref="value">
        {% if (ctx.value) { %}
          {{ ctx.value instanceof Array ? ctx.value.map(ctx.self.itemValue).join(', ') : ctx.self.itemValue(ctx.value) }}
        {% } else { %}
          -
        {% } %}
        </div>
        `,
      };
      Formio.createForm(document.getElementById('root'), formDef, {
        readOnly: true,
        renderMode: 'html',
      }).then(form => {
        form.submission = response;
        form.redraw();
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
