import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';

import Droplist from 'js/components/droplist';

import 'js/views/patients/worklist/worklist-list.scss';

const FiltersView = View.extend({
  className: 'worklist-list__filters',
  template: hbs`
    <div class="worklist-list__filter" data-group-filter-region></div>
    <div class="worklist-list__filter" data-owner-filter-region></div>
  `,
  regions: {
    group: '[data-group-filter-region]',
    owner: '[data-owner-filter-region]',
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
