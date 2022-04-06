import { debounce, every, map } from 'underscore';
import Radio from 'backbone.radio';
import { View, CollectionView } from 'marionette';
import dayjs from 'dayjs';
import hbs from 'handlebars-inline-precompile';

import { alphaSort } from 'js/utils/sorting';
import words from 'js/utils/formatting/words';
import intl from 'js/i18n';

import 'sass/modules/list-pages.scss';
import 'sass/modules/table-list.scss';

import PreloadRegion from 'js/regions/preload_region';

import Tooltip from 'js/components/tooltip';

import { DetailsTooltip } from 'js/views/patients/shared/actions_views';

import LayoutTemplate from './layout.hbs';

import './schedule-list.scss';

const LayoutView = View.extend({
  className: 'flex-region',
  template: LayoutTemplate,
  regions: {
    filters: '[data-filters-region]',
    table: '[data-table-region]',
    list: {
      el: '[data-list-region]',
      regionClass: PreloadRegion,
    },
    selectAll: '[data-select-all-region]',
    title: '[data-title-region]',
    dateFilter: '[data-date-filter-region]',
    search: '[data-search-region]',
  },
});

const ScheduleTitleView = View.extend({
  template: hbs`
    <span class="list-page__title-icon">{{far "calendar-star"}}</span>{{formatMessage (intlGet "patients.schedule.scheduleViews.scheduleTitleView.title") owner=name}}{{~ remove_whitespace ~}}
    <span class="list-page__header-icon js-title-info">{{fas "info-circle"}}</span>
  `,
  ui: {
    tooltip: '.js-title-info',
  },
  onRender() {
    new Tooltip({
      message: intl.patients.schedule.scheduleViews.scheduleTitleView.tooltip,
      uiView: this,
      ui: this.ui.tooltip,
      orientation: 'vertical',
    });
  },
});

const SelectAllView = View.extend({
  tagName: 'button',
  className: 'button--checkbox',
  attributes() {
    if (this.getOption('isDisabled')) return { disabled: 'disabled' };
  },
  triggers: {
    'click': 'click',
  },
  getTemplate() {
    if (this.getOption('isSelectAll')) return hbs`{{fas "check-square"}}`;
    if (this.getOption('isSelectNone') || this.getOption('isDisabled')) return hbs`{{fal "square"}}`;

    return hbs`{{fas "minus-square"}}`;
  },
});

const TableHeaderView = View.extend({
  template: hbs`
    <td class="schedule-list__header schedule-list__header-due-date">{{ @intl.patients.schedule.scheduleViews.tableHeaderView.dueDateHeader }}</td>
    <td class="schedule-list__header schedule-list__header-state-patient">{{ @intl.patients.schedule.scheduleViews.tableHeaderView.statePatientHeader }}</td>
    <td class="schedule-list__header schedule-list__header-action">{{ @intl.patients.schedule.scheduleViews.tableHeaderView.actionHeader }}</td>
    <td class="schedule-list__header schedule-list__header-form">{{ @intl.patients.schedule.scheduleViews.tableHeaderView.formheader }}</td>
  `,
  tagName: 'tr',
});

const DayItemView = View.extend({
  tagName: 'tr',
  className: 'schedule-list__day-list-row',
  template: hbs`
    <td class="schedule-list__action-list-cell schedule-list__due-time {{#if isOverdue}}is-overdue{{/if}}">
      {{#unless isReduced}}<button class="button--checkbox u-margin--r-8 js-select">{{#if isSelected}}{{fas "check-square"}}{{else}}{{fal "square"}}{{/if}}</button>{{/unless}}
      {{#if due_time}}
        {{formatDateTime due_time "TIME" inputFormat="HH:mm:ss"}}&#8203;
      {{else}}
        <span class="schedule-list__no-time">{{ @intl.patients.schedule.scheduleViews.dayItemView.noTime }}</span>&#8203;
      {{/if}}
    </td>
    <td class="schedule-list__action-list-cell schedule-list__patient">
      <div class="schedule-list__state-patient">
        <span class="schedule-list__action-state action--{{ stateOptions.color }}">{{fa stateOptions.iconType stateOptions.icon}}</span><span class="schedule-list__search-helper">{{ state }}</span>&#8203;{{~ remove_whitespace ~}}
        <span class="schedule-list__patient-name js-patient">{{ patient.first_name }} {{ patient.last_name }}</span>&#8203;
      </div>
    </td>
    <td class="schedule-list__action-list-cell">
      <span class="schedule-list__action-name js-action">{{ name }}</span>&#8203;{{~ remove_whitespace ~}}
      <span class="schedule-list__search-helper">{{ flow }}</span>&#8203;{{~ remove_whitespace ~}}
    </td>
    <td class="schedule-list__action-list-cell schedule-list__action-details" data-details-region></td>
    <td class="schedule-list__action-list-cell schedule-list__action-form">
      {{#if form}}<span class="js-form schedule-list__action-form-icon">{{#if hasOutreach}}{{far "share-square"}}{{else}}{{far "poll-h"}}{{/if}}</span>{{/if}}
    </td>
  `,
  regions: {
    details: '[data-details-region]',
  },
  templateContext() {
    const state = this.model.getState();

    const isReduced = this.state.get('isReduced');

    return {
      isOverdue: this.model.isOverdue(),
      state: state.get('name'),
      stateOptions: state.get('options'),
      patient: this.model.getPatient().attributes,
      form: this.model.getForm(),
      isSelected: !isReduced && this.state.isSelected(this.model),
      flow: this.model.getFlow() && this.model.getFlow().get('name'),
      hasOutreach: this.model.hasOutreach(),
      isReduced: isReduced,
    };
  },
  ui: {
    'actionName': '.js-action',
  },
  triggers: {
    'click .js-form': 'click:form',
    'click .js-patient': 'click:patient',
    'click': 'click',
    'click .js-select': 'click:select',
  },
  initialize({ state }) {
    this.state = state;
    this.flow = this.model.getFlow();

    this.listenTo(state, {
      'select:all': this.render,
      'select:none': this.render,
    });
  },
  onRender() {
    this.showDetailsTooltip();
  },
  onClickSelect() {
    this.state.toggleSelected(this.model, !this.state.isSelected(this.model));
    this.render();
  },
  onClickPatient() {
    Radio.trigger('event-router', 'patient:dashboard', this.model.get('_patient'));
  },
  onClickForm() {
    Radio.trigger('event-router', 'form:patientAction', this.model.id, this.model.getForm().id);
  },
  onClick() {
    if (this.flow) {
      Radio.trigger('event-router', 'flow:action', this.flow.id, this.model.id);
      return;
    }

    Radio.trigger('event-router', 'patient:action', this.model.get('_patient'), this.model.id);
  },
  showDetailsTooltip() {
    if (!this.model.get('details') && !this.model.getFlow()) return;

    this.showChildView('details', new DetailsTooltip({ model: this.model }));
  },
});

