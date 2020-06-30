import _ from 'underscore';
import Radio from 'backbone.radio';
import Backbone from 'backbone';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import intl from 'js/i18n';

import Optionlist from 'js/components/optionlist';

const i18n = intl.patients.worklist.bulkEditViews;

const BulkEditButtonView = View.extend({
  template: hbs`
    <input type="checkbox" class="worklist-list__bulk-edit-select js-select" {{#if isAllSelected}}checked{{/if}} />
    <button class="button--blue js-bulk-edit">
      {{#if isFlowList}}
        {{formatMessage  (intlGet "patients.worklist.bulkEditViews.bulkEditButtonView.editFlows") itemCount=itemCount}}
      {{else}}
        {{formatMessage  (intlGet "patients.worklist.bulkEditViews.bulkEditButtonView.editActions") itemCount=itemCount}}
      {{/if}}
    </button>
    <span class="worklist-list__bulk-edit-cancel js-cancel">{{@intl.patients.worklist.bulkEditViews.bulkEditButtonView.cancel}}</span>
  `,
  templateContext() {
    const collection = this.getOption('collection');
    const itemCount = this.getOption('selected').length;

    return {
      itemCount,
      isFlowList: this.state.isFlowType(),
      isAllSelected: itemCount === collection.length,
    };
  },
  triggers: {
    'click .js-select': {
      event: 'click:select',
      preventDefault: false,
    },
    'click .js-cancel': 'click:cancel',
    'click .js-bulk-edit': 'click:edit',
  },
  initialize({ state }) {
    this.state = state;
  },
});

const BulkEditActionsHeaderView = View.extend({
  template: hbs`
    <div class="flex">
      <div class="flex-grow">
        <h3 class="sidebar__heading">{{formatMessage  (intlGet "patients.worklist.bulkEditViews.bulkEditActionsHeaderView.headingText") itemCount=itemCount}}</h3>
      </div>
      <div>
        <button class="button--icon u-margin--r-8 js-menu">{{far "ellipsis-h"}}</button>
        <button class="button--icon js-close">{{fas "times"}}</button>
      </div>
    </div>
  `,
  templateContext() {
    return {
      itemCount: this.collection.length,
    };
  },
  triggers: {
    'click .js-close': 'close',
    'click @ui.menu': 'click:menu',
  },
  ui: {
    menu: '.js-menu',
  },
  onClickMenu() {
    const itemCount = this.collection.length;
    const menuOptions = new Backbone.Collection([
      {
        onSelect: _.bind(this.triggerMethod, this, 'confirm:delete'),
      },
    ]);

    const optionlist = new Optionlist({
      ui: this.ui.menu,
      uiView: this,
      headingText: i18n.bulkEditActionsHeaderView.menuOptions.headingText,
      itemTemplate: hbs`<span class="sidebar__delete-icon">{{far "trash-alt"}}</span>{{formatMessage  (intlGet "patients.worklist.bulkEditViews.bulkEditActionsHeaderView.menuOptions.delete") itemCount=itemCount}}`,
      itemTemplateContext() {
        return {
          itemCount,
        };
      },
      lists: [{ collection: menuOptions }],
      align: 'right',
      popWidth: 248,
    });

    optionlist.show();
  },
  onConfirmDelete() {
    const modal = Radio.request('modal', 'show:small', {
      bodyText: i18n.confirmDeleteActionsModal.bodyText,
      headingText: i18n.confirmDeleteActionsModal.headingText,
      submitText: i18n.confirmDeleteActionsModal.submitText,
      buttonClass: 'button--red',
      onSubmit: () => {
        modal.destroy();
        this.triggerMethod('delete', this.collection);
      },
    });
  },
});

const BulkEditFlowsHeaderView = View.extend({
  template: hbs`
    <div class="flex">
      <div class="flex-grow">
        <h3 class="sidebar__heading">{{formatMessage  (intlGet "patients.worklist.bulkEditViews.bulkEditFlowsHeaderView.headingText") itemCount=itemCount}}</h3>
      </div>
      <div>
        <button class="button--icon u-margin--r-8 js-menu">{{far "ellipsis-h"}}</button>
        <button class="button--icon js-close">{{fas "times"}}</button>
      </div>
    </div>
  `,
  templateContext() {
    return {
      itemCount: this.collection.length,
    };
  },
  triggers: {
    'click .js-close': 'close',
    'click @ui.menu': 'click:menu',
  },
  ui: {
    menu: '.js-menu',
  },
  onClickMenu() {
    const itemCount = this.collection.length;
    const menuOptions = new Backbone.Collection([
      {
        onSelect: _.bind(this.triggerMethod, this, 'confirm:delete'),
      },
    ]);

    const optionlist = new Optionlist({
      ui: this.ui.menu,
      uiView: this,
      headingText: i18n.bulkEditFlowsHeaderView.menuOptions.headingText,
      itemTemplate: hbs`<span class="sidebar__delete-icon">{{far "trash-alt"}}</span>{{formatMessage  (intlGet "patients.worklist.bulkEditViews.bulkEditFlowsHeaderView.menuOptions.delete") itemCount=itemCount}}`,
      itemTemplateContext() {
        return {
          itemCount,
        };
      },
      lists: [{ collection: menuOptions }],
      align: 'right',
      popWidth: 248,
    });

    optionlist.show();
  },
  onConfirmDelete() {
    const modal = Radio.request('modal', 'show:small', {
      bodyText: i18n.confirmDeleteFlowsModal.bodyText,
      headingText: i18n.confirmDeleteFlowsModal.headingText,
      submitText: i18n.confirmDeleteFlowsModal.submitText,
      buttonClass: 'button--red',
      onSubmit: () => {
        modal.destroy();
        this.triggerMethod('delete', this.collection);
      },
    });
  },
});


export {
  BulkEditButtonView,
  BulkEditActionsHeaderView,
  BulkEditFlowsHeaderView,
};
