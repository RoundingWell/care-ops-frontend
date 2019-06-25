import $ from 'jquery';

import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/clinicians';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'clinicians:model': 'getModel',
    'clinicians:collection': 'getCollection',
    'fetch:clinician:model': 'fetchClinician',
    'fetch:temporary:bootstrap': 'fetchBootstrap',
  },
  fetchClinician(id) {
    const include = [
      'role',
    ];

    const data = { include };

    return this.fetchModel(id, { data });
  },
  fetchBootstrap() {
    const d = $.Deferred();
    const clinicianModel = new Model();

    clinicianModel.fetch({ url: '/temporary' }).then(() => {
      d.resolve(clinicianModel);
    });

    return d;
  },
});

export default new Entity();
