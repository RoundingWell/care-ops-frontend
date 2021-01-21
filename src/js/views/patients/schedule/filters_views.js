import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';

import Droplist from 'js/components/droplist';
import OwnerDroplist from 'js/views/patients/shared/components/owner_component';

import './schedule.scss';

const FiltersView = View.extend({
  className: 'schedule__filters',
  template: hbs`
    <div class="schedule__filter" data-group-filter-region></div>
    <div class="schedule__filter" data-owner-filter-region></div>
    <div class="schedule__filter" data-date-filter-region></div>
  `,
  regions: {
    group: '[data-group-filter-region]',
    owner: '[data-owner-filter-region]',
    date: '[data-date-filter-region]',
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
  GroupsDropList,
  OwnerDroplist,
};
