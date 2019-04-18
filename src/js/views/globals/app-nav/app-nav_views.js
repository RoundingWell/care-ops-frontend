import _ from 'underscore';
import { View, CollectionView } from 'marionette';

import 'sass/modules/buttons.scss';

import hbs from 'handlebars-inline-precompile';

import AppNavTemplate from './app-nav.layout.hbs';
import AppNavItemTemplate from './app-nav.item.hbs';

import './app-nav.scss';

const NavLayout = View.extend({
  regions: {
    header: '[data-header-region]',
    section: '[data-section-region]',
    logo: '[data-logo-region]',
  },
  className: 'app-nav__container flex-region',
  template: AppNavTemplate,
  onRender() {
    this.showChildView('logo', 'logo svg here');
  },
});


const NavItem = View.extend({
  ui: {
    item: '.js-nav-item',
  },
  className() {
    if (this.model.isHeading()) return 'app-nav-menu__heading';
    return 'app-nav-menu__item';
  },
  getTemplate() {
    if (this.model.isHeading()) {
      return hbs`{{ text }}`;
    }

    return AppNavItemTemplate;
  },
  tagName: 'li',
  triggers: {
    'click a': 'select',
  },
  _getListContext() {
    const list = this.model.getList();

    return {
      url: list.getRoute(),
      displayHtml: list.get('text'),
    };
  },
  templateContext() {
    const context = {
      displayHtml() {
        return this.text;
      },
      link_class: this.model.isButton() ? 'app-nav-menu__btn' : 'app-nav-link',
    };

    if (this.model.isList()) {
      _.extend(context, this._getListContext());
    }

    return context;
  },
});

const NavList = CollectionView.extend({
  childView: NavItem,
  childViewTriggers: {
    'select': 'nav:select',
  },
  tagName: 'ul',
  onNavSelect(cv) {
    this.selectNav(cv.model);
  },
  selectNav(selectedModel) {
    this.selectedModel = selectedModel;

    const childView = this.children.findByModel(selectedModel);

    this.clearSelected();

    childView.ui.item.addClass('is-selected');
  },
  clearSelected() {
    this.$('.js-nav-item').removeClass('is-selected');
  },
});

export {
  NavLayout,
  NavList,
};
