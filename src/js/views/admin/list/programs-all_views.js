import moment from 'moment';

import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import PreloadRegion from 'js/regions/preload_region';

import 'sass/modules/list-pages.scss';
import 'sass/modules/table-list.scss';
import './programs-list.scss';

const EmptyView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="table-empty-list">
      <h2>{{ @intl.admin.list.programsAllViews.emptyView }}</h2>
    </td>
  `,
});

const ItemView = View.extend({
  className: 'table-list__item',
  tagName: 'tr',
  template: hbs`
    <td class="table-list__cell w-60">{{ name }}</td>
    <td class="table-list__cell w-20 programs-list__published{{#if published}} is-published{{/if}}">
      {{#if published}}{{fas "toggle-on"}}{{else}}{{far "toggle-off"}}{{/if}}
      {{formatMessage (intlGet "admin.list.programsAllViews.itemView.published") published=published}}
    </td>
    <td class="table-list__cell w-20 programs-list__updated-ts">{{formatMoment updated_at "TIME_OR_DAY"}}</td>
  `,
  triggers: {
    'click': 'click',
  },
  onClick() {
    Radio.trigger('event-router', 'program:details', this.model.id);
  },
});

const LayoutView = View.extend({
  className: 'flex-region',
  template: hbs`
    <div class="list-page__header">
      <div class="list-page__title">{{ @intl.admin.list.programsAllViews.layoutView.title }}</div>
      <div class="u-margin--b-16">
        <button class="button-primary js-add">{{far "plus-circle"}}{{ @intl.admin.list.programsAllViews.addProgramBtn }}</button>
      </div>
    </div>
    <div class="flex-region list-page__list">
      <table class="w-100"><tr>
        <td class="table-list__header w-60">{{ @intl.admin.list.programsAllViews.layoutView.programHeader }}</td>
        <td class="table-list__header w-20">{{ @intl.admin.list.programsAllViews.layoutView.stateHeader }}</td>
        <td class="table-list__header w-20">{{ @intl.admin.list.programsAllViews.layoutView.updatedHeader }}</td>
      </tr></table>
      <div data-list-region></div>
    </div>
  `,
  regions: {
    list: {
      el: '[data-list-region]',
      regionClass: PreloadRegion,
    },
  },
  triggers: {
    'click .js-add': 'click:add',
  },
});

const ListView = CollectionView.extend({
  className: 'table-list',
  tagName: 'table',
  childView: ItemView,
  viewComparator({ model }) {
    return - moment(model.get('updated_at')).format('X');
  },
  emptyView: EmptyView,
});

export {
  LayoutView,
  ListView,
};
