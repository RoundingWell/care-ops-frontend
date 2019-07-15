import $ from 'jquery';

import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/clinicians';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'clinicians:model': 'getModel',
    'clinicians:collection': 'getCollection',
    'fetch:clinicians:current': 'fetchBootstrap',
    'fetch:clinicians:byGroup': 'fetchCliniciansByGroup',
  },
  fetchBootstrap() {
    const d = $.Deferred();
    const clinicianModel = new Model();
    const include = [
      'groups',
      'groups.organization',
      'groups.organization.roles',
      'groups.organization.states',
    ].join(',');

    const data = { include };

    clinicianModel
      .fetch({ url: '/api/clinicians/me', data })
      .then(() => {
        d.resolve(clinicianModel);
      });

    return d;
  },
  fetchCliniciansByGroup(group) {
    const d = $.Deferred();
    const clinicians = new Collection();

    clinicians
      .fetch({ url: `${ group.url() }/relationships/clinicians` })
      .then(() => {
        d.resolve(clinicians);
      });

    return d;
  },
});

export default new Entity();
