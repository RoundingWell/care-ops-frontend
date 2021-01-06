import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';

import Droplist from 'js/components/droplist';
import DateFilterComponent from './date-filter_component';

import './worklist-list.scss';

const FiltersView = View.extend({
  className: 'worklist-list__filters',
  template: hbs`
    <div class="worklist-list__filter" data-group-filter-region></div>
    <div class="worklist-list__filter" data-owner-filter-region></div>
    <div class="worklist-list__toggle" data-toggle-region></div>
    <div class="worklist-list__filter" data-date-filter-region></div>
  `,
  regions: {
    group: '[data-group-filter-region]',
    owner: '[data-owner-filter-region]',
    toggle: '[data-toggle-region]',
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
  TypeToggleView,
  DateFilterComponent,
};
