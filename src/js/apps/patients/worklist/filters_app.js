import Radio from 'backbone.radio';

import intl from 'js/i18n';

import App from 'js/base/app';

import OwnerDroplist from 'js/views/patients/shared/components/owner_component';
import { FiltersView, GroupsDropList, ClinicianDropList, TypeToggleView, RoleComponent } from 'js/views/patients/worklist/filters_views';

export default App.extend({
  stateEvents: {
    'change:clinicianId': 'showFilters',
  },
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
    this.showTypeToggle();

    if (this.shouldShowClinician) {
      this.showCliniciansFilterView();
    }

    if (this.shouldShowRole) {
      this.showRolesFilterView();
    }

    if (!this.shouldShowClinician && !this.shouldShowRole) {
      this.showOwnerFilterView();
    }
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
  showTypeToggle() {
    const typeToggleView = new TypeToggleView({
      isFlowList: this.getState('type') === 'flows',
    });

    this.listenTo(typeToggleView, 'toggle:listType', type => {
      this.setState('type', type);
    });

    this.showChildView('toggle', typeToggleView);
  },
  showCliniciansFilterView() {
    const selected = Radio.request('entities', 'clinicians:model', this.getState('clinicianId'));

    const clinicianFilter = new ClinicianDropList({
      groups: this.groups,
      state: { selected },
    });

    this.listenTo(clinicianFilter, 'change:selected', ({ id }) => {
      this.setState('clinicianId', id);
    });

    this.showChildView('clinician', clinicianFilter);
  },
  showRolesFilterView() {
    const role = Radio.request('entities', 'roles:model', this.getState('roleId'));

    const roleFilter = new RoleComponent({ role });

    this.listenTo(roleFilter, 'change:selected', ({ id }) => {
      this.setState('roleId', id);
    });

    this.showChildView('role', roleFilter);
  },
  showOwnerFilterView() {
    const owner = this.getState('clinicianId') ?
      Radio.request('entities', 'clinicians:model', this.getState('clinicianId')) :
      Radio.request('entities', 'roles:model', this.getState('roleId'));

    const ownerFilter = new OwnerDroplist({
      owner,
      groups: this.groups,
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
