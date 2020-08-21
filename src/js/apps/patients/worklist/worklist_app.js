import _ from 'underscore';
import moment from 'moment';
import store from 'store';

import Backbone from 'backbone';
import Radio from 'backbone.radio';

import intl, { renderTemplate } from 'js/i18n';

import App from 'js/base/app';

import FiltersApp from './filters_app';
import BulkEditActionsApp from './sidebar/bulk-edit-actions_app';
import BulkEditFlowsApp from './sidebar/bulk-edit-flows_app';

import { ListView, SelectAllView, LayoutView, ListTitleView, TableHeaderView, SortDroplist, sortDueOptions, sortUpdateOptions } from 'js/views/patients/worklist/worklist_views';
import { BulkEditButtonView, BulkEditFlowsSuccessTemplate, BulkEditActionsSuccessTemplate, BulkDeleteFlowsSuccessTemplate, BulkDeleteActionsSuccessTemplate } from 'js/views/patients/worklist/bulk-edit/bulk-edit_views';

const StateModel = Backbone.Model.extend({
  defaults() {
    return {
      actionsSortId: 'sortUpdateDesc',
      flowsSortId: 'sortUpdateDesc',
      filters: {
        type: 'flows',
        groupId: null,
        clinicianId: this.currentClinician.id,
        roleId: this.currentClinician.getRole().id,
      },
      selectedActions: {},
      selectedFlows: {},
    };
  },
  preinitialize() {
    this.currentClinician = Radio.request('bootstrap', 'currentUser');
    this.groups = this.currentClinician.getGroups();
  },
  initialize() {
    this.on('change', this.onChange);
  },
  onChange() {
    store.set(`${ this.id }_${ this.currentClinician.id }`, this.attributes);
  },
  getFilters() {
    return _.clone(this.get('filters'));
  },
  getType() {
    return this.getFilters().type;
  },
  isFlowType() {
    return this.getType() === 'flows';
  },
  getSort() {
    return this.get(`${ this.getType() }SortId`);
  },
  setSort(sortId) {
    this.set(`${ this.getType() }SortId`, sortId);
  },
  getEntityFilter() {
    const { groupId, clinicianId, roleId } = this.getFilters();
    const group = groupId || this.groups.pluck('id').join(',');
    const status = 'queued,started';

    const filters = {
      'owned-by': { clinician: clinicianId, status, group },
      'shared-by': {
        role: roleId,
        status,
        group,
      },
      'new-past-day': {
        created_since: moment().subtract(24, 'hours').format(),
        status,
        group,
      },
      'updated-past-three-days': {
        updated_since: moment().startOf('day').subtract(3, 'days').format(),
        status,
        group,
      },
      'done-last-thirty-days': {
        updated_since: moment().startOf('day').subtract(30, 'days').format(),
        status: 'done',
        group,
      },
    };

    return filters[this.id];
  },
  getSelectedList() {
    return this.isFlowType() ? this.get('selectedFlows') : this.get('selectedActions');
  },
  toggleSelected(model, isSelected) {
    const listName = this.isFlowType() ? 'selectedFlows' : 'selectedActions';
    const list = _.clone(this.get(listName));

    this.set(listName, _.extend(list, {
      [model.id]: isSelected,
    }));
  },
  isSelected(model) {
    const list = this.getSelectedList();

    return list[model.id];
  },
  getSelected(collection) {
    const list = this.getSelectedList();
    const collectionSelected = _.reduce(_.keys(list), (selected, item) => {
      if (list[item] && collection.get(item)) {
        selected.push({
          id: item,
        });
      }

      return selected;
    }, []);

    return Radio.request('entities', `${ this.getType() }:collection`, collectionSelected);
  },
  clearSelected() {
    const listName = this.isFlowType() ? 'selectedFlows' : 'selectedActions';

    this.set(listName, {});
    this.trigger('select:none');
  },
  selectAll(collection) {
    const listName = this.isFlowType() ? 'selectedFlows' : 'selectedActions';

    const list = collection.reduce((selected, model) => {
      selected[model.id] = true;
      return selected;
    }, {});

    this.set(listName, list);

    this.trigger('select:all');
  },
});

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
    'change:filters': 'restart',
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
    const storedState = store.get(`${ this.worklistId }_${ currentUser.id }`);
    this.setState(_.extend({ id: this.worklistId }, storedState));
  },
  onBeforeStart({ worklistId }) {
    if (this.isRestarting()) {
      this.showListTitle();
      this.showSortDroplist();
      this.showTableHeaders();
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
    this.startFiltersApp();
  },
  beforeStart() {
    const filter = this.getState().getEntityFilter();
    return Radio.request('entities', `fetch:${ this.getState().getType() }:collection`, { filter });
  },
  onStart(options, collection) {
    this.collection = collection;

    const collectionView = new ListView({
      collection: this.collection,
      state: this.getState(),
      viewComparator: this.getComparator(),
    });

    this.showChildView('list', collectionView);

    this.toggleBulkSelect();
  },
  startFiltersApp() {
    const filtersApp = this.startChildApp('filters', {
      state: this.getState().getFilters(),
      shouldShowClinician: this.getState().id === 'owned-by',
      shouldShowRole: this.getState().id === 'shared-by',
    });

    this.listenTo(filtersApp.getState(), 'change', ({ attributes }) => {
      this.setState({ filters: _.clone(attributes) });
    });
  },
  toggleBulkSelect() {
    this.selected = this.getState().getSelected(this.collection);

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
    if (!this.collection.length) {
      this.showDisabledSelectAll();
      return;
    }
    const isSelectAll = this.selected.length === this.collection.length;
    const selectAllView = new SelectAllView({ isSelectAll });

    this.listenTo(selectAllView, 'click', this.onClickBulkSelect);

    this.showChildView('selectAll', selectAllView);
  },
  onClickBulkSelect() {
    if (this.selected.length === this.collection.length) {
      this.getState().clearSelected();
      return;
    }

    this.getState().selectAll(this.collection);
  },
  getComparator() {
    const sortId = this.getState().getSort();
    return this.sortOptions.get(sortId).get('comparator');
  },
  getSortOptions() {
    if (this.getState().isFlowType()) {
      return sortUpdateOptions;
    }

    return _.union(sortDueOptions, sortUpdateOptions);
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
});
