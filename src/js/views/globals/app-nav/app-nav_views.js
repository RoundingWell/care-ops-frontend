import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import Droplist from 'js/components/droplist';

import intl from 'js/i18n';

import './app-nav.scss';

const i18n = intl.globals.appNav.appNavViews;

const MainNavDroplist = Droplist.extend({
  popWidth: '248px',
  position() {
    const { outerHeight } = this.getView().getBounds();

    return {
      top: outerHeight,
      left: 16,
    };
  },
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
    return {
      className: 'picklist app-nav__picklist',
      itemClassName: 'flex flex-align-center app-nav__picklist-item',
      lists: [{
        collection: this.collection,
        itemTemplate: hbs`
          {{fa icon.type icon.icon classes=icon.classes~}}
          <span>{{formatMessage text}}</span>
        `,
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

const AdminToolsDroplist = Droplist.extend({
  popWidth: '248px',
  position() {
    return {
      top: window.innerHeight - 12,
      left: 164,
    };
  },
  viewOptions: {
    tagName: 'div',
    className: 'flex flex-align-center app-nav__bottom-button',
    template: hbs`{{fas "ellipsis"}}{{ @intl.globals.appNav.appNavViews.adminToolsDroplist.adminTools }}`,
  },
  picklistOptions() {
    return {
      className: 'picklist app-nav__picklist',
      itemClassName: 'flex flex-align-center app-nav__picklist-item',
      headingText: intl.globals.appNav.appNavViews.adminToolsDroplist.adminTools,
      lists: [{
        collection: this.collection,
        itemTemplate: hbs`
          {{fa icon.type icon.icon classes=icon.classes~}}
          <span>{{formatMessage text}}</span>
        `,
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
    adminTools: {
      el: '[data-nav-admin-tools-region]',
      replaceElement: true,
    },
  },
  triggers: {
    'click .js-add-patient': 'click:addPatient',
  },
  template: hbs`
    <div data-nav-main-region></div>
    <div class="overflow-y" data-nav-content-region></div>
    <div class="app-nav__bottom">
      {{#if canPatientCreate}}
        <div class="flex flex-align-center app-nav__bottom-button js-add-patient">{{fas "circle-plus"}}{{ @intl.globals.appNav.appNavViews.appNavView.addPatient }}</div>
      {{/if}}
      <div data-nav-admin-tools-region></div>
    </div>
  `,
  templateContext() {
    const currentUser = Radio.request('bootstrap', 'currentUser');
    const hasManualPatientCreate = Radio.request('bootstrap', 'currentOrg:setting', 'manual_patient_creation');

    return {
      canPatientCreate: hasManualPatientCreate && currentUser.can('patients:manage'),
    };
  },
  removeSelected() {
    this.$('.is-selected').removeClass('is-selected');
  },
});

const NavItemView = View.extend({
  tagName: 'a',
  className: 'flex app-nav__link',
  template: hbs`
    <div class="flex flex-align-center app-nav__link-icons">
      {{#each icons}}
        {{fa this.type this.icon classes=this.classes~}}
      {{/each}}
    </div>
    <div class="u-margin--l-16">{{formatMessage text}}</div>
  `,
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
});

const AppNavCollectionView = CollectionView.extend({
  childView: NavItemView,
});

const PatientsAppNav = View.extend({
  template: hbs`
    <h3 class="flex app-nav__search js-search">{{fas "magnifying-glass"}}{{ @intl.globals.appNav.appNavViews.patientsAppNav.searchTitle }}</h3>
    <h3 class="app-nav__title">{{ @intl.globals.appNav.appNavViews.patientsAppNav.worklistsTitle }}</h3>
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
    /* istanbul ignore if: No need to test safeguard */
    if (this.isDestroyed()) return;
    this.ui.search.toggleClass('is-active', isActive);
  },
});

export {
  AppNavView,
  AppNavCollectionView,
  MainNavDroplist,
  PatientsAppNav,
  AdminToolsDroplist,
  i18n,
};
