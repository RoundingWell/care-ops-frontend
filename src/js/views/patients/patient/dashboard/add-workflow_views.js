import { View } from 'marionette';

import hbs from 'handlebars-inline-precompile';

import 'sass/modules/buttons.scss';

import Optionlist from 'js/components/optionlist';

import intl from 'js/i18n';

import './add-workflow.scss';

const i18n = intl.patients.patient.dashboard.addWorkflowViews;

const AddWorkflowOptlist = Optionlist.extend({
  popWidth: 248,
  className: 'picklist add-workflow__picklist',
  headingText: i18n.addWorkflowOptlist.headingText,
  isSelectlist: true,
  placeholderText: i18n.addWorkflowOptlist.placeholderText,
  itemTemplate: hbs`{{fa iconType icon}} {{ text }}`,
  itemTemplateContext() {
    const isProgramAction = this.model.get('type') === 'program-actions';

    return {
      icon: (isProgramAction) ? 'file-alt' : 'folder',
      iconType: (isProgramAction) ? 'far' : 'fas',
    };
  },
});

const AddButtonView = View.extend({
  className: 'button-primary add-workflow__button',
  template: hbs`{{far "plus-circle"}} {{ @intl.patients.patient.dashboard.addWorkflowViews.addButtonView.label }}{{far "angle-down" classes="add-workflow__arrow"}}`,
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
  new: 'add-workflow__add-new',
  noResults: 'picklist--no-results add-workflow__no-results',
};

export {
  AddButtonView,
  i18n,
  itemClasses,
};
