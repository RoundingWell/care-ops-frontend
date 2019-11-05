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
    const clinicianModel = new Model();

    return clinicianModel.fetch({ url: '/api/clinicians/me' });
  },
});

export default new Entity();
