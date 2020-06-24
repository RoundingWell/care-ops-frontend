import _ from 'underscore';
import Backbone from 'backbone';
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
import Optionlist from 'js/components/optionlist';

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
  },
  childViewEvents: {
    'update:listDom': 'fixWidth',
  },
  ui: {
    listHeader: '.js-list-header',
    list: '.js-list',
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

const MultiEditButtonView = View.extend({
  template: hbs`
    <input type="checkbox" class="worklist-list__multi-edit-select js-select" {{#if isAllSelected}}checked{{/if}} />
    <button class="button--blue js-multi-edit">
      {{#if isFlowList}}
        {{formatMessage  (intlGet "patients.worklist.worklistViews.multiEditButtonView.editFlows") itemCount=itemCount}}
      {{else}}
        {{formatMessage  (intlGet "patients.worklist.worklistViews.multiEditButtonView.editActions") itemCount=itemCount}}
      {{/if}}
    </button>
    <span class="worklist-list__multi-edit-cancel js-cancel">{{@intl.patients.worklist.worklistViews.multiEditButtonView.cancel}}</span>
  `,
  templateContext() {
    const collection = this.getOption('collection');
    const itemCount = this.getOption('selected').length;

    return {
      itemCount,
      isFlowList: this.state.isFlowType(),
      isAllSelected: itemCount === collection.length,
    };
  },
  triggers: {
    'click .js-select': {
      event: 'click:select',
      preventDefault: false,
    },
    'click .js-cancel': 'click:cancel',
    'click .js-multi-edit': 'click:edit',
  },
  initialize({ state }) {
    this.state = state;
  },
});

const BulkEditActionsHeaderView = View.extend({
  template: hbs`
    <div class="flex">
      <div class="flex-grow">
        <h3 class="sidebar__heading">{{formatMessage  (intlGet "patients.worklist.worklistViews.bulkEditActionsHeaderView.headingText") itemCount=itemCount}}</h3>
      </div>
      <div>
        <button class="button--icon u-margin--r-8 js-menu">{{far "ellipsis-h"}}</button>
        <button class="button--icon js-close">{{fas "times"}}</button>
      </div>
    </div>
  `,
  templateContext() {
    return {
      itemCount: this.collection.length,
    };
  },
  triggers: {
    'click .js-close': 'close',
    'click @ui.menu': 'click:menu',
  },
  ui: {
    menu: '.js-menu',
  },
  onClickMenu() {
    const itemCount = this.collection.length;
    const menuOptions = new Backbone.Collection([
      {
        onSelect: _.bind(this.triggerMethod, this, 'confirm:delete'),
      },
    ]);

    const optionlist = new Optionlist({
      ui: this.ui.menu,
      uiView: this,
      headingText: i18n.bulkEditActionsHeaderView.menuOptions.headingText,
      itemTemplate: hbs`<span class="sidebar__delete-icon">{{far "trash-alt"}}</span>{{formatMessage  (intlGet "patients.worklist.worklistViews.bulkEditActionsHeaderView.menuOptions.delete") itemCount=itemCount}}`,
      itemTemplateContext() {
        return {
          itemCount,
        };
      },
      lists: [{ collection: menuOptions }],
      align: 'right',
      popWidth: 248,
    });

    optionlist.show();
  },
  onConfirmDelete() {
    const modal = Radio.request('modal', 'show:small', {
      bodyText: i18n.confirmDeleteActionsModal.bodyText,
      headingText: i18n.confirmDeleteActionsModal.headingText,
      submitText: i18n.confirmDeleteActionsModal.submitText,
      buttonClass: 'button--red',
      onSubmit: () => {
        modal.destroy();
        this.triggerMethod('delete', this.collection);
      },
    });
  },
});

const BulkEditFlowsHeaderView = View.extend({
  template: hbs`
    <div class="flex">
      <div class="flex-grow">
        <h3 class="sidebar__heading">{{formatMessage  (intlGet "patients.worklist.worklistViews.bulkEditFlowsHeaderView.headingText") itemCount=itemCount}}</h3>
      </div>
      <div>
        <button class="button--icon u-margin--r-8 js-menu">{{far "ellipsis-h"}}</button>
        <button class="button--icon js-close">{{fas "times"}}</button>
      </div>
    </div>
  `,
  templateContext() {
    return {
      itemCount: this.collection.length,
    };
  },
  triggers: {
    'click .js-close': 'close',
    'click @ui.menu': 'click:menu',
  },
  ui: {
    menu: '.js-menu',
  },
  onClickMenu() {
    const itemCount = this.collection.length;
    const menuOptions = new Backbone.Collection([
      {
        onSelect: _.bind(this.triggerMethod, this, 'confirm:delete'),
      },
    ]);

    const optionlist = new Optionlist({
      ui: this.ui.menu,
      uiView: this,
      headingText: i18n.bulkEditFlowsHeaderView.menuOptions.headingText,
      itemTemplate: hbs`<span class="sidebar__delete-icon">{{far "trash-alt"}}</span>{{formatMessage  (intlGet "patients.worklist.worklistViews.bulkEditFlowsHeaderView.menuOptions.delete") itemCount=itemCount}}`,
      itemTemplateContext() {
        return {
          itemCount,
        };
      },
      lists: [{ collection: menuOptions }],
      align: 'right',
      popWidth: 248,
    });

    optionlist.show();
  },
  onConfirmDelete() {
    const modal = Radio.request('modal', 'show:small', {
      bodyText: i18n.confirmDeleteFlowsModal.bodyText,
      headingText: i18n.confirmDeleteFlowsModal.headingText,
      submitText: i18n.confirmDeleteFlowsModal.submitText,
      buttonClass: 'button--red',
      onSubmit: () => {
        modal.destroy();
        this.triggerMethod('delete', this.collection);
      },
    });
  },
});

export {
  LayoutView,
  TooltipView,
  ListView,
  TableHeaderView,
  SortDroplist,
  sortDueOptions,
  sortUpdateOptions,
  MultiEditButtonView,
  BulkEditActionsHeaderView,
  BulkEditFlowsHeaderView,
};
