import $ from 'jquery';
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
    'fetch:patient:engagementStatus': 'fetchPatientEngagementStatus',
    'fetch:patient:engagementSettings': 'fetchPatientEngagementSettings',
  },
  fetchPatientByAction(actionId) {
    const patient = Radio.request('entities', 'patients:model');

    return patient.fetch({ url: `/api/actions/${ actionId }/patient` });
  },
  fetchPatientEngagementStatus(patientId) {
    const patient = Radio.request('entities', 'patients:model', patientId);

    return $.ajax({
      url: `/api/patients/${ patientId }/engagement-status`,
    })
      .then(response => patient.set(response.data));
  },
  fetchPatientEngagementSettings(patientId) {
    const patient = Radio.request('entities', 'patients:model', patientId);

    return $.ajax({
      url: `/api/patients/${ patientId }/engagement-settings`,
    })
      .then(response => patient.set(response.data));
  },
});

export default new Entity();
