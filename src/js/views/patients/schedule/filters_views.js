import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'scss/modules/buttons.scss';

import Droplist from 'js/components/droplist';

import './schedule.scss';

const FiltersView = View.extend({
  className: 'schedule__filters',
  template: hbs`
    <div class="schedule__filter" data-group-filter-region></div>
  `,
  regions: {
    group: '[data-group-filter-region]',
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
};
