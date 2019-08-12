import Backbone from 'backbone';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import Optionlist from 'js/components/optionlist';

import './app-nav.scss';

const AppNavView = View.extend({
  className: 'app-nav',
  regions: {
    patients: '[data-patients-region]',
    views: '[data-views-region]',
  },
  ui: {
    header: '.js-header',
  },
  triggers: {
    'click @ui.header': 'click:header',
  },
  initialize({ currentOrg }) {
    this.currentOrg = currentOrg;
  },
  template: hbs`
    <div class="app-nav__header js-header">
      <div>
        <h2 class="app-nav__header-title u-text--overflow">{{ orgName }}</h2>
        <span class="app-nav__header-arrow">{{far "angle-down"}}</span>
      </div>
      <div class="u-text--overflow">{{ first_name }} {{ last_name }}</div>
    </div>
    <div class="app-nav__content overflow-y">
      <h3 class="app-nav__title">{{ @intl.globals.appNav.views.title }}</h3>
      <div data-views-region></div>
      <h3 class="app-nav__title">{{ @intl.globals.appNav.patients.title }}</h3>
      <div data-patients-region></div>
    </div>
  `,
  onClickHeader() {
    const optionlist = new Optionlist({
      className: 'picklist app-nav__picklist',
      popWidth: '248px',
      ui: this.ui.header,
      uiView: this,
      headingText: this.currentOrg.get('name'),
      lists: [{
        collection: new Backbone.Collection([{ onSelect() {
          Radio.request('auth', 'logout');
        } }]),
        itemTemplate: hbs`<a>{{fas "sign-out-alt"}} Sign Out</a>`,
      }],
    });

    this.ui.header.addClass('is-selected');

    this.listenTo(optionlist, 'destroy', () => {
      /* istanbul ignore else */
      if (this.isRendered()) this.ui.header.removeClass('is-selected');
    });

    optionlist.show();
  },
  templateContext() {
    return {
      orgName: this.currentOrg.get('name'),
    };
  },
  removeSelected() {
    this.$('.is-selected').removeClass('is-selected');
  },
});

const NavItemView = View.extend({
  className: 'app-nav__link',
  tagName: 'a',
  template: hbs`{{formatMessage (intlGet titleI18nKey) role=(role)}}`,
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
      const clinician = Radio.request('auth', 'currentUser');
      return clinician.getRole().get('name');
    },
  },
});

const AppNavCollectionView = CollectionView.extend({
  childView: NavItemView,
});

export {
  AppNavView,
  AppNavCollectionView,
};
