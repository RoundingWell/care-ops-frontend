import { setUser } from 'js/datadog';
import Radio from 'backbone.radio';
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
    const workspace = Radio.request('entities', 'workspaces:model', workspaceId);

    return this.fetchCollection({ url })
      .then(clinicians => {
        workspace.updateClinicians(clinicians);
      });
  },
});

export default new Entity();
