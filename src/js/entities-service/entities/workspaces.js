import { reject, union, pick } from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'workspaces';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/workspaces',
  getStates() {
    return Radio.request('entities', 'states:collection', this.get('_states'));
  },
  getForms() {
    return Radio.request('entities', 'forms:collection', this.get('_forms'));
  },
  getAssignableClinicians() {
    const clinicians = Radio.request('entities', 'clinicians:collection', this.get('_clinicians'));

    return clinicians.filterAssignable();
  },
  updateClinicians(clinicians) {
    this.set('_clinicians', clinicians.map(m => pick(m, 'id', 'type')));
  },
  addClinician(clinician) {
    const url = `/api/workspaces/${ this.id }/relationships/clinicians`;
    const workspaces = clinician.get('_workspaces');

    clinician.set({ _workspaces: union(workspaces, [{ id: this.id }]) });

    this.set({ _clinicians: union(this.get('_clinicians'), [{ id: clinician.id }]) });

    return this.sync('create', this, {
      url,
      data: JSON.stringify({
        data: [{
          id: clinician.id,
          type: clinician.type,
        }],
      }),
    });
  },
  removeClinician(clinician) {
    const url = `/api/workspaces/${ this.id }/relationships/clinicians`;

    clinician.set({ _workspaces: reject(clinician.get('_workspaces'), { id: this.id }) });

    this.set({
      _clinicians: reject(this.get('_clinicians'), { id: clinician.id }),
    });

    return this.sync('delete', this, {
      url,
      data: JSON.stringify({
        data: [{
          id: clinician.id,
          type: clinician.type,
        }],
      }),
    });
  },
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/workspaces',
  model: Model,
  comparator: 'name',
});

export {
  _Model,
  Model,
  Collection,
};
