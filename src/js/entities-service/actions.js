import Backbone from 'backbone';
import { keys, reduce } from 'underscore';

import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/actions';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'actions:model': 'getModel',
    'actions:collection': 'getCollection',
    'fetch:actions:model': 'fetchCachedModel',
    'fetch:actions:collection': 'fetchActions',
    'fetch:actions:collection:groupByDate': 'fetchActionsByDate',
    'fetch:actions:collection:byPatient': 'fetchActionsByPatient',
    'fetch:actions:collection:byFlow': 'fetchActionsByFlow',
  },
  fetchActions({ filter }) {
    const data = { filter };

    return this.fetchCollection({ data });
  },
  fetchActionsByPatient({ patientId, filter }) {
    const data = { filter };
    const url = `/api/patients/${ patientId }/relationships/actions`;

    return this.fetchCollection({ url, data });
  },
  fetchActionsByFlow(flowId) {
    const url = `/api/flows/${ flowId }/relationships/actions`;

    return this.fetchCollection({ url });
  },
  fetchActionsByDate({ filter }) {
    const data = { filter };

    return this.fetchCollection({ data })
      .then(response => {
        const groupedCollection = response.groupBy('due_date');

        return reduce(keys(groupedCollection), (collection, key) => {
          collection.add({
            date: key,
            actions: this.getCollection(groupedCollection[key]),
          });

          return collection;
        }, new Backbone.Collection([]));
      });
  },
});

export default new Entity();
