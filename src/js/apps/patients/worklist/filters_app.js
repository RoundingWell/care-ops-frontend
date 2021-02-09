import Radio from 'backbone.radio';

import intl from 'js/i18n';

import App from 'js/base/app';

import OwnerDroplist from 'js/views/patients/shared/components/owner_component';
import { FiltersView, GroupsDropList } from 'js/views/patients/worklist/filters_views';

export default App.extend({
  onStart({ shouldShowClinician, shouldShowRole }) {
    this.shouldShowClinician = shouldShowClinician;
    this.shouldShowRole = shouldShowRole;
    this.currentClinician = Radio.request('bootstrap', 'currentUser');
    this.groups = this.currentClinician.getGroups();

    this.showView(new FiltersView());
    this.showFilters();
  },
  showFilters() {
    this.showGroupsFilterView();
    this.showOwnerFilterView();
  },
  showGroupsFilterView() {
    if (this.groups.length < 2) return;

    const groups = this._getGroups();
    const selected = groups.get(this.getState('groupId')) || groups.at(0);

    const groupsFilter = new GroupsDropList({
      collection: groups,
      state: { selected },
    });

    this.listenTo(groupsFilter.getState(), 'change:selected', (state, { id }) => {
      this.setState('groupId', id);
    });

    this.showChildView('group', groupsFilter);
  },
  showOwnerFilterView() {
    const owner = !this.shouldShowClinician || !this.getState('clinicianId') ?
      Radio.request('entities', 'roles:model', this.getState('roleId')) :
      Radio.request('entities', 'clinicians:model', this.getState('clinicianId'));

    const ownerFilter = new OwnerDroplist({
      owner,
      groups: this.shouldShowClinician ? this.groups : null,
      isFilter: true,
      headingText: intl.patients.worklist.filtersApp.ownerFilterHeadingText,
      hasRoles: this.shouldShowRole,
      hasClinicians: this.shouldShowClinician,
    });

    this.listenTo(ownerFilter, 'change:owner', ({ id, type }) => {
      if (type === 'roles') {
        this.setState({ roleId: id, clinicianId: null });
      } else {
        this.setState({ clinicianId: id, roleId: null });
      }
    });

    this.showChildView('owner', ownerFilter);
  },
  _getGroups() {
    const groups = this.groups.clone();

    groups.unshift({
      id: null,
      name: intl.patients.worklist.filtersApp.allGroupsName,
    });

    return groups;
  },
});
