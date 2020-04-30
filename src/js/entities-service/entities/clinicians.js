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
  validate(attrs) {
    if (!attrs.name) {
      return 'A clinician name is required';
    }

    if (!attrs.email) {
      return 'A clinician email address is required';
    }
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
      || this.get('access') === 'admin';
  },
  saveRole(role) {
    role = this.toRelation(role);
    return this.save({ _role: role.data }, {
      relationships: { role },
    });
  },
  getInitials() {
    const names = String(this.get('name')).split(' ');

    if (names.length === 1) return _.first(names).charAt(0);

    return `${ _.first(names).charAt(0) }${ _.last(names).charAt(0) }`;
  },
  isEditable() {
    return !this.get('last_active_at');
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
