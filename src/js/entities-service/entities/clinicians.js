import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

import intl from 'js/i18n';

const TYPE = 'clinicians';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/clinicians',

  getGroups() {
    return Radio.request('entities', 'groups:collection', this.get('_groups'));
  },
  getRole() {
    if (!this.get('_role')) {
      return Radio.request('entities', 'roles:model', {
        name: intl.patients.sidebar.action.activityViews.systemRole,
      });
    }

    return Radio.request('entities', 'roles:model', this.get('_role'));
  },
  can(prop) {
    return true;
    // return (this.get(prop));
  },

});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/clinicians',
  model: Model,
});

export {
  _Model,
  Model,
  Collection,
};
