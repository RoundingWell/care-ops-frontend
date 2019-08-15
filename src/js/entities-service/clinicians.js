import $ from 'jquery';

import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/clinicians';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'clinicians:model': 'getModel',
    'clinicians:collection': 'getCollection',
    'fetch:clinicians:collection': 'fetchCollection',
    'fetch:clinicians:current': 'fetchCurrentClinician',
  },
  fetchCurrentClinician() {
    const d = $.Deferred();
    const clinicianModel = new Model();

    clinicianModel
      .fetch({ url: '/api/clinicians/me' })
      .then(() => {
        d.resolve(clinicianModel);
      });

    return d;
  },
});

export default new Entity();
