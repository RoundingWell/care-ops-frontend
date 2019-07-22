import _ from 'underscore';
import Backbone from 'backbone';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import Optionlist from 'js/components/optionlist';

import { StateComponent, OwnerComponent, DueComponent } from 'js/views/patients/actions/actions_views';

import ActionSidebarTemplate from './action-sidebar.hbs';

import './action-sidebar.scss';

const DisabledSaveView = View.extend({
  template: hbs`<button disabled>Save</button>`,
});

const SaveView = View.extend({
  template: hbs`<button class="js-cancel">Cancel</button><button class="js-save">Save</button>`,
  triggers: {
    'click .js-cancel': 'cancel',
    'click .js-save': 'save',
  },
});

const LayoutView = View.extend({
  modelEvents: {
    'change': 'showSave',
  },
  childViewTriggers: {
    'save': 'save',
    'cancel': 'cancel',
  },
  className: 'action-sidebar',
  template: ActionSidebarTemplate,
  regions: {
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    due: '[data-due-region]',
    duration: '[data-duration-region]',
    save: '[data-save-region]',
    activity: '[data-activity-region]',
  },
  triggers: {
    'click .js-close': 'cancel',
    'click @ui.menu': 'click:menu',
  },
  ui: {
    menu: '.js-menu',
  },
  onClickMenu() {
    const menuOptions = new Backbone.Collection([
      {
        text: 'Delete Action',
        onSelect: _.bind(this.triggerMethod, this, 'delete'),
      },
    ]);

    const optionlist = new Optionlist({
      ui: this.ui.menu,
      uiView: this,
      lists: [{ collection: menuOptions }],
    });

    optionlist.show();
  },
  templateContext() {
    return {
      isNew: this.model.isNew(),
      createdAt: this.getOption('createdEvent').get('date'),
    };
  },
  onRender() {
    this.showState();
    this.showOwner();
    this.showDue();
    this.showDisabledSave();
  },
  showState() {
    const stateComponent = new StateComponent({ model: this.model });

    this.listenTo(stateComponent, 'change:state', ({ id }) => {
      this.model.set({ _state: id });
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const ownerComponent = new OwnerComponent({ model: this.model });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      if (owner.type === 'clinicians') {
        this.set({
          _role: null,
          _clinician: owner.id,
        });
        return;
      }

      this.set({
        _role: owner.id,
        _clinician: null,
      });
    });

    this.showChildView('owner', ownerComponent);
  },
  showDue() {
    const dueComponent = new DueComponent({ model: this.model });

    this.listenTo(dueComponent, 'change:due', date => {
      this.model.setDue(date);
    });

    this.showChildView('due', dueComponent);
  },
  showSave() {
    if (!this.model.isValid()) return this.showDisabledSave();

    this.showChildView('save', new SaveView({ model: this.model }));
  },
  showDisabledSave() {
    this.showChildView('save', new DisabledSaveView());
  },
  onSave() {
    this.showDisabledSave();
  },
});

export {
  LayoutView,
};
