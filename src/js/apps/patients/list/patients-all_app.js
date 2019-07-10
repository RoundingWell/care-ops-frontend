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
    const currentClinician = Radio.request('auth', 'currentUser');
    return currentClinician.getGroups();
  },
});
