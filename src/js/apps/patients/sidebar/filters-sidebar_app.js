import Radio from 'backbone.radio';

import App from 'js/base/app';

import { LayoutView, GroupsFilterView } from 'js/views/patients/sidebar/filters/filters-sidebar_views';

export default App.extend({
  stateEvents: {
    'change': 'onChangeFilters',
  },
  onStart({ state }) {
    this.currentClinician = Radio.request('bootstrap', 'currentUser');

    this.showView(new LayoutView());

    this.showGroupsFilterView();
  },
  viewEvents: {
    'close': 'stop',
    'click:clear:filters': 'onClearFilters',
  },
  onChangeFilters() {
    this.showGroupsFilterView();
  },
  showGroupsFilterView() {
    const groups = this.currentClinician.getGroups();

    const groupsFilterView = new GroupsFilterView({
      groups,
      groupId: this.getState('groupId'),
    });

    this.listenTo(groupsFilterView, 'select:group', this.onSelectGroup);

    this.showChildView('groups', groupsFilterView);
  },
  onClearFilters() {
    this.setState('groupId', null);
  },
  onSelectGroup(id) {
    this.setState('groupId', id);
  },
  onStop() {
    Radio.request('sidebar', 'close');
  },
});
