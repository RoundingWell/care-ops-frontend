import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import PreloadRegion from 'js/regions/preload_region';


const ItemView = View.extend({
  template: hbs`
    <td class="table-list__cell w-100">{{ name }}</td>
  `,
  className: 'table-list__item',
  tagName: 'tr',
  triggers: {
    'click': 'click',
  },
  onClick() {
    Radio.trigger('event-router', 'dashboard', this.model.id);
  },
});

const EmptyView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="table-empty-list">
      <h2>{{ @intl.dashboards.dashboardsAllViews.emptyView }}</h2>
    </td>
  `,
});

const ListView = CollectionView.extend({
  childView: ItemView,
  className: 'table-list',
  tagName: 'table',
  emptyView: EmptyView,
});

const LayoutView = View.extend({
  className: 'flex-region',
  template: hbs`
  <div class="list-page__header">
    <div class="list-page__title"><span class="list-page__title-icon">{{far "gauge"}}</span>{{ @intl.dashboards.dashboardsAllViews.layoutView.title }}</div>
  </div>
  <div class="flex-region list-page__list">
    <table class="w-100"><tr>
      <td class="table-list__header w-100">{{ @intl.dashboards.dashboardsAllViews.layoutView.nameHeader }}</td>
    </tr></table>
    <div class="flex-region" data-list-region></div>
  </div>
  `,
  regions: {
    list: {
      el: '[data-list-region]',
      regionClass: PreloadRegion,
    },
  },
});

export {
  LayoutView,
  ListView,
};
