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
    Radio.trigger('event-router', 'report', this.model.id);
  },
});

const ListView = CollectionView.extend({
  childView: ItemView,
  className: 'table-list',
  tagName: 'table',
});

const LayoutView = View.extend({
  template: hbs`
  <div class="list-page__header">
    <div class="list-page__title">{{ @intl.admin.list.reportsAllViews.layoutView.title }}</div>
  </div>
  <div class="flex-region list-page__list">
    <table class="w-100"><tr>
      <td class="table-list__header w-100">{{ @intl.admin.list.reportsAllViews.layoutView.nameHeader }}</td>
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
