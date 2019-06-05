import _ from 'underscore';
import Backbone from 'backbone';
import { View } from 'marionette';

import hbs from 'handlebars-inline-precompile';

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
  template: hbs`
    <div class="app-nav__header js-header">
      <div>
        <h2 class="app-nav__header-title">Example Memorial</h2>
        <span class="app-nav__header-arrow">{{far "angle-down"}}</span>
      </div>
      <div>User Name</div>
    </div>
    <div class="app-nav__content overflow-y">
      <h3 class="app-nav__title">Views</h3>
      <div data-views-region>
        <a class="app-nav__link">Example View</a>
      </div>
      <h3 class="app-nav__title">Patients</h3>
      <div data-patients-region>
        <a class="app-nav__link">All Patients</a>
        <a class="app-nav__link">Patient's I'm Following</a>
      </div>
    </div>
  `,
  onClickHeader() {
    const optionlist = new Optionlist({
      className: 'picklist app-nav__picklist',
      popWidth: '248px',
      ui: this.ui.header,
      uiView: this,
      headingText: 'Example Memorial',
      lists: [{
        collection: new Backbone.Collection([{ text: 'Sign Out', onSelect: _.noop }]),
        itemTemplate: hbs`<a>{{fas "sign-out-alt"}} {{ text }}</a>`,
      }],
    });

    this.ui.header.addClass('is-selected');

    this.listenTo(optionlist, 'destroy', () => {
      if (this.isRendered()) this.ui.header.removeClass('is-selected');
    });

    optionlist.show();
  },
});

const AppNavHeader = View.extend({
  className: 'app-nav__header-button',
  template: hbs`Example Memorial`,
});

export {
  AppNavView,
  AppNavHeader,
};
