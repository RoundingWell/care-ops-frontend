import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';

import Droplist from 'js/components/droplist';

import './worklist-list.scss';

const FiltersView = View.extend({
  className: 'worklist-list__filters',
  template: hbs`
    <div data-group-filter-region></div>
    <div data-clinician-filter-region></div>
    <div data-reset-filter-region></div>
  `,
  regions: {
    group: '[data-group-filter-region]',
    clinician: '[data-clinician-filter-region]',
    reset: '[data-reset-filter-region]',
  },
});

const GroupsDropList = Droplist.extend({
  viewOptions: {
    className: 'button-filter worklist-list__groups-filter',
    template: hbs`{{ name }}{{far "angle-down"}}`,
  },
  picklistOptions: {
    attr: 'name',
  },
});

const ClinicianDropList = Droplist.extend({
  picklistOptions: {
    isSelectlist: true,
  },
  viewOptions: {
    className: 'button-filter worklist-list__clinicians-filter',
    template: hbs`{{far "user-circle"}}{{ name }}{{far "angle-down"}}`,
  },
  initialize({ groups }) {
    this.lists = groups.map(group => {
      return {
        collection: group.getClinicians(),
        headingText: group.get('name'),
        itemTemplate: hbs`<a{{#if isSelected}} class="is-selected"{{/if}}>{{matchText name query}}</a>`,
        attr: 'name',
      };
    });
  },
});

const ClinicianClearButton = View.extend({
  template: hbs`<button class="button-secondary worklist-list__clear-filter">{{ @intl.patients.worklist.filtersViews.clearClinicianFilter }}</button>`,
  triggers: {
    'click': 'click',
  },
});

export {
  FiltersView,
  GroupsDropList,
  ClinicianDropList,
  ClinicianClearButton,
};
