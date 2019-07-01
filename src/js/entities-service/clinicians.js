import $ from 'jquery';
import _ from 'underscore';

import Radio from 'backbone.radio';

import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/clinicians';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'clinicians:model': 'getModel',
    'clinicians:collection': 'getCollection',
    'fetch:clinicians:model': 'fetchClinician',
    'fetch:clinicians:current': 'fetchBootstrap',
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
    const include = [
      'groups',
      'groups.organization',
      'groups.organization.roles',
      'groups.organization.states',
    ].join(',');

    const data = { include };
    const ajaxAuth = Radio.request('auth', 'ajaxAuth');

    clinicianModel.fetch(_.extend({ url: '/api/clinicians/me', data }, ajaxAuth)).then(() => {
      d.resolve(clinicianModel);
    });

    return d;
  },
});

export default new Entity();
