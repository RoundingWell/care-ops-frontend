import _ from 'underscore';
import moment from 'moment';

import Radio from 'backbone.radio';

import App from 'js/base/app';

import { ListView, LayoutView, GroupsDropList } from 'js/views/patients/view/view_views';

export default App.extend({
  stateEvents: {
    'change': 'restart',
  },
  onBeforeStart({ viewId }) {
    if (this.isRestarting()) return;

    this.currentClinician = Radio.request('auth', 'currentUser');
    this.groups = this.currentClinician.getGroups();

    this.showView(new LayoutView({ viewId }));
    this.getRegion('list').startPreloader();
    this.showFilterView();
  },
  beforeStart({ viewId }) {
    let groupId = this.getState('groupId');

    if (groupId === 'all-groups') {
      groupId = this.groups.pluck('id').join(',');
    }

    const filter = _.extend({ group: groupId }, this._filtersById(viewId, this.currentClinician));

    return Radio.request('entities', 'fetch:actions:collection', { filter });
  },
  onStart(options, collection) {
    this.showChildView('list', new ListView({ collection }));
  },
  showFilterView() {
    const groups = this._getGroups();
    const groupId = this.getState('groupId') || groups.at(0).id;
    this.setState({ groupId });

    const groupsSelect = new GroupsDropList({
      collection: groups,
      state: { selected: groups.get(groupId) },
    });

    this.listenTo(groupsSelect.getState(), 'change:selected', (state, { id }) => {
      this.setState('groupId', id);
    });

    this.showChildView('filters', groupsSelect);
  },
  _getGroups() {
    const groups = this.groups.clone();

    groups.unshift({
      id: 'all-groups',
      name: 'All Groups',
    });

    return groups;
  },
  _filtersById(viewId, currentClinician) {
    const clinician = currentClinician.id;
    const role = currentClinician.getRole();

    const filters = {
      'owned-by-me': { clinician },
      'actions-for-my-role': { role: role.id },
      'new-actions': { created: moment().subtract(24, 'hours').format() },
      'updated-past-three-days': { updated: moment().startOf('day').subtract(3, 'days').format() },
      'done-last-thirty-days': {
        updated: moment().startOf('day').subtract(30, 'days').format(),
        status: 'done',
      },
    };

    return filters[viewId];
  },
});
