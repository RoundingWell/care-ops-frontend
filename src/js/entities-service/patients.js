import $ from 'jquery';
import { extend } from 'underscore';
import Radio from 'backbone.radio';

import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/patients';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'patients:model': 'getModel',
    'patients:collection': 'getCollection',
    'fetch:patients:model': 'fetchModel',
    'fetch:patients:model:byAction': 'fetchPatientByAction',
    'fetch:patients:model:byFlow': 'fetchPatientByFlow',
    'fetch:patient:engagementStatus': 'fetchPatientEngagementStatus',
    'fetch:patient:engagementSettings': 'fetchPatientEngagementSettings',
  },
  fetchPatientByAction(actionId) {
    const patient = Radio.request('entities', 'patients:model');

    return patient.fetch({ url: `/api/actions/${ actionId }/patient` });
  },
  fetchPatientByFlow(flowId) {
    const patient = Radio.request('entities', 'patients:model');

    return patient.fetch({ url: `/api/flows/${ flowId }/patient` });
  },
  fetchPatientEngagementStatus(patientId) {
    const patient = Radio.request('entities', 'patients:model', patientId);

    return $.ajax({
      url: `/api/patients/${ patientId }/engagement-status`,
    })
      .then(response => {
        patient.set('_patient_engagement', extend({}, patient.get('_patient_engagement'), response.data));
      });
  },
  fetchPatientEngagementSettings(patientId) {
    const patient = Radio.request('entities', 'patients:model', patientId);

    return $.ajax({
      url: `/api/patients/${ patientId }/engagement-settings`,
    })
      .then(response => patient.set('_patient_engagement', extend({}, patient.get('_patient_engagement'), {
        settings: response.data,
      })));
  },
});

export default new Entity();
