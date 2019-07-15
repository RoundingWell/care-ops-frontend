import Radio from 'backbone.radio';

import App from 'js/base/app';

import { ListView, LayoutView, GroupsDropList } from 'js/views/patients/view/view_views';

export default App.extend({
  stateEvents: {
    'change': 'restart',
  },
  onBeforeStart({ viewId }) {
    if (this.isRestarting()) return;
    const currentClinician = Radio.request('auth', 'currentUser');
    this.groups = currentClinician.getGroups();

    this.showView(new LayoutView({ viewId }));
    this.showFilterView();
  },
  beforeStart({ viewId }) {
    let groupId = this.getState('groupId');

    if (groupId === 'all-groups') {
      groupId = this.groups.pluck('id').join(',');
    }

    return Radio.request('entities', 'fetch:actions:collection', { groupId });
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
});
