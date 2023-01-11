import { clone, extend } from 'underscore';
import Radio from 'backbone.radio';
import store from 'store';

import App from 'js/base/app';

import intl, { renderTemplate } from 'js/i18n';

import StateModel, { STATE_VERSION } from './schedule_state';

import FiltersApp from './filters_app';
import BulkEditActionsApp from 'js/apps/patients/sidebar/bulk-edit-actions_app';

import DateFilterComponent from 'js/views/patients/shared/components/date-filter';
import SearchComponent from 'js/views/shared/components/list-search';
import OwnerDroplist from 'js/views/patients/shared/components/owner_component';

import { LayoutView, ScheduleTitleView, TableHeaderView, SelectAllView, ScheduleListView } from 'js/views/patients/schedule/schedule_views';
import { BulkEditButtonView, BulkEditActionsSuccessTemplate, BulkDeleteActionsSuccessTemplate } from 'js/views/patients/shared/bulk-edit/bulk-edit_views';

export default App.extend({
  StateModel,
  childApps: {
    filters: {
      AppClass: FiltersApp,
      regionName: 'filters',
      restartWithParent: false,
      getOptions: ['currentClinician'],
    },
    bulkEditActions: BulkEditActionsApp,
  },
  stateEvents: {
    'change:filters change:clinicianId change:dateFilters change:states': 'restart',
    'change:selectedActions': 'onChangeSelected',
  },
  initListState() {
    const currentUser = Radio.request('bootstrap', 'currentUser');
    const storedState = store.get(`schedule_${ currentUser.id }-${ STATE_VERSION }`);

    this.setState({ id: `schedule_${ currentUser.id }` });

    if (storedState) {
      const filters = this.getState().getFilters();
      // NOTE: Allows for new defaults to get added to stored filters
      storedState.filters = extend({}, filters, storedState.filters);
      storedState.lastSelectedIndex = null;

      this.setState(storedState);

      return;
    }

    this.getState().setDefaultFilterStates();
  },
  onBeforeStart() {
    if (this.isRestarting()) {
      const isFiltersSidebarOpen = this.getState('isFiltering');

      if (!isFiltersSidebarOpen) Radio.request('sidebar', 'close');
      this.showScheduleTitle();
      this.showDateFilter();
      this.getRegion('list').startPreloader();
      return;
    }

    this.initListState();

    const currentClinician = Radio.request('bootstrap', 'currentUser');
    this.canViewAssignedActions = currentClinician.can('app:schedule:clinician_filter');
    this.groups = currentClinician.getGroups();

    this.showView(new LayoutView({
      state: this.getState(),
    }));

    this.getRegion('list').startPreloader();

    this.showScheduleTitle();
    this.showSearchView();
    this.showDisabledSelectAll();
    this.startFiltersApp();
    this.showDateFilter();
    this.showTableHeaders();
  },
  beforeStart() {
    const filter = this.getState().getEntityFilter();
    return Radio.request('entities', 'fetch:actions:collection', { filter });
  },
  onStart(options, collection) {
    this.collection = collection;
    this.filteredCollection = collection.clone();

    this.showScheduleList();
    this.showSearchView();
    this.toggleBulkSelect();
  },
  onChangeSelected() {
    this.toggleBulkSelect();
  },
  onClickBulkSelect() {
    if (this.selected.length === this.filteredCollection.length) {
      this.getState().clearSelected();
      return;
    }

    this.getState().selectMultiple(this.filteredCollection.map('id'));
  },
  onClickBulkEdit() {
    const app = this.startChildApp('bulkEditActions', {
      state: { collection: this.selected },
    });

    this.listenTo(app, {
      'save'(saveData) {
        this.selected.save(saveData)
          .then(() => {
            Radio.request('alert', 'show:success', renderTemplate(BulkEditActionsSuccessTemplate, { itemCount: this.selected.length }));
            app.stop();

            if (saveData.due_date && this.selected.some(action => action.changed.due_date)) {
              this.getState().clearSelected();
              this.restart();
              return;
            }

            this.getState().clearSelected();
          })
          .catch(() => {
            Radio.request('alert', 'show:error', intl.patients.schedule.scheduleApp.bulkEditFailure);
            this.getState().clearSelected();
            this.restart();
          });
      },
      'delete'() {
        const itemCount = this.selected.length;
        this.selected.destroy().then(() => {
          Radio.request('alert', 'show:success', renderTemplate(BulkDeleteActionsSuccessTemplate, { itemCount }));
          app.stop();
          this.getState().clearSelected();
          this.showScheduleList();
        });
      },
    });
  },
  onClickBulkCancel() {
    this.getState().clearSelected();
  },
  showScheduleList() {
    const collectionView = new ScheduleListView({
      collection: this.collection.groupByDate(),
      state: this.getState(),
      originalCollection: this.collection.clone(),
    });

    this.listenTo(collectionView, 'filtered', filtered => {
      this.filteredCollection.reset(filtered);
      this.toggleBulkSelect();
    });

    this.showChildView('list', collectionView);
  },
  showScheduleTitle() {
    const clinicianId = this.getState('clinicianId');
    const owner = Radio.request('entities', 'clinicians:model', clinicianId);

    const scheduleTitleView = this.showChildView('title', new ScheduleTitleView({
      model: owner,
      showOwnerDroplist: this.canViewAssignedActions,
    }));

    if (this.canViewAssignedActions) this.showOwnerDroplist(scheduleTitleView, owner);
  },
  showOwnerDroplist(scheduleTitleView, owner) {
    const ownerDroplistView = new OwnerDroplist(this.getOwnerFilterOptions(owner));

    this.listenTo(ownerDroplistView, {
      'change:owner'({ id }) {
        this.setState({ clinicianId: id });
      },
    });

    scheduleTitleView.showChildView('owner', ownerDroplistView);
  },
  getOwnerFilterOptions(owner) {
    const options = {
      owner: owner,
      groups: this.groups,
      isTitleFilter: true,
      headingText: intl.patients.schedule.filtersApp.ownerFilterHeadingText,
      hasTeams: false,
      align: 'right',
    };

    return options;
  },
  showSearchView() {
    const searchComponent = this.showChildView('search', new SearchComponent({
      state: {
        query: this.getState('searchQuery'),
        isDisabled: !this.collection || !this.collection.length,
      },
    }));

    this.listenTo(searchComponent.getState(), 'change:query', this.setSearchState);
  },
  startFiltersApp() {
    const state = this.getState();
    const filtersApp = this.startChildApp('filters', {
      state: state.getFiltersState(),
      availableStates: state.getAvailableStates(),
    });

    const filtersState = filtersApp.getState();
    this.listenTo(filtersState, 'change', () => {
      this.setState(filtersState.getFiltersState());
    });

    this.listenTo(filtersApp, 'toggle:filtersSidebar', isSidebarOpen => {
      this.setState('isFiltering', isSidebarOpen);
    });
  },
  showDateFilter() {
    const dateTypes = ['due_date'];

    const dateFilterComponent = new DateFilterComponent({
      dateTypes,
      state: this.getState().getDateFilters(),
      region: this.getRegion('dateFilter'),
    });

    this.listenTo(dateFilterComponent.getState(), {
      'change'({ attributes }) {
        this.setState({ dateFilters: clone(attributes) });
      },
    });

    dateFilterComponent.show();
  },
  showTableHeaders() {
    const tableHeadersView = new TableHeaderView();

    this.showChildView('table', tableHeadersView);
  },
  showSelectAll() {
    if (!this.filteredCollection.length) {
      this.showDisabledSelectAll();
      return;
    }
    const isSelectAll = this.selected.length === this.filteredCollection.length;
    const isSelectNone = !this.selected.length;
    const selectAllView = new SelectAllView({
      isSelectAll,
      isSelectNone,
    });

    this.listenTo(selectAllView, 'click', this.onClickBulkSelect);

    this.showChildView('selectAll', selectAllView);
  },
  showDisabledSelectAll() {
    this.showChildView('selectAll', new SelectAllView({ isDisabled: true }));
  },
  showBulkEditButtonView() {
    const bulkEditButtonView = this.showChildView('filters', new BulkEditButtonView({
      collection: this.selected,
    }));

    this.listenTo(bulkEditButtonView, {
      'click:cancel': this.onClickBulkCancel,
      'click:edit': this.onClickBulkEdit,
    });
  },
  toggleBulkSelect() {
    this.selected = this.getState().getSelected(this.filteredCollection);

    this.showSelectAll();

    if (this.selected.length) {
      this.getChildApp('filters').stop();
      this.showBulkEditButtonView();
      return;
    }

    this.startFiltersApp();
  },
  setSearchState(state, searchQuery) {
    this.setState({
      searchQuery: searchQuery.length > 2 ? searchQuery : '',
      lastSelectedIndex: null,
    });
  },
});
