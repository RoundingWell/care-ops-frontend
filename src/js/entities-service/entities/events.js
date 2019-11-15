import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'events';

const _Model = BaseModel.extend({
  type: TYPE,

  getClinician() {
    return Radio.request('entities', 'clinicians:model', this.get('_clinician'));
  },
  getEditor() {
    if (!this.get('_editor')) {
      return Radio.request('entities', 'clinicians:model', {
        name: 'RoundingWell',
      });
    }

    return Radio.request('entities', 'clinicians:model', this.get('_editor'));
  },
  getRole() {
    return Radio.request('entities', 'roles:model', this.get('_role'));
  },
  getState() {
    return Radio.request('entities', 'states:model', this.get('_state'));
  },
  getProgram() {
    if (!this.get('_program')) return;
    return Radio.request('entities', 'programs:model', this.get('_program'));
  },
  getForm() {
    if (!this.get('_form')) return;
    return Radio.request('entities', 'forms:model', this.get('_form'));
  },
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  model: Model,
});

export {
  _Model,
  Model,
  Collection,
};
