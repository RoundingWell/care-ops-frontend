import Backbone from 'backbone';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

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
    links: '.js-link',
  },
  triggers: {
    'click @ui.header': 'click:header',
    'click @ui.links': 'click:link',
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
      <div data-views-region>
        <a class="app-nav__link js-link" href="/view/owned-by-me">{{ @intl.globals.appNav.views.ownedByMe }}</a>
        <a class="app-nav__link js-link" href="/view/actions-for-coordinators">{{ @intl.globals.appNav.views.coordinators }}</a>
        <a class="app-nav__link js-link" href="/view/new-actions">{{ @intl.globals.appNav.views.newActions }}</a>
        <a class="app-nav__link js-link" href="/view/updated-past-three-days">{{ @intl.globals.appNav.views.updatedPastThree }}</a>
        <a class="app-nav__link js-link" href="/view/done-last-thirty-days">{{ @intl.globals.appNav.views.doneLastThirty }}</a>
      </div>
      <h3 class="app-nav__title">{{ @intl.globals.appNav.patients.title }}</h3>
      <div data-patients-region>
        <a class="app-nav__link  js-link" href="/patients/all">{{ @intl.globals.appNav.patients.allPatients }}</a>
      </div>
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
      if (this.isRendered()) this.ui.header.removeClass('is-selected');
    });

    optionlist.show();
  },
  onClickLink(view, { target }) {
    Backbone.history.navigate(this.$(target).attr('href'), true);
  },
  templateContext() {
    return {
      orgName: this.currentOrg.get('name'),
    };
  },
});

export {
  AppNavView,
};
