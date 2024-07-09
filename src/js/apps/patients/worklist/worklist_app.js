import Radio from 'backbone.radio';

import intl, { renderTemplate } from 'js/i18n';

import App from 'js/base/app';

import StateModel from './worklist_state';
import FiltersStateModel from 'js/apps/patients/shared/filters_state';

import BulkEditActionsApp from 'js/apps/patients/sidebar/bulk-edit-actions_app';
import BulkEditFlowsApp from 'js/apps/patients/sidebar/bulk-edit-flows_app';

import DateFilterComponent from 'js/views/patients/shared/components/date-filter';
import SearchComponent from 'js/views/shared/components/list-search';
import { CountView } from 'js/views/patients/shared/list_views';

import { getSortOptions } from './worklist_sort';

import { ListView, SelectAllView, LayoutView, ListTitleView, TableHeaderView, SortDroplist, TypeToggleView, AllFiltersButtonView } from 'js/views/patients/worklist/worklist_views';
import { BulkEditButtonView, BulkEditFlowsSuccessTemplate, BulkEditActionsSuccessTemplate, BulkDeleteFlowsSuccessTemplate, BulkDeleteActionsSuccessTemplate } from 'js/views/patients/shared/bulk-edit/bulk-edit_views';

const FiltersApp = App.extend({
  StateModel: FiltersStateModel,
});

