import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'scss/modules/buttons.scss';

import Droplist from 'js/components/droplist';

import 'js/views/patients/worklist/worklist-list.scss';

const FiltersView = View.extend({
  className: 'worklist-list__filters',
  template: hbs`
    <div class="worklist-list__all-filters" data-all-filters-region></div>
    <div class="worklist-list__filter" data-workspace-filter-region></div>
    <div class="worklist-list__filter" data-owner-toggle-region></div>
  `,
  regions: {
    allFilters: '[data-all-filters-region]',
    workspace: '[data-workspace-filter-region]',
    ownerToggle: '[data-owner-toggle-region]',
  },
});

const AllFiltersButtonView = View.extend({
  modelEvents: {
    'change': 'render',
  },
  className: 'button--link-large',
  tagName: 'button',
  template: hbs`{{far "sliders"}}<span>{{ @intl.patients.worklist.filtersViews.allFiltersButton }}</span> {{#if filtersCount}}({{filtersCount}}){{/if}}`,
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
