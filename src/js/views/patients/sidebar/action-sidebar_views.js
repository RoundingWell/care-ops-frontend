import _ from 'underscore';
import Backbone from 'backbone';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import Optionlist from 'js/components/optionlist';

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

const ActivityView = View.extend({
  template: hbs`{{ type }}`,
});

const ActivitiesView = CollectionView.extend({
  childView(model) {
    const type = model.get('type');
    switch (type) {
      default: return ActivityView;
    }
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
    };
  },
  onRender() {
    this.showDisabledSave();
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
  ActivitiesView,
};
