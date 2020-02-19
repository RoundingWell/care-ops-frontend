import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import Droplist from 'js/components/droplist';

import './app-nav.scss';

const MainNavDroplist = Droplist.extend({
  popWidth: '248px',
  viewOptions: {
    tagName: 'div',
    className: 'app-nav__header',
    template: hbs`
      <div>
        <h2 class="app-nav__header-title u-text--overflow">{{ orgName }}</h2>
        <span class="app-nav__header-arrow">{{far "angle-down"}}</span>
      </div>
      <div class="u-text--overflow">{{ userName }}</div>
    `,
    templateContext() {
      const currentUser = Radio.request('bootstrap', 'currentUser');
      const currentOrg = Radio.request('bootstrap', 'currentOrg');
      return {
        userName: currentUser.get('name'),
        orgName: currentOrg.get('name'),
      };
    },
  },
  picklistOptions() {
    const currentOrg = Radio.request('bootstrap', 'currentOrg');
    return {
      className: 'picklist app-nav__picklist',
      headingText: currentOrg.get('name'),
      lists: [{
        collection: this.collection,
        itemTemplate: hbs`
          <a{{#if isSelected}} class="is-selected"{{/if}}>
            {{#if isFas}}{{fas icon}}{{else}}{{far icon}}{{/if}}
            {{formatMessage text}}
          </a>`,
      }],
    };
  },
  picklistEvents: {
    'picklist:item:select': 'onSelect',
  },
  onSelect({ model }) {
    model.get('onSelect')();
  },
});

const AppNavView = View.extend({
  className: 'app-nav',
  regions: {
    navMain: {
      el: '[data-nav-main-region]',
      replaceElement: true,
    },
    navContent: '[data-nav-content-region]',
  },
  template: hbs`
    <div data-nav-main-region></div>
    <div class="overflow-y" data-nav-content-region></div>
  `,
  removeSelected() {
    this.$('.is-selected').removeClass('is-selected');
  },
});

const NavItemView = View.extend({
  className: 'app-nav__link',
  tagName: 'a',
  template: hbs`{{formatMessage text role=(role)}}`,
  triggers: {
    'click': 'click',
  },
  modelEvents: {
    'selected': 'onSelected',
  },
  onClick() {
    Radio.trigger('event-router', this.model.get('event'), ...this.model.get('eventArgs'));
  },
  onSelected() {
    this.$el.addClass('is-selected');
  },
  templateContext: {
    role() {
      const clinician = Radio.request('bootstrap', 'currentUser');
      return clinician.getRole().get('name');
    },
  },
});

const AppNavCollectionView = CollectionView.extend({
  childView: NavItemView,
});

const PatientsAppNav = View.extend({
  template: hbs`
    <h3 class="app-nav__search js-search">{{far "search"}}{{ @intl.globals.appNavViews.searchTitle }}</h3>
    <h3 class="app-nav__title">{{ @intl.globals.appNavViews.patientsNav.worklistsTitle }}</h3>
    <div data-worklists-region></div>
  `,
  regions: {
    worklists: '[data-worklists-region]',
  },
  triggers: {
    'click @ui.search': 'search',
  },
  ui: {
    search: '.js-search',
  },
  onSearchActive(isActive) {
    this.ui.search.toggleClass('is-active', isActive);
  },
});

const AdminAppNav = View.extend({
  template: hbs`
    <h3 class="app-nav__title">{{ @intl.globals.appNavViews.adminNav.adminTitle }}</h3>
    <div data-admin-region></div>
  `,
  regions: {
    admin: '[data-admin-region]',
  },
});

export {
  AppNavView,
  AppNavCollectionView,
  MainNavDroplist,
  PatientsAppNav,
  AdminAppNav,
};