const DayListView = CollectionView.extend({
  childView: DayItemView,
  childViewOptions() {
    return {
      state: this.state,
    };
  },
  tagName: 'tr',
  className: 'schedule-list__list-row',
  template: hbs`
    <td class="schedule-list__list-cell">
      <div class="schedule-list__row-header">
        <span class="schedule-list__date {{#if isToday}}is-today{{/if}}">{{formatDateTime date "D"}}</span>
        <span class="schedule-list__month-day">{{formatDateTime date "MMM, ddd"}}</span>
      </div>
      <div class="schedule-list__day-list">
        <table class="schedule-list__day-list-table w-100" data-actions-region></table>
      </div>
    </td>
  `,
  templateContext() {
    const date = dayjs(this.model.get('date'));
    const today = dayjs();

    return {
      isToday: date.isSame(today, 'day'),
    };
  },
  childViewContainer: '[data-actions-region]',
  viewComparator(viewA, viewB) {
    // nullVal of 24 to ensure null due_time is last in list and due_time never exceeds 23:59:59
    return alphaSort('asc', viewA.model.get('due_time'), viewB.model.get('due_time'), '24');
  },
  initialize({ state }) {
    this.state = state;

    this.listenTo(state, 'change:searchQuery', this.searchList);
  },
  childViewTriggers: {
    'render': 'listItem:render',
  },
  onListItemRender(view) {
    const date = dayjs(this.model.get('date'));
    view.searchString = `${ date.format('D') } ${ date.format('MMM, ddd') } ${ view.$el.text() }`;
  },
  searchList(state, searchQuery) {
    if (!searchQuery) {
      this.removeFilter();
      return;
    }

    const matchers = this._buildMatchers(searchQuery);

    this.setFilter(function({ searchString }) {
      return every(matchers, function(matcher) {
        return matcher.test(searchString);
      });
    });
  },
  _buildMatchers(searchQuery) {
    const searchWords = words(searchQuery);

    return map(searchWords, function(word) {
      word = RegExp.escape(word);

      return new RegExp(`\\b${ word }`, 'i');
    });
  },
});

const EmptyView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="table-empty-list">
      <h2>{{ @intl.patients.schedule.scheduleViews.emptyView.noScheduledActions }}</h2>
    </td>
  `,
});

const EmptyFindInListView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="table-empty-list">
      <h2>{{ @intl.patients.schedule.scheduleViews.emptyFindInListView.noResults }}</h2>
    </td>
  `,
});

const ScheduleListView = CollectionView.extend({
  tagName: 'table',
  className: 'schedule-list__table',
  childView: DayListView,
  childViewOptions(model) {
    if (!model) return;

    return {
      collection: model.get('actions'),
      state: this.state,
    };
  },
  childViewEvents: {
    'render:children': 'onChildFilter',
  },
  emptyView() {
    if (this.state.get('searchQuery')) {
      return EmptyFindInListView;
    }

    return EmptyView;
  },
  viewComparator(viewA, viewB) {
    return alphaSort('asc', viewA.model.get('date'), viewB.model.get('date'));
  },
  viewFilter(view) {
    if (this.state.get('searchQuery')) {
      return !view.isEmpty();
    }

    if (view.model.get('date') === 'null') {
      return false;
    }

    return true;
  },
  initialize({ state }) {
    this.state = state;
  },
  onRenderChildren() {
    this.setVisibleChildren();
  },
  onChildFilter: debounce(function() {
    this.filter();
  }, 10),
  setVisibleChildren() {
    const visibleActions = this.children.reduce((models, cv) => {
      return models.concat(cv.children.pluck('model'));
    }, []);
    this.triggerMethod('filtered', visibleActions);
  },
});

export {
  LayoutView,
  ScheduleTitleView,
  TableHeaderView,
  ScheduleListView,
  SelectAllView,
};
