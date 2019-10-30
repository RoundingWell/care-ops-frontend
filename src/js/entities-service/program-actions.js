import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/program-actions';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'programActions:model': 'getModel',
    'programActions:collection': 'getCollection',
    'fetch:programActions:model': 'fetchCachedModel',
    'fetch:programActions:collection': 'fetchProgramActions',
    'fetch:programActions:all': 'fetchAllProgramActions',
  },
  fetchProgramActions({ program }) {
    const url = `${ program.url() }/relationships/actions`;

    return this.fetchCollection({ url });
  },
  fetchAllProgramActions({ filter }) {
    const data = { filter };
    const url = '/api/program-actions';
    return this.fetchCollection({ url, data });
  },
});

export default new Entity();
