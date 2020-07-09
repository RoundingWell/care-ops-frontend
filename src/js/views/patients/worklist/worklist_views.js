import _ from 'underscore';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import { alphaSort } from 'js/utils/sorting';
import intl, { renderTemplate } from 'js/i18n';

import 'sass/modules/buttons.scss';
import 'sass/modules/list-pages.scss';
import 'sass/modules/table-list.scss';

import PreloadRegion from 'js/regions/preload_region';

import Droplist from 'js/components/droplist';
import Tooltip from 'js/components/tooltip';

import { ActionTooltipTemplate, ActionEmptyView, ActionItemView } from './action_views';
import { FlowTooltipTemplate, FlowEmptyView, FlowItemView } from './flow_views';
import LayoutTemplate from './layout.hbs';
import TableHeaderTemplate from './table-header.hbs';

import './worklist-list.scss';

const i18n = intl.patients.worklist.worklistViews;

const LayoutView = View.extend({
  className: 'flex-region',
  template: LayoutTemplate,
  templateContext() {
    const currentClinician = Radio.request('bootstrap', 'currentUser');

    return {
      role: currentClinician.getRole().get('name'),
      worklistId: _.underscored(this.getOption('worklistId')),
      isFlowList: this.getOption('isFlowList'),
    };
  },
  regions: {
    tooltip: '[data-tooltip-region]',
    filters: '[data-filters-region]',
    toggle: '[data-toggle-region]',
    sort: '[data-sort-region]',
    table: '[data-table-region]',
    list: {
      el: '[data-list-region]',
      regionClass: PreloadRegion,
    },
    selectAll: '[data-select-all-region]',
  },
  childViewEvents: {
    'update:listDom': 'fixWidth',
  },
  triggers: {
    'click @ui.select': 'click:select',
  },
  ui: {
    listHeader: '.js-list-header',
    list: '.js-list',
    select: '.js-select',
  },
  initialize() {
    const userActivityCh = Radio.channel('user-activity');
    this.listenTo(userActivityCh, 'window:resize', this.fixWidth);
  },
  fixWidth() {
    /* istanbul ignore if */
    if (!this.isRendered()) return;

    const headerWidth = this.ui.listHeader.width();
    const listWidth = this.ui.list.contents().width();
    const listPadding = parseInt(this.ui.list.css('paddingRight'), 10);
    const scrollbarWidth = headerWidth - listWidth;

    this.ui.list.css({ paddingRight: `${ listPadding - scrollbarWidth }px` });
  },
});

const SelectAllView = View.extend({
  tagName: 'button',
  attributes() {
    if (this.getOption('isDisabled')) return { disabled: 'disabled' };
  },
  triggers: {
    'click': 'click',
  },
  getTemplate() {
    if (this.getOption('isSelectAll')) return hbs`{{fas "check-square"}}`;
    return hbs`{{fal "square"}}`;
  },
});

const TooltipView = View.extend({
  tagName: 'span',
  template: hbs`<span class="list-page__header-icon js-title-info">{{fas "info-circle"}}</span>`,
  ui: {
    tooltip: '.js-title-info',
  },
  templateContext() {
    const currentClinician = Radio.request('bootstrap', 'currentUser');

    return {
      role: currentClinician.getRole().get('name'),
      worklistId: _.underscored(this.getOption('worklistId')),
      isFlowList: this.getOption('isFlowList'),
    };
  },
  onRender() {
    const template = this.getOption('isFlowList') ? FlowTooltipTemplate : ActionTooltipTemplate;
    new Tooltip({
      message: renderTemplate(template, this.templateContext()),
      uiView: this,
      ui: this.ui.tooltip,
      orientation: 'vertical',
    });
  },
});

const TableHeaderView = View.extend({
  template: TableHeaderTemplate,
  tagName: 'tr',
  templateContext() {
    return {
      isFlowList: this.getOption('isFlowList'),
    };
  },
});

const ListView = CollectionView.extend({
  className: 'table-list',
  tagName: 'table',
  childView() {
    return this.isFlowList ? FlowItemView : ActionItemView;
  },
  emptyView() {
    return this.isFlowList ? FlowEmptyView : ActionEmptyView;
  },
  childViewOptions() {
    return {
      state: this.state,
    };
  },
  initialize({ state }) {
    this.state = state;
    this.isFlowList = state.isFlowType();

    this.listenTo(state, {
      'select:all': this.render,
      'select:none': this.render,
    });
  },
  onAttach() {
    this.triggerMethod('update:listDom', this);
  },
  /* istanbul ignore next: future proof */
  onRenderChildren() {
    if (!this.isAttached()) return;
    this.triggerMethod('update:listDom', this);
  },
});

const sortDueOptions = [
  {
    id: 'sortDueAsc',
    text: i18n.sortDueOptions.asc,
    comparator(a, b) {
      const dueA = a.model.get('due_date');
      const dueB = b.model.get('due_date');
      if (dueA === dueB) {
        return alphaSort('asc', a.model.get('due_time'), b.model.get('due_time'));
      }
      return alphaSort('asc', dueA, dueB);
    },
  },
  {
    id: 'sortDueDesc',
    text: i18n.sortDueOptions.desc,
    comparator(a, b) {
      const dueA = a.model.get('due_date');
      const dueB = b.model.get('due_date');
      if (dueA === dueB) {
        return alphaSort('desc', a.model.get('due_time'), b.model.get('due_time'));
      }
      return alphaSort('desc', dueA, dueB);
    },
  },
];

const sortUpdateOptions = [
  {
    id: 'sortUpdateAsc',
    text: i18n.sortUpdateOptions.asc,
    comparator(a, b) {
      return alphaSort('asc', a.model.get('updated_at'), b.model.get('updated_at'));
    },
  },
  {
    id: 'sortUpdateDesc',
    text: i18n.sortUpdateOptions.desc,
    comparator(a, b) {
      return alphaSort('desc', a.model.get('updated_at'), b.model.get('updated_at'));
    },
  },
];

const SortDroplist = Droplist.extend({
  popWidth: 248,
  picklistOptions: {
    headingText: i18n.sortDroplist.headingText,
  },
  viewOptions: {
    className: 'button-filter',
    template: hbs`{{far "sort-alt"}}{{text}}{{far "angle-down"}}`,
  },
});

export {
  LayoutView,
  SelectAllView,
  TooltipView,
  ListView,
  TableHeaderView,
  SortDroplist,
  sortDueOptions,
  sortUpdateOptions,
};
