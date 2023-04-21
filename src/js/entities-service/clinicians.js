import { setUser } from 'js/datadog';
import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/clinicians';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'clinicians:model': 'getModel',
    'clinicians:collection': 'getCollection',
    'fetch:clinicians:collection': 'fetchCollection',
    'fetch:clinicians:current': 'fetchCurrentClinician',
    'fetch:clinicians:model': 'fetchModel',
    'fetch:clinicians:byWorkspace': 'fetchByWorkspace',
  },
  fetchCurrentClinician() {
    return this.fetchBy('/api/clinicians/me')
      .then(currentUser => {
        setUser(currentUser.pick('id', 'name', 'email'));
        return currentUser;
      });
  },
  fetchByWorkspace(workspaceId) {
    const url = `/api/workspaces/${ workspaceId }/relationships/clinicians`;

    return this.fetchCollection({ url });
  },
});

export default new Entity();
