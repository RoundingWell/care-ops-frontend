import { clone, extend, union } from 'underscore';

import store from 'store';

import Backbone from 'backbone';
import Radio from 'backbone.radio';

import intl, { renderTemplate } from 'js/i18n';

import App from 'js/base/app';

import StateModel from './worklist_state';

import FiltersApp from './filters_app';
import BulkEditActionsApp from 'js/apps/patients/sidebar/bulk-edit-actions_app';
import BulkEditFlowsApp from 'js/apps/patients/sidebar/bulk-edit-flows_app';

import DateFilterComponent from 'js/views/patients/shared/components/date-filter';
import SearchComponent from 'js/views/patients/shared/components/list-search';

import { ListView, SelectAllView, LayoutView, ListTitleView, TableHeaderView, SortDroplist, TypeToggleView, sortCreatedOptions, sortDueOptions, sortPatientOptions, sortUpdateOptions } from 'js/views/patients/worklist/worklist_views';
import { BulkEditButtonView, BulkEditFlowsSuccessTemplate, BulkEditActionsSuccessTemplate, BulkDeleteFlowsSuccessTemplate, BulkDeleteActionsSuccessTemplate } from 'js/views/patients/shared/bulk-edit/bulk-edit_views';

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
    bulkEditFlows: BulkEditFlowsApp,
  },
  stateEvents: {
    'change:listType change:filters change:actionsDateFilters change:flowsDateFilters': 'restart',
    'change:actionsSortId': 'onChangeStateSort',
    'change:flowsSortId': 'onChangeStateSort',
    'change:selectedFlows': 'onChangeSelected',
    'change:selectedActions': 'onChangeSelected',
  },
  onChangeStateSort() {
    this.getChildView('list').setComparator(this.getComparator());
  },
  onChangeSelected() {
    this.toggleBulkSelect();
  },
  initListState() {
    const currentUser = Radio.request('bootstrap', 'currentUser');
    const storedState = store.get(`${ this.worklistId }_${ currentUser.id }-v2`);
    const filters = this.getState('filters');

    // NOTE: Allows for new defaults to get added to stored filters
    if (storedState) storedState.filters = extend({}, filters, storedState.filters);

    this.setState(extend({ id: this.worklistId }, storedState));
  },
  onBeforeStart({ worklistId }) {
    if (this.isRestarting()) {
      this.showListTitle();
      this.showTypeToggleView();
      this.showSortDroplist();
      this.showTableHeaders();
      this.showDateFilter();
      this.getRegion('list').startPreloader();
      return;
    }

    this.worklistId = worklistId;
    this.initListState();

    this.showView(new LayoutView({
      worklistId: this.worklistId,
      state: this.getState(),
    }));

    this.getRegion('list').startPreloader();
    this.showDisabledSelectAll();
    this.showSortDroplist();
    this.showTableHeaders();
    this.showListTitle();
    this.showTypeToggleView();
    this.showSearchView();
    this.showDateFilter();
    this.startFiltersApp();
  },
  beforeStart() {
    const filter = this.getState().getEntityFilter();
    return Radio.request('entities', `fetch:${ this.getState().getType() }:collection`, { filter });
  },
  onStart(options, collection) {
    this.collection = collection;
    this.filteredCollection = collection.clone();

    const collectionView = new ListView({
      collection: this.collection,
      state: this.getState(),
      viewComparator: this.getComparator(),
    });

    this.listenTo(collectionView, 'filtered', filtered => {
      this.filteredCollection.reset(filtered);
      this.toggleBulkSelect();
    });

    this.showChildView('list', collectionView);

    this.showSearchView();
    this.toggleBulkSelect();
  },
  startFiltersApp() {
    const filtersApp = this.startChildApp('filters', {
      state: this.getState().getFilters(),
      shouldShowClinician: this.getState().id !== 'shared-by',
      shouldShowOwnerToggle: this.getState().id === 'shared-by',
      shouldShowRole: this.getState().id !== 'owned-by',
    });

    this.listenTo(filtersApp.getState(), 'change', ({ attributes }) => {
      this.setState({ filters: clone(attributes) });
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
  onClickBulkCancel() {
    this.getState().clearSelected();
  },
  onClickBulkEdit() {
    const appName = this.getState().isFlowType() ? 'bulkEditFlows' : 'bulkEditActions';

    const app = this.startChildApp(appName, {
      state: { collection: this.selected },
    });

    this.listenTo(app, {
      'applyOwner'(owner) {
        this.selected.applyOwner(owner);
      },
      'save'(saveData) {
        this.selected.save(saveData)
          .done(() => {
            this.showUpdateSuccess(this.selected.length);
            app.stop();
            this.getState().clearSelected();
          })
          .fail(() => {
            Radio.request('alert', 'show:error', intl.patients.worklist.worklistApp.bulkEditFailure);
            this.getState().clearSelected();
            this.restart();
          });
      },
      'delete'() {
        const itemCount = this.selected.length;

        this.selected.destroy().then(() => {
          this.showDeleteSuccess(itemCount);
          app.stop();
          this.getState().clearSelected();
        });
      },
    });
  },
  showDisabledSelectAll() {
    this.showChildView('selectAll', new SelectAllView({ isDisabled: true }));
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
  onClickBulkSelect() {
    if (this.selected.length === this.filteredCollection.length) {
      this.getState().clearSelected();
      return;
    }

    this.getState().selectAll(this.filteredCollection);
  },
  getComparator() {
    const sortId = this.getState().getSort();
    return this.sortOptions.get(sortId).get('comparator');
  },
  getSortOptions() {
    if (this.getState().isFlowType()) {
      return union(sortPatientOptions, sortCreatedOptions, sortUpdateOptions);
    }

    return union(sortPatientOptions, sortDueOptions, sortCreatedOptions, sortUpdateOptions);
  },
  showDeleteSuccess(itemCount) {
    if (this.getState().isFlowType()) {
      Radio.request('alert', 'show:success', renderTemplate(BulkDeleteFlowsSuccessTemplate, { itemCount }));
      return;
    }

    Radio.request('alert', 'show:success', renderTemplate(BulkDeleteActionsSuccessTemplate, { itemCount }));
  },
  showUpdateSuccess(itemCount) {
    if (this.getState().isFlowType()) {
      Radio.request('alert', 'show:success', renderTemplate(BulkEditFlowsSuccessTemplate, { itemCount }));
      return;
    }

    Radio.request('alert', 'show:success', renderTemplate(BulkEditActionsSuccessTemplate, { itemCount }));
  },
  showDateFilter() {
    if (this.getState().id !== 'shared-by' && this.getState().id !== 'owned-by') return;

    const state = this.getState();
    const dateTypes = state.isFlowType() ? ['created_at', 'updated_at'] : ['created_at', 'updated_at', 'due_date'];

    const dateFilterComponent = new DateFilterComponent({
      dateTypes,
      state: state.getDateFilters(),
      region: this.getRegion('dateFilter'),
    });

    this.listenTo(dateFilterComponent.getState(), {
      'change'({ attributes }) {
        state.setDateFilters(attributes);
      },
    });

    dateFilterComponent.show();
  },
  showSortDroplist() {
    this.sortOptions = new Backbone.Collection(this.getSortOptions());

    const sortSelect = new SortDroplist({
      collection: this.sortOptions,
      state: { selected: this.sortOptions.get(this.getState().getSort()) },
    });

    this.listenTo(sortSelect.getState(), 'change:selected', (state, selected) => {
      this.getState().setSort(selected.id);
    });

    this.showChildView('sort', sortSelect);
  },
  showTableHeaders() {
    const tableHeadersView = new TableHeaderView({
      isFlowList: this.getState().isFlowType(),
    });

    this.showChildView('table', tableHeadersView);
  },
  showListTitle() {
    const filters = this.getState().getFilters();
    const owner = Radio.request('entities', 'clinicians:model', filters.clinicianId);
    const role = Radio.request('entities', 'roles:model', filters.roleId);

    this.showChildView('title', new ListTitleView({
      owner,
      role,
      worklistId: this.worklistId,
      isFlowList: this.getState().isFlowType(),
    }));
  },
  showTypeToggleView() {
    const typeToggleView = new TypeToggleView({
      isFlowList: this.getState('listType') === 'flows',
    });

    this.listenTo(typeToggleView, 'toggle:listType', listType => {
      this.setState('listType', listType);
    });

    this.showChildView('toggle', typeToggleView);
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
  showBulkEditButtonView() {
    const bulkEditButtonView = this.showChildView('filters', new BulkEditButtonView({
      isFlowType: this.getState().isFlowType(),
      collection: this.selected,
    }));

    this.listenTo(bulkEditButtonView, {
      'click:cancel': this.onClickBulkCancel,
      'click:edit': this.onClickBulkEdit,
    });
  },
  setSearchState(state, searchQuery) {
    this.setState({
      searchQuery: searchQuery.length > 2 ? searchQuery : '',
    });
  },
});
