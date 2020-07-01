import _ from 'underscore';
import Backbone from 'backbone';
import hbs from 'handlebars-inline-precompile';
import Radio from 'backbone.radio';
import { View } from 'marionette';

import intl from 'js/i18n';

import Optionlist from 'js/components/optionlist';

import { StateComponent, OwnerComponent, DueComponent, TimeComponent, DurationComponent } from 'js/views/patients/shared/actions_views';

import BulkEditBodyTemplate from './bulk-edit-body.hbs';

import './bulk-edit.scss';

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

const BulkEditBodyView = View.extend({
  modelEvents: {
    'change:stateMulti': 'showState',
    'change:ownerMulti': 'showOwner',
    'change:dateMulti': 'showDueDate',
    'change:timeMulti': 'showDueTime',
    'change:durationMulti': 'showDuration',
  },
  className: 'bulk-edit__body',
  template: BulkEditBodyTemplate,
  regions: {
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    dueDay: '[data-due-day-region]',
    dueTime: '[data-due-time-region]',
    duration: '[data-duration-region]',
  },
  initialize({ state }) {
    this.state = state;
  },
  onRender() {
    this.showState();
    this.showOwner();
    this.showDueDate();
    this.showDueTime();
    this.showDuration();
  },
  getStateComponent() {
    const stateId = this.model.get('stateId');

    if (this.model.get('stateMulti')) {
      return new StateComponent({ 
        stateId,
        viewOptions() {
          return {
            className: 'button-secondary w-100',
            template: hbs`{{fas "dot-circle"}}<span class="action--gray">{{ @intl.patients.worklist.bulkEditViews.bulkStateDefaultText }}</span>`,
          };
        },
      });
    }

    return new StateComponent({ stateId });
  },
  getOwnerComponent() {
    const owner = this.model.get('owner');
    const groups = this.model.get('groups');

    if (this.model.get('ownerMulti')) {
      return new OwnerComponent({ 
        owner,
        groups,
        viewOptions() {
          return {
            className: 'button-secondary w-100',
            template: hbs`{{far "user-circle"}}<span class="action--gray">{{ @intl.patients.worklist.bulkEditViews.bulkOwnerDefaultText }}</span>`,
          };
        },
      });
    }

    return new OwnerComponent({ 
      owner,
      groups,
    });
  },
  getDueDateComponent() {
    const date = this.model.get('date');
    
    if (this.model.get('dateMulti')) {
      return new DueComponent({ 
        date,
        viewOptions() {
          return {
            tagName: 'button',
            className: 'button-secondary w-100 due-component',
            triggers: {
              'click': 'click',
            },
            template: hbs`{{far "calendar-alt"}}<span class="action--gray">{{ @intl.patients.worklist.bulkEditViews.bulkDueDateDefaultText }}</span>`,
          };
        },
      });
    }

    return new DueComponent({ date });
  },
  getDueTimeComponent() {
    const time = this.model.get('time');

    if (this.model.get('timeMulti')) {
      return new TimeComponent({ 
        time,
        viewOptions() {      
          return {
            className: 'button-secondary time-component w-100',
            template: hbs`{{far "clock"}} <span class="action--gray">{{ @intl.patients.worklist.bulkEditViews.bulkDueTimeDefaultText }}</span>`,
          };
        },
      });
    }

    return new TimeComponent({ time });
  },
  getDurationComponent() {
    const duration = this.model.get('duration');

    if (this.model.get('durationMulti')) {
      return new DurationComponent({ 
        duration,
        viewOptions() {
          return {
            className: 'button-secondary w-100',
            template: hbs`{{far "stopwatch"}}<span class="action--gray">{{ @intl.patients.worklist.bulkEditViews.bulkDurationDefaultText }}</span>`,
          };
        },
      });
    }

    return new DurationComponent({ duration });
  },
  showState() {
    const stateComponent = this.getStateComponent();

    this.listenTo(stateComponent, 'change:state', state => {
      this.model.set({ stateId: state.id, stateMulti: false });
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const ownerComponent = this.getOwnerComponent();

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.model.set({ owner, ownerMulti: false });
    });

    this.showChildView('owner', ownerComponent);
  },
  showDueDate() {
    const dueDayComponent = this.getDueDateComponent();

    this.listenTo(dueDayComponent, 'change:due', date => {
      this.model.set({ date, dateMulti: false });
    });

    this.showChildView('dueDay', dueDayComponent);
  },
  showDueTime() {
    const dueTimeComponent = this.getDueTimeComponent();

    this.listenTo(dueTimeComponent, 'change:time', time => {
      this.model.set({ time, timeMulti: false });
    });

    this.showChildView('dueTime', dueTimeComponent);
  },
  showDuration() {
    const durationComponent = this.getDurationComponent();

    this.listenTo(durationComponent, 'change:duration', duration => {
      this.model.set({ duration, durationMulti: false });
    });

    this.showChildView('duration', durationComponent);
  },
});

export {
  BulkEditButtonView,
  BulkEditActionsHeaderView,
  BulkEditFlowsHeaderView,
  BulkEditBodyView,
};
