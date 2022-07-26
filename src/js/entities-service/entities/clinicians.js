import { first, last, reject, size, union } from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';
import { NIL as NIL_UUID } from 'uuid';

import intl from 'js/i18n';
import trim from 'js/utils/formatting/trim';

const TYPE = 'clinicians';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/clinicians',
  preinitialize() {
    this.on('change:_team', this.onChangeTeam);
  },
  validate(attrs) {
    if (!trim(attrs.name)) {
      return 'A clinician name is required';
    }

    if (!trim(attrs.email)) {
      return 'A clinician email address is required';
    }
  },
  onChangeTeam() {
    const previousTeam = Radio.request('entities', 'teams:model', this.previous('_team'));
    previousTeam.set('_clinicians', reject(previousTeam.get('_clinicians'), { id: this.id }));

    const team = Radio.request('entities', 'teams:model', this.get('_team'));
    team.set('_clinicians', union(team.get('_clinicians'), [{ id: this.id }]));
  },
  getGroups() {
    return Radio.request('entities', 'groups:collection', this.get('_groups'));
  },
  getTeam() {
    const team = this.get('_team');
    if (!team || team === NIL_UUID) {
      return Radio.request('entities', 'teams:model', {
        name: intl.patients.sidebar.action.activityViews.systemTeam,
      });
    }

    return Radio.request('entities', 'teams:model', this.get('_team'));
  },
  can(prop) {
    const access = this.get('access');

    if (prop === 'view:assigned:actions') {
      const shouldRestrict = Radio.request('bootstrap', 'currentOrg:setting', 'restrict_employee_access');
      return !(access === 'employee' && shouldRestrict);
    }

    if (prop === 'reduced:patient:schedule') {
      const shouldRestrict = Radio.request('bootstrap', 'currentOrg:setting', 'reduced_patient_schedule');
      return access === 'employee' && shouldRestrict;
    }

    /* istanbul ignore next */
    return (_DEVELOP_ && !sessionStorage.getItem('cypress'))
      || access === 'manager'
      || access === 'admin';
  },
  saveTeam(team) {
    const url = `/api/clinicians/${ this.id }/relationships/team`;

    this.set({ _team: team.id });

    this.sync('update', this, {
      url,
      data: JSON.stringify(this.toRelation(team)),
    });
  },
  getInitials() {
    const names = String(this.get('name')).split(' ');

    if (names.length === 1) return first(names).charAt(0);

    return `${ first(names).charAt(0) }${ last(names).charAt(0) }`;
  },
  isEditable() {
    return !this.get('last_active_at');
  },
  isActive() {
    const hasTeam = !!this.get('_team');
    const hasGroups = !!size(this.get('_groups'));
    const lastActive = this.get('last_active_at');

    return hasTeam && hasGroups && lastActive;
  },

});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/clinicians',
  model: Model,
  comparator: 'name',
});

export {
  _Model,
  Model,
  Collection,
};
