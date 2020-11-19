import { reject, union } from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'groups';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/groups',
  getActiveClinicians() {
    const clinicians = Radio.request('entities', 'clinicians:collection', this.get('_clinicians'));

    const activeClinicians = clinicians.filter(clinician => {
      return clinician.isActive();
    });

    clinicians.reset(activeClinicians);

    return clinicians;
  },
  addClinician(clinician) {
    const url = `/api/groups/${ this.id }/relationships/clinicians`;
    const groups = clinician.get('_groups') || [];

    clinician.set({ _groups: union(groups, [{ id: this.id }]) });

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
    const url = `/api/groups/${ this.id }/relationships/clinicians`;

    clinician.set({ _groups: reject(clinician.get('_groups'), { id: this.id }) });

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
  url: '/api/groups',
  model: Model,
});

export {
  _Model,
  Model,
  Collection,
};