export default App.extend({
  StateModel,
  childApps: {
    filters: {
      AppClass: FiltersApp,
      restartWithParent: false,
    },
    bulkEditActions: BulkEditActionsApp,
    bulkEditFlows: BulkEditFlowsApp,
  },
  stateEvents: {
    'change:listType change:clinicianId change:teamId change:noOwner': 'restart',
    'change:customFilters change:states change:flowStates': 'restart',
    'change:actionsDateFilters change:flowsDateFilters': 'restart',
    'change:actionsSortId change:flowsSortId': 'onChangeStateSort',
    'change:actionsSelected change:flowsSelected': 'onChangeSelected',
    'change:searchQuery': 'onChangeSearchQuery',
  },
  startFiltersApp({ setDefaults } = {}) {
    const filtersApp = this.startChildApp('filters', { state: this.getState().getFiltersState() });

    const filterState = filtersApp.getState();

    filtersApp.listenTo(filterState, 'change', () => {
      this.setState(filterState.getFiltersState());
    });

    if (setDefaults) filterState.setDefaultFilterStates();

    this.setState(filterState.getFiltersState());
  },
  onChangeStateSort() {
    if (!this.isRunning()) return;

    this.getChildView('list').setComparator(this.getComparator());
  },
  onChangeSelected() {
    this.toggleBulkSelect();
  },
  onChangeSearchQuery(state) {
    this.currentSearchQuery = state.get('searchQuery');
  },
  initListState() {
    const storedState = this.getState().getStore(this.worklistId);

    this.getState().setSearchQuery(this.currentSearchQuery);

    if (storedState) {
      this.setState(storedState);
      this.getState().setClinicianId(this.clinicianId);
      this.startFiltersApp();
      return;
    }

    this.setState({ id: this.worklistId });

    this.getState().setClinicianId(this.clinicianId);

    this.startFiltersApp({ setDefaults: true });
  },
  onBeforeStop() {
    this.collection = null;
    if (!this.isRestarting()) this.stopChildApp('filters');
  },
  onBeforeStart({ worklistId, clinicianId }) {
    if (this.isRestarting()) {
      const filtersApp = this.getChildApp('filters');

      filtersApp.setState(this.getState().getFiltersState());

      this.getRegion('count').empty();

      this.showTypeViews();
      this.getRegion('list').startPreloader();

      return;
    }

    this.worklistId = worklistId;
    this.clinicianId = clinicianId;
    this.initListState();

    this.setView(new LayoutView());

    this.showDisabledSelectAll();
    this.showSearchView();
    this.showFiltersButtonView();

    this.showTypeViews();
    this.getRegion('list').startPreloader();

    this.showView();
  },
  beforeStart() {
    const listType = this.getState().getType();

    const data = {
      filter: this.getState().getEntityFilter(),
      include: this.sortOptions.getInclude(),
    };

    if (listType === 'actions') {
      data.fields = { flows: ['name', 'state'] };
    }

    return Radio.request('entities', `fetch:${ listType }:collection`, { data });
  },
  onStart(options, collection) {
    this.collection = collection;
    this.filteredCollection = collection.clone();
    this.editableCollection = collection.clone();

    this.listenTo(this.filteredCollection, 'reset', this.showCountView);
    this.showCountView();

    this.listenTo(this.editableCollection, 'reset', this.toggleBulkSelect);
    this.toggleBulkSelect();

    this.showList();
  },
  // NOTE: Shows views dependent on getState().getType()
  showTypeViews() {
    this.showListTitle();
    this.showTypeToggleView();
    this.showDateFilter();
    this.showSortDroplist();
    this.showTableHeaders();
  },
  showList() {
    const collectionView = new ListView({
      collection: this.collection,
      editableCollection: this.editableCollection,
      state: this.getState(),
      viewComparator: this.getComparator(),
    });

    this.listenTo(collectionView, {
      'filtered'(filtered) {
        this.filteredCollection.reset(filtered);
        this.editableCollection.reset(this._getListEditable(collectionView));
      },
      'change:canEdit'() {
        this.editableCollection.reset(this._getListEditable(collectionView));
      },
      'click:patientSidebarButton'({ model }) {
        const sidebar = Radio.request('sidebar', 'start', 'patient', { patient: model.getPatient() });
        collectionView.on('destroy', () => sidebar.stop());
      },
    });

    this.showChildView('list', collectionView);
  },
  _getListEditable(list) {
    return list.children.reduce((models, { canEdit, model }) => {
      if (canEdit) models.push(model);
      return models;
    }, []);
  },
  showFiltersButtonView() {
    const filtersApp = this.getChildApp('filters');
    const filtersState = filtersApp.getState();

    const filtersButtonView = new AllFiltersButtonView({
      model: filtersState,
    });

    this.listenTo(filtersButtonView, 'click', () => {
      Radio.request('sidebar', 'start', 'filters', { filtersState });
    });

    this.showChildView('filters', filtersButtonView);
  },
  toggleBulkSelect() {
    this.selected = this.getState().getSelected(this.editableCollection);

    this.showSelectAll();

    if (this.selected.length) {
      this.showBulkEditButtonView();
      return;
    }

    this.showFiltersButtonView();
  },
  showBulkEditButtonView() {
    const bulkEditButtonView = new BulkEditButtonView({
      isFlowType: this.getState().isFlowType(),
      collection: this.selected,
    });

    this.listenTo(bulkEditButtonView, {
      'click:cancel': this.onClickBulkCancel,
      'click:edit': this.onClickBulkEdit,
    });

    this.showChildView('filters', bulkEditButtonView);
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
        const itemCount = this.selected.length;

        this.selected.save(saveData)
          .then(() => {
            this.showUpdateSuccess(itemCount);
            app.stop();
            this.getState().clearSelected();
          })
          .catch(() => {
            Radio.request('alert', 'show:error', intl.patients.worklist.worklistApp.bulkEditFailure);
            this.getState().clearSelected();
            this.restart();
          });
      },
      'delete'() {
        const itemCount = this.selected.length;

        this.selected.destroy()
          .then(() => {
            this.showDeleteSuccess(itemCount);
            app.stop();
            this.getState().clearSelected();
          });
      },
    });
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
  showDisabledSelectAll() {
    this.showChildView('selectAll', new SelectAllView({ isDisabled: true }));
  },
  showSelectAll() {
    if (!this.editableCollection.length) {
      this.showDisabledSelectAll();
      return;
    }

    const selectAllView = new SelectAllView({
      isSelectAll: this.selected.length === this.editableCollection.length,
      isSelectNone: !this.selected.length,
    });

    this.listenTo(selectAllView, 'click', this.onClickBulkSelect);

    this.showChildView('selectAll', selectAllView);
  },
  onClickBulkSelect() {
    if (this.selected.length === this.editableCollection.length) {
      this.getState().clearSelected();
      return;
    }

    this.getState().selectMultiple(this.editableCollection.map('id'));
  },
  getSortOption(sortId) {
    const opt = this.sortOptions.get(sortId);

    if (!opt) {
      const stateDefaults = this.getState().defaults();
      const defaultSortId = stateDefaults[`${ this.getState().getType() }SortId`];

      return this.sortOptions.get(defaultSortId);
    }

    return opt;
  },
  getComparator() {
    const sortId = this.getState().getSort();
    return this.getSortOption(sortId).getComparator();
  },
  showCountView() {
    const countView = new CountView({
      isFlowList: this.getState().isFlowType(),
      collection: this.collection,
      filteredCollection: this.filteredCollection,
    });

    this.showChildView('count', countView);
  },
  showDateFilter() {
    if (this.getState().getStaticDateFilter()) return;

    const dateTypes = this.getState().isFlowType() ? ['created_at', 'updated_at'] : ['created_at', 'updated_at', 'due_date'];

    const dateFilterComponent = new DateFilterComponent({
      dateTypes,
      state: this.getState().getDateFilters(),
    });

    this.listenTo(dateFilterComponent.getState(), 'change', ({ attributes }) => {
      this.getState().setDateFilters(attributes);
    });

    this.showChildView('dateFilter', dateFilterComponent);
  },
  showSortDroplist() {
    this.sortOptions = getSortOptions(this.getState().getType());

    const sortSelect = new SortDroplist({
      collection: this.sortOptions,
      state: { selected: this.getSortOption(this.getState().getSort()) },
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
    const listTitleView = new ListTitleView({ model: this.getState() });

    this.listenTo(listTitleView, {
      'change:owner'({ id, type }) {
        if (type === 'teams') {
          this.setState({ teamId: id, clinicianId: null });
        } else {
          this.setState({ clinicianId: id, teamId: null });
        }
      },
      'toggle:noOwner'() {
        this.toggleState('noOwner');
      },
    });

    this.showChildView('title', listTitleView);
  },
  showTypeToggleView() {
    const typeToggleView = new TypeToggleView({
      isFlowList: this.getState().isFlowType(),
    });

    this.listenTo(typeToggleView, 'toggle:listType', listType => {
      this.getState().setType(listType);
    });

    this.showChildView('toggle', typeToggleView);
  },
  showSearchView() {
    const searchComponent = new SearchComponent({
      state: {
        query: this.getState('searchQuery'),
      },
    });

    this.listenTo(searchComponent.getState(), 'change:query', (state, searchQuery) => {
      this.getState().setSearchQuery(searchQuery);
    });

    this.showChildView('search', searchComponent);
  },
});
