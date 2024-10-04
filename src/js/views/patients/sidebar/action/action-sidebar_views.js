import { bind } from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'scss/modules/sidebar.scss';

import intl from 'js/i18n';

import { animSidebar } from 'js/anim';

import PreloadRegion from 'js/regions/preload_region';

import Optionlist from 'js/components/optionlist';
import ActionSidebarTemplate from './action-sidebar.hbs';

import './action-sidebar.scss';

const MenuView = View.extend({
  tagName: 'button',
  className: 'button--icon js-menu',
  template: hbs`{{far "ellipsis"}}`,
  triggers: {
    'click': 'click',
  },
  onClick() {
    const menuOptions = new Backbone.Collection([
      {
        onSelect: bind(this.triggerMethod, this, 'delete'),
      },
    ]);

    const optionlist = new Optionlist({
      ui: this.$el,
      uiView: this,
      headingText: intl.patients.sidebar.action.actionSidebarViews.menuView.menuOptions.headingText,
      itemTemplate: hbs`{{far "trash-can" classes="sidebar__delete-icon"}}<span>{{ @intl.patients.sidebar.action.actionSidebarViews.menuView.menuOptions.delete }}</span>`,
      lists: [{ collection: menuOptions }],
      align: 'right',
      popWidth: 248,
    });

    optionlist.show();
  },
});

const LayoutView = View.extend({
  className: 'sidebar flex-region',
  template: ActionSidebarTemplate,
  regions: {
    menu: '[data-menu-region]',
    action: '[data-action-region]',
    form: {
      el: '[data-form-region]',
      replaceElement: true,
    },
    activity: {
      el: '[data-activity-region]',
      regionClass: PreloadRegion,
    },
    attachments: '[data-attachments-region]',
    timestamps: '[data-timestamps-region]',
    comment: '[data-comment-region]',
  },
  triggers: {
    'click .js-close': 'close',
  },
  onAttach() {
    animSidebar(this.el);
  },
  onClose() {
    Radio.trigger('user-activity', 'close:actionSidebar');
  },
});

export {
  LayoutView,
  MenuView,
};
