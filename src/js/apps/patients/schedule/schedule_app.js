import Radio from 'backbone.radio';

import App from 'js/base/app';

import intl, { renderTemplate } from 'js/i18n';

import StateModel from './schedule_state';
import FiltersStateModel from 'js/apps/patients/shared/filters_state';

import BulkEditActionsApp from 'js/apps/patients/sidebar/bulk-edit-actions_app';

import DateFilterComponent from 'js/views/patients/shared/components/date-filter';
import SearchComponent from 'js/views/shared/components/list-search';

import { CountView } from 'js/views/patients/shared/list_views';

import { LayoutView, ScheduleTitleView, TableHeaderView, SelectAllView, ScheduleListView, AllFiltersButtonView } from 'js/views/patients/schedule/schedule_views';
import { BulkEditButtonView, BulkEditActionsSuccessTemplate, BulkDeleteActionsSuccessTemplate } from 'js/views/patients/shared/bulk-edit/bulk-edit_views';

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
  },
  stateEvents: {
    'change:clinicianId change:dateFilters change:customFilters change:states change:flowStates': 'restart',
    'change:actionsSelected': 'onChangeSelected',
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
  onChangeSelected() {
    this.toggleBulkSelect();
  },
  onChangeSearchQuery(state) {
    this.currentSearchQuery = state.get('searchQuery');
  },
  initListState() {
    const storedState = this.getState().getStore();

    this.getState().setSearchQuery(this.currentSearchQuery);

    if (storedState) {
      this.setState(storedState);
      this.startFiltersApp();
      return;
    }

    const currentUser = Radio.request('bootstrap', 'currentUser');
    this.setState({ id: `schedule_${ currentUser.id }` });

    this.startFiltersApp({ setDefaults: true });
  },
  onBeforeStop() {
    this.collection = null;
    if (!this.isRestarting()) this.stopChildApp('filters');
  },
  onBeforeStart() {
    if (this.isRestarting()) {
      const filtersApp = this.getChildApp('filters');

      filtersApp.setState(this.getState().getFiltersState());

      this.getRegion('count').empty();

      this.getRegion('list').startPreloader();

      return;
    }

    this.initListState();

    this.setView(new LayoutView({
      isReduced: this.getState('isReduced'),
    }));

    this.showDisabledSelectAll();
    this.showSearchView();
    this.showTableHeaders();
    this.showScheduleTitle();
    this.showDateFilter();
    this.showFiltersButtonView();

    this.getRegion('list').startPreloader();

    this.showView();
  },
  beforeStart() {
    const filter = this.getState().getEntityFilter();
    const fields = { flows: ['name', 'state'] };
    return Radio.request('entities', 'fetch:actions:collection', { data: { filter, fields } });
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
  showList() {
    const scheduleListView = new ScheduleListView({
      collection: this.collection.groupByDate(),
      editableCollection: this.editableCollection,
      state: this.getState(),
    });

    this.listenTo(scheduleListView, {
      'filtered'(filtered) {
        this.filteredCollection.reset(filtered);
        this.editableCollection.reset(this._getListEditable(scheduleListView));
      },
      'change:canEdit'() {
        this.editableCollection.reset(this._getListEditable(scheduleListView));
      },
    });

    this.showChildView('list', scheduleListView);
  },
  _getListEditable(list) {
    return list.children.reduce((allModels, dayView) => {
      return dayView.children.reduce((models, { canEdit, model }) => {
        if (canEdit) models.push(model);
        return models;
      }, allModels);
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
    const app = this.startChildApp('bulkEditActions', {
      state: { collection: this.selected },
    });

    this.listenTo(app, {
      'save'(saveData) {
        const itemCount = this.selected.length;

        this.selected.save(saveData)
          .then(() => {
            Radio.request('alert', 'show:success', renderTemplate(BulkEditActionsSuccessTemplate, { itemCount }));
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
          this.showList();
        });
      },
    });
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
  showCountView() {
    const countView = new CountView({
      collection: this.collection,
      filteredCollection: this.filteredCollection,
    });

    this.showChildView('count', countView);
  },
  showDateFilter() {
    const dateTypes = ['due_date'];

    const dateFilterComponent = new DateFilterComponent({
      dateTypes,
      state: this.getState().getDateFilters(),
    });

    this.listenTo(dateFilterComponent.getState(), 'change', ({ attributes }) => {
      this.getState().setDateFilters(attributes);
    });

    this.showChildView('dateFilter', dateFilterComponent);
  },
  showTableHeaders() {
    const tableHeadersView = new TableHeaderView();

    this.showChildView('table', tableHeadersView);
  },
  showScheduleTitle() {
    const scheduleTitleView = new ScheduleTitleView({ model: this.getState() });

    this.listenTo(scheduleTitleView, 'change:owner', ({ id }) => {
      this.setState({ clinicianId: id });
    });

    this.showChildView('title', scheduleTitleView);
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
