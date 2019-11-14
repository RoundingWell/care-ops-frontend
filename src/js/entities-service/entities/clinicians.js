import _ from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

import intl from 'js/i18n';

const TYPE = 'clinicians';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/clinicians',
  preinitialize() {
    this.on('change:_role', this.onChangeRole);
  },
  onChangeRole() {
    const previousRole = Radio.request('entities', 'roles:model', this.previous('_role'));
    previousRole.set('_clinicians', _.reject(previousRole.get('_clinicians'), { id: this.id }));

    const role = Radio.request('entities', 'roles:model', this.get('_role'));
    role.set('_clinicians', _.union(role.get('_clinicians'), [{ id: this.id }]));
  },
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
    /* istanbul ignore next */
    return (_DEVELOP_ && !sessionStorage.getItem('cypress'))
      || this.get('access') === 'manager'
      || this.get('access') === 'program_manager'
      || this.get('access') === 'admin';
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
