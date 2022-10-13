import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'scss/modules/buttons.scss';

import Droplist from 'js/components/droplist';

import 'js/views/patients/worklist/worklist-list.scss';

const FiltersView = View.extend({
  className: 'worklist-list__filters',
  template: hbs`
    <div class="worklist-list__all-filters" data-all-filters-region></div>
    <div class="worklist-list__filter" data-group-filter-region></div>
    <div class="worklist-list__filter" data-owner-toggle-region></div>
  `,
  regions: {
    allFilters: '[data-all-filters-region]',
    group: '[data-group-filter-region]',
    ownerToggle: '[data-owner-toggle-region]',
  },
});

const AllFiltersButtonView = View.extend({
  className: 'button--link-large',
  tagName: 'button',
  template: hbs`{{far "sliders"}}<span>{{ @intl.patients.worklist.filtersViews.allFiltersButton }}<span>`,
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

const NoOwnerToggleView = View.extend({
  template: hbs`
    <button class="button-filter-toggle {{#if noOwner}}button--blue{{/if}}">
      {{ @intl.patients.worklist.filtersViews.noOwnerToggleView.noOwner }}{{#if noOwner}}{{far "xmark"}}{{/if}}
    </button>
  `,
  modelEvents: {
    'change:noOwner': 'render',
  },
  triggers: {
    click: 'click',
  },
});

export {
  FiltersView,
  AllFiltersButtonView,
  GroupsDropList,
  NoOwnerToggleView,
};
