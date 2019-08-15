import _ from 'underscore';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import PreloadRegion from 'js/regions/preload_region';

import Droplist from 'js/components/droplist';
import Tooltip from 'js/components/tooltip';

import intl from 'js/i18n';

import 'sass/modules/list-pages.scss';
import 'sass/modules/table-list.scss';

const EmptyView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="table-empty-list">
      <h2>{{ @intl.patients.list.patientsAllViews.emptyView }}</h2>
    </td>
  `,
});

const ItemView = View.extend({
  className: 'table-list__item',
  tagName: 'tr',
  template: hbs`
    <td class="table-list__cell w-20">{{ first_name }} {{ last_name }}</td>
    <td class="table-list__cell w-80">{{#each groups}}{{#unless @first}}, {{/unless}}{{ this.name }}{{/each}}</td>
  `,
  templateContext() {
    return {
      groups: _.map(this.model.getGroups().models, 'attributes'),
    };
  },
  triggers: {
    'click': 'click',
  },
  onClick() {
    Radio.trigger('event-router', 'patient:dashboard', this.model.id);
  },
});

const LayoutView = View.extend({
  className: 'flex-region',
  template: hbs`
    <div class="list-page__header">
      <div class="list-page__title">{{ @intl.patients.list.patientsAllViews.layoutView.title }}<span class="list-page__header-icon js-title-info">{{fas "info-circle"}}</span></div>
      <div class="list-page__filters" data-filters-region></div>
      <table class="w-100 js-list-header"><tr>
        <td class="table-list__header w-20">{{ @intl.patients.list.patientsAllViews.layoutView.patientHeader }}</td>
        <td class="table-list__header w-80">{{ @intl.patients.list.patientsAllViews.layoutView.groupHeader }}</td>
      </tr></table>
    </div>
    <div class="flex-region list-page__list js-list" data-list-region></div>
  `,
  regions: {
    filters: '[data-filters-region]',
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
    tooltip: '.fa-info-circle',
  },
  onRender() {
    new Tooltip({
      messageHtml: intl.patients.list.patientsAllViews.tooltip,
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
});

const ListView = CollectionView.extend({
  className: 'table-list',
  tagName: 'table',
  childView: ItemView,
  onAttach() {
    this.triggerMethod('update:listDom', this);
  },
  /* istanbul ignore next: future proof */
  onRenderChildren() {
    if (!this.isAttached()) return;
    this.triggerMethod('update:listDom', this);
  },
  emptyView: EmptyView,
});

const GroupsDropList = Droplist.extend({
  viewOptions: {
    className: 'button-filter',
    template: hbs`{{ name }}{{far "angle-down"}}`,
  },
  picklistOptions: {
    attr: 'name',
  },
});

export {
  LayoutView,
  ListView,
  GroupsDropList,
};
