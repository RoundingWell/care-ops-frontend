import $ from 'jquery';
import BaseEntity from 'js/base/entity-service';
import { Model, Collection } from './entities/patient-search-results';

const Entity = BaseEntity.extend({
  Entity: { Model, Collection },
  radioRequests: {
    'searchPatients:collection': 'getCollection',
    'fetch:searchPatients:collection': 'fetchSearchPatients',
  },
  fetchSearchPatients(query) {
    if (query.length < 2) {
      const d = $.Deferred();

      if (query.length === 0) {
        d.resolve(this.getCollection([]), {});
      } else {
        d.resolve();
      }

      return d;
    }

    const filter = { search: query };

    return this.fetchCollection({ data: { filter } });
  },
});

export default new Entity();
