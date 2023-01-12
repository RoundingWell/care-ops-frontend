import { first, last, reject, size, union, extend, includes } from 'underscore';
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

    if (!attrs._role) {
      return 'A clinician role is required';
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
  addGroup(group) {
    const groups = this.getGroups();
    groups.add(group);
    this.set('_groups', this.toRelation(groups, 'workspaces').data);
  },
  removeGroup(group) {
    const groups = this.getGroups();
    groups.remove(group);
    this.set('_groups', this.toRelation(groups, 'workspaces').data);
  },
  getTeam() {
    if (!this.hasTeam()) {
      return Radio.request('entities', 'teams:model', {
        name: intl.patients.sidebar.action.activityViews.systemTeam,
      });
    }

    return Radio.request('entities', 'teams:model', this.get('_team'));
  },
  hasTeam() {
    const team = this.get('_team');

    return team && team !== NIL_UUID;
  },
  getRole() {
    return Radio.request('entities', 'roles:model', this.get('_role'));
  },
  can(prop) {
    const role = this.getRole();
    const permissions = role.get('permissions');
    return includes(permissions, prop);
  },
  saveRole(role) {
    const saveOpts = { _role: role.id };

    return this.save(saveOpts, {
      relationships: {
        role: this.toRelation(role),
      },
    });
  },
  saveTeam(team) {
    const url = `/api/clinicians/${ this.id }/relationships/team`;

    this.set({ _team: team.id });

    this.sync('update', this, {
      url,
      data: JSON.stringify(this.toRelation(team)),
    });
  },
  saveAll(attrs) {
    attrs = extend({}, this.attributes, attrs);

    const relationships = {
      'groups': this.toRelation(attrs._groups, 'workspaces'),
      'team': this.toRelation(attrs._team, 'teams'),
      'role': this.toRelation(attrs._role, 'roles'),
    };

    return this.save(attrs, { relationships }, { wait: true });
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
    const hasTeam = this.hasTeam();
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
