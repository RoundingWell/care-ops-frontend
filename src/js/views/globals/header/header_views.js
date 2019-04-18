import { View } from 'marionette';
import hbs from 'handlebars-inline-precompile';

import 'sass/modules/buttons.scss';
import 'sass/modules/forms.scss';
import 'sass/modules/modals.scss';
import 'sass/modules/picklist.scss';

import AppHeaderTemplate from './app-header.layout.hbs';

import './app-header.scss';

const Layout = View.extend({
  template: AppHeaderTemplate,
  regions: {
    menuRegion: '[data-menu-region]',
    helpRegion: '[data-help-region]',
  },
  triggers: {
    'click .js-menu': 'menu:click',
  },
});

const HelpView = View.extend({
  className: 'js-help app-header__button app-header-icon',
  template: hbs`<i class="app-header-icon__element font-icon-question"></i> {{ @intl.globals.header.headerViews.helpView.button }}`,
  triggers: {
    'click': 'click',
  },
});

export {
  Layout,
  HelpView,
};
