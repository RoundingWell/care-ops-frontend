import _ from 'underscore';
import Backbone from 'backbone';
import hbs from 'handlebars-inline-precompile';

import { View, Region } from 'marionette';

import 'sass/modules/buttons.scss';

import intl from 'js/i18n';

import Optionlist from 'js/components/optionlist';

import SidebarTemplate from './sidebar-layout.hbs';

import './program-sidebar.scss';

const i18n = intl.admin.program.sidebar.sidebarViews;

const SidebarView = View.extend({
  className: 'program-sidebar',
  template: SidebarTemplate,
  regionClass: Region.extend({ replaceElement: true }),
  triggers: {
    'click @ui.menu': 'click:menu',
  },
  ui: {
    menu: '.js-menu',
  },
  onClickMenu() {
    const menuOptions = new Backbone.Collection([
      {
        onSelect: _.bind(this.triggerMethod, this, 'edit'),
        icon: 'edit',
        class: 'program-sidebar__edit',
        text: i18n.menuOptions.edit,
      },
    ]);

    const optionlist = new Optionlist({
      ui: this.ui.menu,
      uiView: this,
      headingText: i18n.menuOptions.headingText,
      itemTemplate: hbs`<span class={{class}}>{{far icon}} {{ text }}</span>`,
      lists: [{ collection: menuOptions }],
      align: 'right',
      popWidth: 248,
    });

    optionlist.show();
  },
});

export {
  SidebarView,
};
