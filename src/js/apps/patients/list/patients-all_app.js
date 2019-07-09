import Radio from 'backbone.radio';

import App from 'js/base/app';
import { ListView, LayoutView, GroupsDropList } from 'js/views/patients/list/patients-all_views';

export default App.extend({
  stateEvents: {
    'change': 'restart',
  },
  onBeforeStart() {
    if (this.isRestarting()) return;
    this.showView(new LayoutView());
    this.showFilterView();
  },
  beforeStart() {
    const groupId = this.getState('groupId');
    return Radio.request('entities', 'fetch:patients:collection', { groupId });
  },
  onStart(options, collection) {
    this.showChildView('list', new ListView({ collection }));
  },
  showFilterView() {
    const collection = this._getGroups();
    const selected = this._getSelectedGroup(collection);

    const groupsSelect = new GroupsDropList({
      collection,
      state: { selected },
    });

    this.listenTo(groupsSelect.getState(), 'change:selected', (state, { id }) => {
      this.setState('groupId', id);
    });

    this.showChildView('filters', groupsSelect);
  },
  _getGroups() {
    const currentClinician = Radio.request('auth', 'currentUser');
    const groups = currentClinician.getGroups();

    groups.unshift({
      name: 'All Groups',
    });

    return groups;
  },
  _getSelectedGroup(groups) {
    const id = this.getState('groupId');

    if (!id) {
      return groups.at(0);
    }

    return Radio.request('entities', 'groups:model', id);
  },
});
