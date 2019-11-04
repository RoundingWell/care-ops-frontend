import { View } from 'marionette';

import hbs from 'handlebars-inline-precompile';

import 'sass/modules/buttons.scss';

import Droplist from 'js/components/droplist';

import intl from 'js/i18n';

import './add-action.scss';

const ItemTemplate = hbs`{{far "file-alt"}} <a>{{ name }}</a>`;

const AddTemplate = hbs`{{far "file-alt"}} <a class="add-action__add-new">{{ @intl.patients.patient.dashboard.addActionViews.addTemplate.newAction }}</a>`;

const AddActionDroplist = Droplist.extend({
  popWidth: 248,
  picklistOptions: {
    attr: 'name',
    className: 'picklist add-action__picklist',
    headingText: intl.patients.patient.dashboard.addActionViews.addActionDroplist.headingText,
    isSelectlist: true,
    placeholderText: intl.patients.patient.dashboard.addActionViews.addActionDroplist.placeholderText,
  },
  viewOptions: {
    className: 'button-primary add-action__button',
    template: hbs`{{far "plus-circle"}} {{ @intl.patients.patient.dashboard.addActionViews.addActionDroplist.label }}{{far "angle-down" classes="add-action__arrow"}}`,
  },
});

const NoResultsView = View.extend({
  searchText: ' ',
  tagName: 'li',
  className: 'picklist--no-results add-action__no-results',
  template: hbs`{{far "file-alt"}} {{ @intl.patients.patient.dashboard.addActionViews.noResultsView.noResults }}`,
});

export {
  AddActionDroplist,
  NoResultsView,
  ItemTemplate,
  AddTemplate,
};
