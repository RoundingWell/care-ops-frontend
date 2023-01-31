import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'scss/modules/buttons.scss';

import Droplist from 'js/components/droplist';

import './schedule.scss';

const FiltersView = View.extend({
  className: 'schedule__filters',
  template: hbs`
    <div class="schedule__all-filters" data-all-filters-region></div>
    <div class="schedule__filter" data-workspace-filter-region></div>
  `,
  regions: {
    allFilters: '[data-all-filters-region]',
    workspace: '[data-workspace-filter-region]',
  },
});

const AllFiltersButtonView = View.extend({
  modelEvents: {
    'change': 'render',
  },
  className: 'button--link-large',
  tagName: 'button',
  template: hbs`{{far "sliders"}}<span>{{ @intl.patients.schedule.filtersViews.allFiltersButton }}</span> {{#if filtersCount}}({{filtersCount}}){{/if}}`,
  triggers: {
    click: 'click',
  },
  templateContext() {
    return {
      filtersCount: this.model.getFiltersCount(),
    };
  },
});

const WorkspacesDropList = Droplist.extend({
  viewOptions: {
    className: 'button-filter',
    template: hbs`{{ name }}{{far "angle-down"}}`,
  },
  picklistOptions: {
    attr: 'name',
  },
});

export {
  FiltersView,
  AllFiltersButtonView,
  WorkspacesDropList,
};
