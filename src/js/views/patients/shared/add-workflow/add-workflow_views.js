import { View } from 'marionette';

import hbs from 'handlebars-inline-precompile';

import 'sass/modules/buttons.scss';

import Optionlist from 'js/components/optionlist';

import intl from 'js/i18n';

import './add-workflow.scss';

const i18n = intl.patients.shared.addWorkflow.addWorkflowViews;

const AddWorkflowOptlist = Optionlist.extend({
  popWidth: 248,
  className: 'picklist add-workflow__picklist',
  isSelectlist: true,
  placeholderText: i18n.addWorkflowOptlist.placeholderText,
  itemClassName: 'picklist__item--icon',
  itemTemplate: hbs`{{fa iconType icon}} {{ text }}`,
  itemTemplateContext() {
    const isProgramAction = this.model.get('itemType') === 'program-actions';
    const actionIcon = this.model.get('hasOutreach') ? 'share-square' : 'file-alt';
    return {
      icon: isProgramAction ? actionIcon : 'folder',
      iconType: isProgramAction ? 'far' : 'fas',
    };
  },
});

const AddButtonView = View.extend({
  tagName: 'button',
  className: 'button-primary',
  headingText: i18n.addWorkflowOptlist.headingText,
  template: hbs`{{far "plus-circle"}}{{ @intl.patients.shared.addWorkflow.addWorkflowViews.addButtonView.label }}{{far "angle-down"}}`,
  triggers: {
    'click': 'click',
  },
  onClick() {
    const optionlist = new AddWorkflowOptlist({
      headingText: this.getOption('headingText'),
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
