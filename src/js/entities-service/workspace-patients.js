import Radio from 'backbone.radio';
import BaseEntity from 'js/base/entity-service';
import { _Model, Model } from './entities/workspace-patients';
import { v5 as uuid } from 'uuid';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model },
  radioRequests: {
    'get:workspacePatients:model': 'getByPatient',
    'fetch:workspacePatients:byPatient': 'fetchByPatient',
  },
  fetchByPatient(patientId) {
    const model = this.getByPatient(patientId);

    return model.fetch();
  },
  getByPatient(patientId) {
    const currentWorkspace = Radio.request('bootstrap', 'currentWorkspace');
    const workspaceId = currentWorkspace.id;

    return new Model({ id: uuid(patientId, workspaceId), _patient: patientId, _workspace: workspaceId });
  },
});

export default new Entity();
