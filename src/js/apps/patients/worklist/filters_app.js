import { clone } from 'underscore';

import Radio from 'backbone.radio';

import intl from 'js/i18n';

import App from 'js/base/app';

import OwnerDroplist from 'js/views/patients/shared/components/owner_component';
import { FiltersView, GroupsDropList, TypeToggleView, DateFilterComponent } from 'js/views/patients/worklist/filters/filters_views';

export default App.extend({
  onStart({ shouldShowClinician, shouldShowRole, shouldShowDate }) {
    this.shouldShowClinician = shouldShowClinician;
    this.shouldShowRole = shouldShowRole;
    this.shouldShowDate = shouldShowDate;
    this.currentClinician = Radio.request('bootstrap', 'currentUser');
    this.groups = this.currentClinician.getGroups();

    this.showView(new FiltersView());
    this.showFilters();
  },
  showFilters() {
    this.showGroupsFilterView();
    this.showTypeToggle();
    this.showOwnerFilterView();

    if (this.shouldShowDate) {
      this.showDateFilterView();
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
  showDateFilterView() {
    const dateFilterComponent = new DateFilterComponent({
      state: this.getState().pick('selectedDate', 'selectedMonth', 'relativeDate', 'dateType'),
      region: this.getRegion('date'),
    });

    this.listenTo(dateFilterComponent.getState(), {
      'change'({ attributes }) {
        this.setState(clone(attributes));
      },
    });

    dateFilterComponent.show();
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
