import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';

import Droplist from 'js/components/droplist';
import RoleComponent from './role_component';

import './worklist-list.scss';

const FiltersView = View.extend({
  className: 'worklist-list__filters',
  template: hbs`
    <div data-group-filter-region></div>
    <div data-role-filter-region></div>
    <div data-clinician-filter-region></div>
    <div data-reset-filter-region></div>
    <div class="worklist-list__toggle" data-toggle-region></div>
  `,
  regions: {
    group: '[data-group-filter-region]',
    role: '[data-role-filter-region]',
    clinician: '[data-clinician-filter-region]',
    reset: '[data-reset-filter-region]',
    toggle: '[data-toggle-region]',
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
        collection: group.getActiveClinicians(),
        headingText: group.get('name'),
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

const TypeToggleView = View.extend({
  template: hbs`
    <button class="button-secondary {{#unless isFlowList}}button--blue{{/unless}} worklist-list__toggle-actions js-toggle-actions">{{far "file-alt"}}{{ @intl.patients.worklist.filtersViews.typeToggleView.actionsButton }}</button>{{~ remove_whitespace ~}}
    <button class="button-secondary {{#if isFlowList}}button--blue{{/if}} worklist-list__toggle-flows js-toggle-flows">{{fas "folder"}}{{ @intl.patients.worklist.filtersViews.typeToggleView.flowsButton }}</button>
  `,
  templateContext() {
    return {
      isFlowList: this.getOption('isFlowList'),
    };
  },
  triggers: {
    'click .js-toggle-actions': 'click:toggleActions',
    'click .js-toggle-flows': 'click:toggleFlows',
  },
  ui: {
    buttons: 'button',
  },
  onClickToggleActions() {
    this.triggerMethod('toggle:listType', 'actions');
    this.ui.buttons.toggleClass('button--blue');
  },
  onClickToggleFlows() {
    this.triggerMethod('toggle:listType', 'flows');
    this.ui.buttons.toggleClass('button--blue');
  },
});


export {
  FiltersView,
  GroupsDropList,
  ClinicianDropList,
  ClinicianClearButton,
  TypeToggleView,
  RoleComponent,
};
