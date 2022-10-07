import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import { alphaSort } from 'js/utils/sorting';

import PreloadRegion from 'js/regions/preload_region';

import 'scss/modules/list-pages.scss';
import 'scss/modules/table-list.scss';
import './programs-list.scss';

const EmptyView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="table-empty-list">
      <h2>{{ @intl.programs.programsAllViews.emptyView }}</h2>
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
      {{formatMessage (intlGet "programs.programsAllViews.itemView.published") published=published}}
    </td>
    <td class="table-list__cell w-20 programs-list__updated-ts">{{formatDateTime updated_at "TIME_OR_DAY"}}</td>
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
      <div class="flex list-page__title">
        <div class="flex list-page__title-filter">
          <span class="list-page__title-icon">{{far "screwdriver-wrench"}}</span>{{ @intl.programs.programsAllViews.layoutView.title }}
        </div>
      </div>
      <button class="u-margin--b-16 button-primary js-add">{{far "circle-plus"}}<span>{{ @intl.programs.programsAllViews.addProgramBtn }}</span></button>
    </div>
    <div class="flex-region list-page__list">
      <table class="w-100"><tr>
        <td class="table-list__header w-60">{{ @intl.programs.programsAllViews.layoutView.programHeader }}</td>
        <td class="table-list__header w-20">{{ @intl.programs.programsAllViews.layoutView.stateHeader }}</td>
        <td class="table-list__header w-20">{{ @intl.programs.programsAllViews.layoutView.updatedHeader }}</td>
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
  triggers: {
    'click .js-add': 'click:add',
  },
});

const ListView = CollectionView.extend({
  className: 'table-list',
  tagName: 'table',
  childView: ItemView,
  viewComparator(viewA, viewB) {
    return alphaSort('desc', viewA.model.get('updated_at'), viewB.model.get('updated_at'));
  },
  emptyView: EmptyView,
});

export {
  LayoutView,
  ListView,
};
