import _ from 'underscore';
import moment from 'moment';

import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import { dateSort } from 'js/utils/sorting';
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
    filters: '[data-filters-region]',
    sort: '[data-sort-region]',
    list: {
      el: '[data-list-region]',
      regionClass: PreloadRegion,
    },
  },
  childViewEvents: {
    'update:listDom': 'fixWidth',
  },
  ui: {
    listHeader: '.js-list-header',
    list: '.js-list',
    tooltip: '.js-title-info',
  },
  triggers: {
    'click .js-toggle-actions': 'click:toggleActions',
    'click .js-toggle-flows': 'click:toggleFlows',
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
  onClickToggleActions() {
    this.triggerMethod('toggle:listType', 'actions');
  },
  onClickToggleFlows() {
    this.triggerMethod('toggle:listType', 'flows');
  },
});

const ListView = CollectionView.extend({
  className: 'table-list',
  tagName: 'table',
  childView() {
    return this.getOption('isFlowList') ? FlowItemView : ActionItemView;
  },
  emptyView() {
    return this.getOption('isFlowList') ? FlowEmptyView : ActionEmptyView;
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
      if (a.model.get('due_date') === b.model.get('due_date')) {
        return dateSort(
          'asc',
          moment(a.model.get('due_time'), 'HH:mm:ss'),
          moment(b.model.get('due_time'), 'HH:mm:ss'),
        );
      }
      return dateSort('asc', a.model.get('due_date'), b.model.get('due_date'));
    },
  },
  {
    id: 'sortDueDesc',
    text: i18n.sortDueOptions.desc,
    comparator(a, b) {
      if (a.model.get('due_date') === b.model.get('due_date')) {
        return dateSort(
          'desc',
          moment(a.model.get('due_time'), 'HH:mm:ss'),
          moment(b.model.get('due_time'), 'HH:mm:ss'),
        );
      }
      return dateSort('desc', a.model.get('due_date'), b.model.get('due_date'));
    },
  },
];

const sortUpdateOptions = [
  {
    id: 'sortUpdateAsc',
    text: i18n.sortUpdateOptions.asc,
    comparator(a, b) {
      return dateSort('asc', a.model.get('updated_at'), b.model.get('updated_at'));
    },
  },
  {
    id: 'sortUpdateDesc',
    text: i18n.sortUpdateOptions.desc,
    comparator(a, b) {
      return dateSort('desc', a.model.get('updated_at'), b.model.get('updated_at'));
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
  ListView,
  SortDroplist,
  sortDueOptions,
  sortUpdateOptions,
};
