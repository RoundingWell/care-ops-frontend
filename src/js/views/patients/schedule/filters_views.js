import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'scss/modules/buttons.scss';

import Droplist from 'js/components/droplist';

import './schedule.scss';

const FiltersView = View.extend({
  className: 'schedule__filters',
  template: hbs`
    <div class="schedule__all-filters" data-all-filters-region></div>
    <div class="schedule__filter" data-group-filter-region></div>
  `,
  regions: {
    allFilters: '[data-all-filters-region]',
    group: '[data-group-filter-region]',
  },
});

const AllFiltersButtonView = View.extend({
  className: 'button--link-large',
  tagName: 'button',
  template: hbs`{{far "sliders"}}<span>{{ @intl.patients.schedule.filtersViews.allFiltersButton }}</span>`,
  triggers: {
    click: 'click',
  },
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
  FiltersView,
  AllFiltersButtonView,
  GroupsDropList,
};
