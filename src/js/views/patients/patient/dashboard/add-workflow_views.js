import { View } from 'marionette';

import hbs from 'handlebars-inline-precompile';

import 'sass/modules/buttons.scss';

import Optionlist from 'js/components/optionlist';

import intl from 'js/i18n';

import './add-action.scss';

const i18n = intl.patients.patient.dashboard.addWorkflowViews;

const AddWorkflowOptlist = Optionlist.extend({
  popWidth: 248,
  className: 'picklist add-action__picklist',
  headingText: i18n.addWorkflowOptlist.headingText,
  isSelectlist: true,
  placeholderText: i18n.addWorkflowOptlist.placeholderText,
  itemTemplate: hbs`{{#if isFar}}{{far iconType}}{{else}}{{fas iconType}}{{/if}} {{ text }}`,
  itemTemplateContext() {
    const isProgramAction = this.model.get('type') === 'program-actions';
    const iconType = (isProgramAction) ? 'file-alt' : 'folder';

    return {
      iconType,
      isFar: isProgramAction,
    };
  },
});

const AddButtonView = View.extend({
  className: 'button-primary add-action__button',
  template: hbs`{{far "plus-circle"}} {{ @intl.patients.patient.dashboard.addWorkflowViews.addButtonView.label }}{{far "angle-down" classes="add-action__arrow"}}`,
  triggers: {
    'click': 'click',
  },
  onClick() {
    const optionlist = new AddWorkflowOptlist({
      ui: this.$el,
      uiView: this,
      lists: this.getOption('lists'),
      onNew: this.getOption('onNew'),
    });

    optionlist.show();
  },
});

const itemClasses = {
  new: 'add-action__add-new',
  noResults: 'picklist--no-results add-action__no-results',
};

export {
  AddButtonView,
  i18n,
  itemClasses,
};
