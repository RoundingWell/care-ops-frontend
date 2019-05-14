import 'js/base/setup';
import 'js/config';

import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

import initPlatform from 'js/utils/platform';
import 'js/base/moment';
import App from 'js/base/app';
import RouterApp from 'js/base/routerapp';

import 'js/entities-service';
import ActivityService from 'js/services/activity';
import AlertService from 'js/services/alert';
import HistoryService from 'js/services/history';
import ModalService from 'js/services/modal';
import PopService from 'js/services/pop';

import ErrorApp from 'js/apps/error/error_app';

import 'js/components/datepicker';

import { RootView } from 'js/views/globals/root_views';

const $document = $(document);

const Application = App.extend({
  initialize() {
    initPlatform();
  },

  // Before the application starts make sure:
  // - A root layout is attached
  // - Global services are started
  onBeforeStart() {
    this.setView(new RootView());
    this.startServices();
    this.setListeners();
  },

  startServices() {
    new ActivityService();
    new AlertService({ region: this.getRegion('alert') });
    new ModalService({
      modalRegion: this.getRegion('modal'),
      modalSmallRegion: this.getRegion('modalSmall'),
    });
    new PopService({ region: this.getRegion('pop') });
  },

  setListeners() {
    $(window).on('resize.app', function() {
      Radio.trigger('user-activity', 'window:resize');
    });

    $document.on('keydown.app', function(evt) {
      Radio.trigger('user-activity', 'document:keydown', evt);
    });

    this.setMouseListeners();
  },

  setMouseListeners() {
    $document.on('mouseover.app', function(evt) {
      Radio.trigger('user-activity', 'document:mouseover', evt);
    });

    $document.on('mouseleave.app', function(evt) {
      Radio.trigger('user-activity', 'document:mouseleave', evt);
    });

    $('body').on('mousedown.app touchstart.app', function(evt) {
      Radio.trigger('user-activity', 'body:down', evt);
    });
  },

  //
  // Start all Global Apps and Main Apps
  // Finish with starting the backbone history to kick off the first router
  onStart() {
    // ErrorApp must run first as a catch all
    // Handled routes will over-ride
    new ErrorApp({ region: this.getRegion('error') });

    const TempApp = RouterApp.extend({
      initialize() {
        this.router.route('', 'default', _.noop);
      },
    });

    new TempApp();

    Backbone.history.start({ pushState: true });

    new HistoryService();
  },
});

const app = new Application();

document.addEventListener('DOMContentLoaded', function() {
  app.start();
});

export default app;
