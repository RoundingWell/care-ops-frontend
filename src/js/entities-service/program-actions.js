import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/program-actions';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'programActions:model': 'getModel',
    'programActions:collection': 'getCollection',
    'fetch:programActions:model': 'fetchCachedModel',
    'fetch:programActions:collection': 'fetchProgramActions',
  },
  fetchProgramActions({ program }) {
    const url = `${ program.url() }/relationships/actions`;

    return this.fetchCollection({ url });
  },
});

export default new Entity();
