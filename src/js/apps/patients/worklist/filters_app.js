import Radio from 'backbone.radio';

import intl from 'js/i18n';

import App from 'js/base/app';

import OwnerDroplist from 'js/views/patients/shared/components/owner_component';
import { FiltersView, GroupsDropList, NoOwnerToggleView } from 'js/views/patients/worklist/filters_views';

const i18n = intl.patients.worklist.filtersApp;

export default App.extend({
  onStart({ shouldShowClinician, shouldShowTeam, shouldShowOwnerToggle }) {
    const currentClinician = Radio.request('bootstrap', 'currentUser');
    this.canViewAssignedActions = currentClinician.can('app:worklist:clinician_filter');
    this.shouldShowClinician = shouldShowClinician;
    this.shouldShowTeam = shouldShowTeam;
    this.shouldShowOwnerToggle = shouldShowOwnerToggle;
    this.currentClinician = Radio.request('bootstrap', 'currentUser');
    this.groups = this.currentClinician.getGroups();

    this.showView(new FiltersView());
    this.showFilters();
  },
  showFilters() {
    this.showGroupsFilterView();
    this.showOwnerFilterView();
    this.showOwnerToggleView();
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
  getOwnerFilterOpts() {
    const owner = this.shouldShowClinician && this.getState('clinicianId') ?
      Radio.request('entities', 'clinicians:model', this.getState('clinicianId')) :
      Radio.request('entities', 'teams:model', this.getState('teamId'));

    const opts = {
      owner,
      groups: this.shouldShowClinician && this.canViewAssignedActions ? this.groups : null,
      isFilter: true,
      headingText: this.shouldShowClinician ? i18n.ownerFilterHeadingText : i18n.teamsFilterHeadingText,
      hasTeams: this.shouldShowTeam,
      hasCurrentClinician: this.shouldShowClinician,
    };

    if (!this.shouldShowClinician) opts.placeholderText = i18n.teamsFilterPlaceholderText;

    return opts;
  },
  showOwnerFilterView() {
    if (!(this.shouldShowClinician && this.canViewAssignedActions) && !this.shouldShowTeam) return;

    const ownerFilter = new OwnerDroplist(this.getOwnerFilterOpts());

    this.listenTo(ownerFilter, 'change:owner', ({ id, type }) => {
      if (type === 'teams') {
        this.setState({ teamId: id, clinicianId: null });
      } else {
        this.setState({ clinicianId: id, teamId: null });
      }
    });

    this.showChildView('owner', ownerFilter);
  },
  showOwnerToggleView() {
    if (!this.shouldShowOwnerToggle || !this.canViewAssignedActions) return;

    const ownerView = this.showChildView('ownerToggle', new NoOwnerToggleView({
      model: this.getState(),
    }));

    this.listenTo(ownerView, 'click', () => {
      this.toggleState('noOwner');
    });
  },
  _getGroups() {
    const groups = this.groups.clone();

    groups.unshift({
      id: null,
      name: i18n.allGroupsName,
    });

    return groups;
  },
});
