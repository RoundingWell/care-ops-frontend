import 'js/base/setup';
import 'js/config';

import $ from 'jquery';
import Backbone from 'backbone';
import { View } from 'marionette';

import hbs from 'handlebars-inline-precompile';

import 'sass/provider-core.scss';

// I18N needs to be available at the top of the dependency tree
import 'js/i18n';

import initPlatform from 'js/utils/platform';
import 'js/base/moment';
import App from 'js/base/app';

import 'js/entities-service';

import ErrorApp from 'js/apps/error/error_app';

const $document = $(document);

const Application = App.extend({
  initialize() {
    initPlatform();
  },

  //
  // Before the application starts make sure:
  // - A root layout is attached
  // - Global services are started
  //
  // onBeforeStart() {
  //
  // },

  //
  // Start all Global Apps and Main Apps
  // Finish with starting the backbone history to kick off the first router
  //
  onStart() {
    const view = new View({
      el: 'body',
      template: hbs`
        <div style="font-weight: 600">Testing</div>
        <div style="font-family: ProximaSoft; font-weight: 600">Testing</div>
        <div style="font-weight: bold">Testing</div>
        <div style="font-family: ProximaSoft; font-weight: bold">Testing</div>
        {{far "acorn"}}
        {{fas "acorn"}}
      `,
    });
    view.render();

    // ErrorApp must run first as a catch all
    // Handled routes will over-ride
    new ErrorApp();

    Backbone.history.start();

    // new HistoryService();

    // this.showView();
  },
});

const app = new Application();

// jQuery on ready to start the app if logged in
$document.ready(function() {
  app.start();
});

export default app;
