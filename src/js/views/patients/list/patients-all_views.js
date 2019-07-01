import _ from 'underscore';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import 'sass/modules/list-pages.scss';
import 'sass/modules/table-list.scss';

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
      <div class="list-page__title">{{ @intl.patients.list.patientsAllViews.layoutView.title }}</div>
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
    list: '[data-list-region]',
  },
  childViewEvents: {
    'update:listDom': 'fixWidth',
  },
  ui: {
    listHeader: '.js-list-header',
    list: '.js-list',
  },
  fixWidth() {
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
  onRenderChildren() {
    if (!this.isAttached()) return;
    this.triggerMethod('update:listDom', this);
  },
});

export {
  LayoutView,
  ListView,
};
