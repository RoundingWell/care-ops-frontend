import Radio from 'backbone.radio';
import { View, CollectionView } from 'marionette';
import dayjs from 'dayjs';
import hbs from 'handlebars-inline-precompile';

import { alphaSort } from 'js/utils/sorting';
import intl, { renderTemplate } from 'js/i18n';

import 'sass/modules/list-pages.scss';
import 'sass/modules/table-list.scss';

import PreloadRegion from 'js/regions/preload_region';

import Tooltip from 'js/components/tooltip';

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
  },
});

const ScheduleTitleView = View.extend({
  template: hbs`
    {{formatMessage (intlGet "patients.schedule.scheduleViews.scheduleTitleView.title") owner=name}}{{~ remove_whitespace ~}}
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

const TableHeaderView = View.extend({
  template: hbs`
    <td class="schedule-list__header w-25">{{ @intl.patients.schedule.scheduleViews.tableHeaderView.dueDateHeader }}</td>
    <td class="schedule-list__header w-50">{{ @intl.patients.schedule.scheduleViews.tableHeaderView.metaHeader }}</td>
    <td class="schedule-list__header w-10">{{ @intl.patients.schedule.scheduleViews.tableHeaderView.formheader }}</td>
    <td class="schedule-list__header w-15">{{ @intl.patients.schedule.scheduleViews.tableHeaderView.ownerHeader }}</td>
  `,
  tagName: 'tr',
});

const DayItemView = View.extend({
  tagName: 'tr',
  className: 'schedule-list__day-list-row',
  template: hbs`
    <td class="schedule-list__action-list-cell w-15 {{#if isOverdue}}is-overdue{{/if}}">
      {{#if due_time}}
        {{formatDateTime due_time "TIME" inputFormat="HH:mm:ss"}}
      {{else}}
        <span class="schedule-list__no-time">{{ @intl.patients.schedule.scheduleViews.dayItemView.noTime }}</span>
      {{/if}}
    </td>
    <td class="schedule-list__action-list-cell schedule-list__action-meta">
      <span class="schedule-list__action-state action--{{ stateOptions.color }}">{{fa stateOptions.iconType stateOptions.icon}}</span>{{~ remove_whitespace ~}}
      <span class="schedule-list__patient-name js-patient">{{ patient.first_name }} {{ patient.last_name }}</span>{{~ remove_whitespace ~}}
      <span class="schedule-list__action-name js-action">{{ name }}</span>
    </td>
    <td class="schedule-list__action-list-cell schedule-list__action-form">{{#if form}}<span class="js-form schedule-list__action-form-icon">{{far "poll-h"}}</span>{{/if}}</td>
    <td class="schedule-list__action-list-cell schedule-list__action-owner ">{{ owner.name }}</td>
  `,
  templateContext() {
    return {
      isOverdue: this.model.isOverdue(),
      stateOptions: this.model.getState().get('options'),
      patient: this.model.getPatient().attributes,
      form: this.model.getForm(),
      owner: this.model.getOwner().attributes,
    };
  },
  ui: {
    'actionName': '.js-action',
  },
  triggers: {
    'click .js-form': 'click:form',
    'click .js-patient': 'click:patient',
    'click .js-action': 'click:action',
  },
  initialize() {
    this.flow = this.model.getFlow();
  },
  onRender() {
    const template = hbs`
      {{#if flowName}}<p class="action-tooltip__flow"><span class="action-tooltip__flow-icon">{{fas "folder"}}</span>{{ flowName }}</p>{{/if}}
      <p><span class="action-tooltip__action-icon">{{far "file-alt"}}</span><span class="action-tooltip__action-name">{{ name }}</span></p>
    `;

    new Tooltip({
      className: 'tooltip tooltip--wide',
      messageHtml: renderTemplate(template, {
        name: this.model.get('name'),
        flowName: this.flow ? this.flow.get('name') : null,
      }),
      uiView: this,
      ui: this.ui.actionName,
    });
  },
  onClickPatient() {
    Radio.trigger('event-router', 'patient:dashboard', this.model.get('_patient'));
  },
  onClickForm() {
    Radio.trigger('event-router', 'form:patientAction', this.model.id, this.model.getForm().id);
  },
  onClickAction() {
    if (this.flow) {
      Radio.trigger('event-router', 'flow:action', this.flow.id, this.model.id);
      return;
    }

    Radio.trigger('event-router', 'patient:action', this.model.get('_patient'), this.model.id);
  },
});

const DayListView = CollectionView.extend({
  childView: DayItemView,
  tagName: 'tr',
  className: 'schedule-list__list-row',
  template: hbs`
    <td class="schedule-list__list-cell">
      <div class="schedule-list__row-header">
        <span class="schedule-list__date {{#if isToday}}is-today{{/if}}">{{formatDateTime date "D"}}</span>
        <span class="schedule-list__month-day">{{formatDateTime date "MMM, ddd"}}</span>
      </div>
      <div class="schedule-list__day-list">
        <table class="w-100" data-actions-region></table>
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
});

const EmptyView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="table-empty-list">
      <h2>{{ @intl.patients.schedule.scheduleViews.emptyView.noScheduledActions }}</h2>
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
    };
  },
  emptyView: EmptyView,
  viewComparator(viewA, viewB) {
    return alphaSort('asc', viewA.model.get('date'), viewB.model.get('date'));
  },
});

export {
  LayoutView,
  ScheduleTitleView,
  TableHeaderView,
  ScheduleListView,
};
